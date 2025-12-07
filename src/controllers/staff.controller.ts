import { Request, Response } from "express";
import { User, Role } from "../models/user.model";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth";

// 1. Create Counter Staff (Linked to Logged-in Doctor)
export const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const doctorId = req.user.sub;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hash,
      roles: [Role.COUNTER],
      doctorId: doctorId,
      isActive: true
    });

    res.status(201).json({ message: "Staff member created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Get All Staff (Only belonging to the logged-in Doctor)
export const getMyStaff = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user.sub;
    
    // Find users who are COUNTER role AND linked to this Doctor
    const staff = await User.find({ 
        doctorId: doctorId, 
        roles: Role.COUNTER 
    }).select("-password");

    res.status(200).json({ data: staff });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Update Staff Details
export const updateStaff = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // Staff ID
        const { name, email } = req.body;
        const doctorId = req.user.sub;

        const staff = await User.findOne({ _id: id, doctorId: doctorId });
        if (!staff) return res.status(404).json({ message: "Staff not found or unauthorized" });

        staff.name = name || staff.name;
        staff.email = email || staff.email;
        
        await staff.save();
        res.status(200).json({ message: "Staff updated successfully", data: staff });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// 4. Delete Staff
export const deleteStaff = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const doctorId = req.user.sub;

        // Ensure we only delete staff belonging to this doctor
        const deleted = await User.findOneAndDelete({ _id: id, doctorId: doctorId });

        if (!deleted) return res.status(404).json({ message: "Staff not found or unauthorized" });

        res.status(200).json({ message: "Staff deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// 5. Toggle Status (Active / Inactive)
export const toggleStaffStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const doctorId = req.user.sub;

        const staff = await User.findOne({ _id: id, doctorId: doctorId });
        if (!staff) return res.status(404).json({ message: "Staff not found" });

        staff.isActive = !staff.isActive;
        await staff.save();

        res.status(200).json({ 
            message: `Staff marked as ${staff.isActive ? 'Active' : 'Inactive'}`, 
            data: staff 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};