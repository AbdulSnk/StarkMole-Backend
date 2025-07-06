import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema()
export class Setting {
  @Prop({ required: true, unique: true })
  key: string; 

  @Prop({ type: Object, required: true }) 
  value: any;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);