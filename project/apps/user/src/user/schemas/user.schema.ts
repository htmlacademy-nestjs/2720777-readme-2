import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '@project/shared/app/types';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    required: true,
    type: String,
    enum: UserRole,
    default: UserRole.User,
  })
  role!: UserRole;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ required: true, type: [String], default: [] })
  subscriptions!: string[];

  @Prop({ required: true, type: [String], default: [] })
  subscribers!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
