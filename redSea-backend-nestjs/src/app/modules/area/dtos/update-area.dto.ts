import { PartialType } from '@nestjs/swagger';
import { CreateAreaDTO } from './create-area.dto';

export class UpdateAreaDTO extends PartialType(CreateAreaDTO) {}
