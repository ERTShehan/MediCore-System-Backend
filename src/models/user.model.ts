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
  paymentStatus: "paid" | "unpaid";
  doctorId?: mongoose.Types.ObjectId;

  clinicName?: string;
  clinicAddress?: string;
  profileImage?: string;

  otp?: string;
  otpExpires?: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: { type: [String], enum: Object.values(Role), default: [Role.DOCTOR] },
  isActive: { type: Boolean, default: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "User", default: null },

  paymentStatus: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },

  clinicName: { type: String, default: "" },
  clinicAddress: { type: String, default: "" },
  profileImage: { type: String, default: "" },

  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
});

export const User = mongoose.model<IUser>("User", userSchema);