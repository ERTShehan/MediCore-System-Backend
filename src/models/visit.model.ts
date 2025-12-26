import mongoose, { Document, Schema } from "mongoose";

export interface IVisit extends Document {
  patientName: string;
  age: number;
  phone: string;
  appointmentNumber: number;
  visitType: "regular" | "emergency";
  status: "pending" | "in_progress" | "completed";
  diagnosis: string;
  prescription: string;
  date: Date;
  doctorId: mongoose.Types.ObjectId;
}

const VisitSchema = new Schema<IVisit>({
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  appointmentNumber: { type: Number, required: true },
  visitType: { 
    type: String, 
    enum: ['regular', 'emergency'], 
    default: 'regular' 
  },
  
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },

  diagnosis: { type: String, default: "" },
  prescription: { type: String, default: "" },
  
  date: { type: Date, default: Date.now },
  doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true }
});

VisitSchema.index({ date: 1, doctorId: 1, appointmentNumber: 1 });

export const Visit = mongoose.model<IVisit>("Visit", VisitSchema);