import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173"] })); // Allow Frontend

app.use("/api/v1/auth", authRouter);

mongoose
  .connect(process.env.MONGO_URL as string)
  .then(() => {
    console.log("DB connected");
    app.listen(process.env.PORT, () => console.log("Server running", process.env.PORT));
  })
  .catch((err) => console.error(err));