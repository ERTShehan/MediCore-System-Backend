import mongoose, { Document, Schema } from "mongoose";

export interface IVisit extends Document {
  patientName: string;
  age: number;
  phone: string;
  appointmentNumber: number;
  status: "pending" | "in_progress" | "completed";
  date: Date;
}

const VisitSchema = new Schema<IVisit>({
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  appointmentNumber: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed'], 
    default: 'pending' 
  },
  date: { type: Date, default: Date.now }
});

export const Visit = mongoose.model<IVisit>("Visit", VisitSchema);