import { Request, Response } from "express";
import { IUser, Role, User } from "../models/user.model";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../utils/tokens";
import { AuthRequest } from "../middleware/auth";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary";
import { sendEmail } from "../utils/email";

// Register Doctor (Public)
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


// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = (await User.findOne({ email })) as IUser | null;

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
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

//  Refresh Token
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

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.sub;
    const { name, clinicName, clinicAddress } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update Text Fields
    user.name = name || user.name;
    user.clinicName = clinicName || user.clinicName;
    user.clinicAddress = clinicAddress || user.clinicAddress;

    // Handle Image Upload to Cloudinary
    if (req.file) {
      // Convert buffer to base64 for Cloudinary upload
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const uploadRes = await cloudinary.uploader.upload(dataURI, {
        folder: "medicore_profiles",
      });
      
      user.profileImage = uploadRes.secure_url;
    }

    await user.save();
    
    const updatedUser = await User.findById(userId).select("-password -otp -otpExpires");
    res.status(200).json({ message: "Profile updated", data: updatedUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.sub;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password" });
  }
};

// Send OTP
export const sendForgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    // Check Role (Must be DOCTOR)
    // if (!user.roles.includes(Role.DOCTOR)) {
    //   return res.status(403).json({ message: "Access denied. Only Doctors can reset passwords remotely. Please contact doctor." });
    // }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    await sendEmail(
      email, 
      "MediCore Password Reset OTP", 
      `Your password reset code is: ${otp}. It expires in 10 minutes.`
    );

    res.status(200).json({ message: "OTP sent to your email address." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP email." });
  }
};

// Reset Password with OTP
export const resetPasswordWithOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ 
      email, 
      otp, 
      otpExpires: { $gt: Date.now() }
    }).select("+otp +otpExpires");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // if (!user.roles.includes(Role.DOCTOR)) {
    //   return res.status(403).json({ message: "Unauthorized action." });
    // }

    // Reset Password
    user.password = await bcrypt.hash(newPassword, 10);
    
    user.otp = undefined;
    user.otpExpires = undefined;
    
    await user.save();

    res.status(200).json({ message: "Password reset successful. Please login." });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password." });
  }
};

//  Get Profile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user.sub).select("-password -otp -otpExpires");
  res.status(200).json({ data: user });
};