import { Request, Response } from "express";
import { IUser, Role, User } from "../models/user.model";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../utils/tokens";
import { AuthRequest } from "../middleware/auth";
import jwt from "jsonwebtoken";

// 1. Register Doctor (Public)
export const registerDoctor = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmationId } = req.body;

    if (confirmationId !== process.env.DOCTOR_CONFIRMATION_ID) {
      return res.status(403).json({ message: "Invalid Confirmation ID" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      roles: [Role.DOCTOR],
    });

    res.status(201).json({ message: "Doctor registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Register Counter (Doctor Only)
export const registerCounter = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email exists" });

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hash,
      roles: [Role.COUNTER],
    });

    res.status(201).json({ message: "Counter staff registered" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = (await User.findOne({ email })) as IUser | null;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.status(200).json({
      message: "success",
      data: { 
          email: user.email, 
          roles: user.roles, 
          accessToken, 
          refreshToken 
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    const user = await User.findById(payload.sub);

    if (!user) return res.status(403).json({ message: "Invalid token" });

    const accessToken = signAccessToken(user);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// 5. Get Profile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user.sub).select("-password");
  res.status(200).json({ data: user });
};