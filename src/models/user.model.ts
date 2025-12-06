import mongoose, { Document, Schema } from "mongoose";

export enum Role {
  DOCTOR = "doctor",
  COUNTER = "counter",
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  roles: Role[];
  isActive: boolean;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: { type: [String], enum: Object.values(Role), default: [Role.DOCTOR] },
  isActive: { type: Boolean, default: true },
});

export const User = mongoose.model<IUser>("User", userSchema);