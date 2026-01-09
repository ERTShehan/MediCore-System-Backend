import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRouter from "./routes/auth";
import staffRouter from "./routes/staff";
import visitRouter from "./routes/visits";
import templateRouter from "./routes/templates";
import paymentRouter from "./routes/payment";

dotenv.config();

const app = express();
app.use(express.json());

// notify awanne form data widiyata
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ["http://localhost:5173", "https://medicore-ashy.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/visits", visitRouter);
app.use("/api/v1/templates", templateRouter);
app.use("/api/v1/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("BE running")
})

mongoose
  .connect(process.env.MONGO_URL as string)
  .then(() => {
    console.log("DB connected");
    app.listen(process.env.PORT, () => console.log("Server running", process.env.PORT));
  })
  .catch((err) => console.error(err));