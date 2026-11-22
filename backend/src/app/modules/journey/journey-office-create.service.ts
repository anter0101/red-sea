import { ClientService } from '../factory/client.service';
import { JourneyTransactionService } from '../journey-transaction/journey-transaction.service';
import { JourneyTransaction } from '../journey-transaction/journey-transaction.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { UserRole } from 'src/core/enums/user-role';
import { JourneyService } from './journey.service';
import { JourneyAssetsService } from './journey-assets.service';
import { CreateJourneyDTO } from './dtos/create-journey.dto';
import { UpdateJourneyDTO } from './dtos/update-journey.dto';
import { mapCreateJourneyDtoToEntity } from './journey.mapper';
import { UserService } from '../user/user.service';
import { JourneyTransactionType, JourneyTransactionCategoryType } from 'src/core/enums/journey';
import { EmployeeService } from '../employee/employee.service';
import { EntityManager } from 'typeorm';
import { Account } from '../account/account.entity';
import { AccountService } from '../account/account.service';
import { AccountActorType, AccountSystemKey } from '../account/account-system-keys';
import { JourneyVehicleMode } from 'src/core/enums/journey-vehicle-mode';
import { Supplier } from '../supplier/supplier.entity';
import { SupplierType } from '../supplier/enums/supplier-type.enum';
import { Journey } from './journey.entity';
import { CustodyService } from '../custody/custody.service';
import { CustodyStatus } from 'src/core/enums/custody-status';
import { Custody } from '../custody/custody.entity';
import { Driver } from '../driver/driver.entity';
import { Employee } from '../employee/employee.entity';
import { Area } from '../area/area.entity';
import {
  ACCOUNT_PARENT_CUSTODY,
  PERSON_ACCOUNT_PARENTS,
  buildPersonAccountName,
} from '../account/person-account.constants';
import { JourneyDelegationPrintService } from '../journey-delegation-print/journey-delegation-print.service';

