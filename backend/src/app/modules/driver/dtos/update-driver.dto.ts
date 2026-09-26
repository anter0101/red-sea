import { PartialType } from '@nestjs/swagger';
import { DriverDTO } from './driver.dto';

export class UpdateDriverDTO extends PartialType(DriverDTO) {}
