import { IsString } from 'class-validator';
export class CreateVideoDto {
  @IsString()
  likes: string;
  path: string;
  VideoTitle: string;
  Category: string;
  UserID: string;
  Description: string;
}
