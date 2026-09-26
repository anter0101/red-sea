import { PartialType } from '@nestjs/swagger';
import { CreateJourneyAttachmentDTO } from './create-journey-attachment.dto';

export class UpdateJourneyAttachmentDTO extends PartialType(CreateJourneyAttachmentDTO) {}