@Injectable()
export class JourneyOfficeCreateService {
  constructor(
    private readonly journeyService: JourneyService,
    private readonly journeyAssetsService: JourneyAssetsService,
    private readonly UserService: UserService,
    private readonly clientService: ClientService,
    @Inject(forwardRef(() => EmployeeService))
    private readonly employeeService: EmployeeService,
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => CustodyService))
    private readonly custodyService: CustodyService,
    private readonly journeyTransactionService: JourneyTransactionService,
    private readonly journeyDelegationPrintService: JourneyDelegationPrintService,
  ) {}

  /**
   * Creates an office journey inside the given transaction. Callers own the transaction,
   * so the journey can be saved together with other rows (for example its policy).
   */
  async createInTransaction(
    dto: CreateJourneyDTO,
    user: any,
    manager: EntityManager,
  ): Promise<Journey> {
    const resolvedAssets = await this.journeyAssetsService.resolveForCreate(
      dto,
      manager,
      user?.email,
    );
    dto.driverId = resolvedAssets.driverId;
    dto.carId = resolvedAssets.carId;
    dto.trailerId = resolvedAssets.trailerId;
    await this.validateJourneyReferences(dto);

    const emp = await this.resolveCustodyEmployee(dto, user, manager);

    const driver = await manager.findOne(Driver, {
      where: { id: dto.driverId },
      relations: ['user'],
    });

    if (!driver) {
      throw new NotFoundException(`Driver with id ${dto.driverId} not found`);
    }

    const paysTransportSupplier =
      dto.vehicleMode === JourneyVehicleMode.NOLON_CAR ||
      dto.vehicleMode === JourneyVehicleMode.CONTRACT_CAR;
    const transportSupplier = paysTransportSupplier
      ? await this.resolveTransportSupplier(dto.transportSupplierId, emp, manager)
      : null;

    const entity = mapCreateJourneyDtoToEntity(dto);
    entity.custodySource = emp;
    if (transportSupplier) entity.transportSupplier = transportSupplier;
    if (dto.deliveryAreaId) {
      const area = await manager.findOne(Area, {
        where: { id: dto.deliveryAreaId },
        relations: ['government'],
      });
      if (area) {
        entity.deliveryArea = area;
        entity.deliveryGov = area.government;
      }
    }
    const savedJourney = await this.journeyService.save(entity, user?.email, manager);

    if (dto.custodyAmount && dto.custodyAmount > 0) {
      const txEntity = new JourneyTransaction();
      txEntity.journey = savedJourney;
      txEntity.transactionType = JourneyTransactionType.ADVANCE;
      txEntity.category = JourneyTransactionCategoryType.CUSTODY;
      txEntity.amount = dto.custodyAmount;
      await this.journeyTransactionService.save(txEntity, user?.email, manager);

      const empAccount = await this.accountService.findPersonSubAccount(
        buildPersonAccountName(emp.user.firstName, emp.user.lastName, `Employee ${emp.id}`),
        ACCOUNT_PARENT_CUSTODY,
        manager,
      );

      if (transportSupplier) {
        await this.accountService.createSupplierAccount(
          transportSupplier.id,
          transportSupplier.name,
          user?.email,
          manager,
        );
        const supplierAccount = await this.accountService.findActorLeaf(
          AccountSystemKey.TRANSPORT_SUPPLIER,
          AccountActorType.TRANSPORT_SUPPLIER,
          transportSupplier.id,
          manager,
        );
        if (!supplierAccount) {
          throw new BadRequestException('حساب مورد النقل غير موجود.');
        }
        await this.accountService.custodyMovement(
          empAccount,
          supplierAccount,
          dto.custodyAmount,
          manager,
        );
      } else {
        await this.giveCustodyToDriver(
          emp,
          empAccount,
          driver,
          savedJourney,
          dto.custodyAmount,
          user?.email,
          manager,
        );
      }
    }

    await this.journeyDelegationPrintService.createForJourney(
      savedJourney.id,
      manager,
      user?.email,
    );

    return savedJourney;
  }

  /**
   * The employee whose custody funds the journey. Admins pick the office and employee in the form
   * (they usually have no employee record of their own); everyone else always uses their own.
   */
  private async resolveCustodyEmployee(
    dto: CreateJourneyDTO,
    user: any,
    manager: EntityManager,
  ): Promise<Employee> {
    const isAdmin = (String(user?.role ?? '').toUpperCase() as UserRole) === UserRole.ADMIN;

    if (isAdmin) {
      if (!dto.custodyEmployeeId) {
        throw new BadRequestException('اختر المكتب والموظف اللي هتتصرف العهدة منه.');
      }
      const chosen = await manager.findOne(Employee, {
        where: { id: dto.custodyEmployeeId },
        relations: ['user', 'branch'],
      });
      if (!chosen) {
        throw new NotFoundException(`Employee with id ${dto.custodyEmployeeId} not found`);
      }
      return chosen;
    }

    const emp = await manager.findOne(Employee, {
      where: { user: { id: user.id } },
      relations: ['user', 'branch'],
    });
    if (!emp) {
      throw new NotFoundException(`Employee with user id ${user.id} not found`);
    }
    return emp;
  }

  private async resolveTransportSupplier(
    supplierId: number | undefined,
    emp: Employee,
    manager: EntityManager,
  ): Promise<Supplier> {
    if (!supplierId) {
      throw new BadRequestException('مورد النقل مطلوب للنولون والعقد.');
    }
    const supplier = await manager.findOne(Supplier, {
      where: { id: supplierId },
      relations: ['branch'],
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${supplierId} not found`);
    }
    if (supplier.type !== SupplierType.TRANSPORTATION) {
      throw new BadRequestException('المورد المختار ليس مورد نقل.');
    }
    if (emp.branch?.id && supplier.branch?.id && supplier.branch.id !== emp.branch.id) {
      throw new BadRequestException('مورد النقل مش تابع لفرع الموظف.');
    }
    return supplier;
  }

  private async giveCustodyToDriver(
    emp: Employee,
    empAccount: Account,
    driver: Driver,
    journey: Journey,
    amount: number,
    creator: string | undefined,
    manager: EntityManager,
  ): Promise<void> {
    const driverName = buildPersonAccountName(
      driver.user.firstName,
      driver.user.lastName,
      `Driver ${driver.id}`,
    );
    await this.accountService.createPersonSubAccounts(
      driverName,
      PERSON_ACCOUNT_PARENTS[UserRole.DRIVER]!,
      creator,
      manager,
    );

    const driverAccount = await this.accountService.findPersonSubAccount(
      driverName,
      ACCOUNT_PARENT_CUSTODY,
      manager,
    );

    await this.accountService.custodyMovement(empAccount, driverAccount, amount, manager);

    const custody = new Custody();
    custody.employee = emp;
    custody.account = driverAccount;
    custody.journey = journey;
    custody.driver = driver;
    custody.status = CustodyStatus.ACTIVE;
    await this.custodyService.save(custody, creator, manager);
  }

  async validateJourneyReferences(dto: CreateJourneyDTO | UpdateJourneyDTO): Promise<void> {
    if (dto.driverAssistantId !== undefined) {
      const assistant = await this.UserService.findByFields({
        where: { id: dto.driverAssistantId, role: UserRole.DRIVER_ASSISTANT },
      });
      if (!assistant) {
        throw new NotFoundException(`Assistant driver with id ${dto.driverAssistantId} not found`);
      }
    }

    if (dto.clientId !== undefined) {
      const client = await this.clientService.findById(dto.clientId);
      if (!client) {
        throw new NotFoundException(`Client with id ${dto.clientId} not found`);
      }
    }
  }
}
