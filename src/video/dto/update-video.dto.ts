import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoDto } from './create-video.dto';
export class UpdateStudentDto extends PartialType(CreateVideoDto) {}
