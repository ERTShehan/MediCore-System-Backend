import mongoose, { Document, Schema } from "mongoose";

interface IOrder extends Document {
    order_id: string;
    userId: mongoose.Types.ObjectId;
    amount: number;
    status: "PENDING" | "SUCCESS" | "FAILED" | "CHARGED_BACK";
    createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    order_id: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ["PENDING", "SUCCESS", "FAILED", "CHARGED_BACK"], 
        default: "PENDING" 
    },
    createdAt: { type: Date, default: Date.now }
})

export const Order = mongoose.model<IOrder>("Order", OrderSchema);