import { UserRole } from 'src/core/enums/user-role';
import { SupplierController } from './supplier.controller';

const rolesOf = (handler: keyof SupplierController): UserRole[] =>
  Reflect.getMetadata('roles', SupplierController.prototype[handler]) as UserRole[];

describe('SupplierController roles', () => {
  it('lets DATA_ENTRY list suppliers (office policy form supplier picker)', () => {
    expect(rolesOf('getAllSuppliers')).toEqual(
      expect.arrayContaining([UserRole.ADMIN, UserRole.USER, UserRole.DATA_ENTRY]),
    );
  });

  it.each(['getSupplierById', 'create', 'update', 'delete'] as const)(
    'keeps %s admin only',
    (handler) => {
      expect(rolesOf(handler)).toEqual([UserRole.ADMIN]);
    },
  );
});
