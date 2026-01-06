import { Request, Response } from "express";
import crypto from "crypto";
import { AuthRequest } from "../middleware/auth";
import { Order } from "../models/pay.model";
import { User } from "../models/user.model";

// Payment (Generates Hash)
export const initiatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.sub;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const amount = 20000;
    const order_id = `MEDICORE-${Date.now()}`; // Unique Order ID
    const currency = "LKR";
    
    // Save Order as PENDING
    await Order.create({
      order_id,
      userId,
      amount,
      status: "PENDING"
    });

    const merchant_id = process.env.PAYHERE_MERCHANT_ID!;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET!;
    const formattedAmount = amount.toFixed(2);

    // Hash Generation Logic
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchant_secret)
      .digest("hex")
      .toUpperCase();

    const hash = crypto
      .createHash("md5")
      .update(merchant_id + order_id + formattedAmount + currency + hashedSecret)
      .digest("hex")
      .toUpperCase();

    const paymentData = {
      sandbox: true, 
      merchant_id: merchant_id,
      notify_url: process.env.PAYHERE_NOTIFY_URL,
      order_id: order_id,
      items: "MediCore Subscription Fee",
      amount: formattedAmount,
      currency: currency,
      hash: hash,
      first_name: user.name.split(' ')[0] || user.name,
      last_name: user.name.split(' ').slice(1).join(' ') || "Doctor",
      email: user.email,
      phone: "0771234567",
      address: user.clinicAddress || "No Address Provided",
      city: "Colombo",
      country: "Sri Lanka",
    };

    res.status(200).json(paymentData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error initiating payment" });
  }
};

// PayHere Notify (Webhook)
export const handleNotify = async (req: Request, res: Response) => {
    try {
        console.log("PayHere Notification Received:", req.body);

        const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET!;
        const {
            merchant_id,
            order_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig
        } = req.body;

        // Verify Signature locally
        const localMd5Sig = crypto
            .createHash("md5")
            .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + crypto.createHash("md5").update(merchant_secret).digest("hex").toUpperCase())
            .digest("hex")
            .toUpperCase();

        if (localMd5Sig !== md5sig) {
            console.error("Signature verification failed");
            return res.status(400).send("Signature verification failed");
        }

        // Success
        if (status_code === "2") {
            // Update Order Status
            const order = await Order.findOneAndUpdate(
                { order_id }, 
                { status: "SUCCESS" },
                { new: true }
            );

            if (order) {
                // Update User Payment Status to 'paid'
                await User.findByIdAndUpdate(order.userId, { paymentStatus: "paid" });
                console.log(`User ${order.userId} marked as PAID.`);
            }
        } else {
             // Failed or Canceled
             await Order.findOneAndUpdate({ order_id }, { status: "FAILED" });
        }

        res.sendStatus(200); // Acknowledge PayHere

    } catch (err) {
        console.error("Notify Error:", err);
        res.sendStatus(500);
    }
};

// Manual Update (For Development/Localhost)
export const verifyPaymentManual = async (req: AuthRequest, res: Response) => {
  try {
    const { order_id } = req.body;

    const order = await Order.findOneAndUpdate(
      { order_id },
      { status: "SUCCESS" },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    await User.findByIdAndUpdate(order.userId, { paymentStatus: "paid" });

    res.status(200).json({ message: "Payment verified and updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
};