import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
dotenv.config();

const PORT = process.env.PORT
const MONGO_URL = process.env.MONGO_URL as string

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:5173"],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    })
)

app.use('/api/auth', authRoutes)

mongoose
    .connect(MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});