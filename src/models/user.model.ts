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
  doctorId?: mongoose.Types.ObjectId;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: { type: [String], enum: Object.values(Role), default: [Role.DOCTOR] },
  isActive: { type: Boolean, default: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
});

export const User = mongoose.model<IUser>("User", userSchema);