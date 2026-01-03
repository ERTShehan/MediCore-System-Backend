import mongoose, { Document, Schema } from "mongoose";

export interface IPrescriptionTemplate extends Document {
  name: string;
  imageUrl?: string;
  doctorId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TemplateSchema = new Schema<IPrescriptionTemplate>({
  name: { type: String, required: true },
  imageUrl: { type: String, default: null },
  doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

TemplateSchema.index({ name: 1, doctorId: 1 });

export const PrescriptionTemplate = mongoose.model<IPrescriptionTemplate>("PrescriptionTemplate", TemplateSchema);