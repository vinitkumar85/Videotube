import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IVideo extends Document {
  path: string;
  VideoTitle: string;
  UserID: string;
}

@Schema()
export class Video {
  @Prop({ required: true })
  path: string;

  @Prop()
  VideoTitle?: string;

  @Prop()
  Category?: string;

  @Prop()
  Description?: string;

  @Prop()
  UploadedTime?: string;

  @Prop({ required: true })
  UserID: string;

  @Prop()
  likes?: string[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);
