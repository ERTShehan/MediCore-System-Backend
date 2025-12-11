import { Request, Response } from "express";
import { Visit } from "../models/visit.model";
import { User, Role } from "../models/user.model";
import { AuthRequest } from "../middleware/auth";

const getStartAndEndOfDay = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// Create Visit (Counter)
export const createVisit = async (req: AuthRequest, res: Response) => {
  try {
    const { patientName, age, phone } = req.body;
    
    const user = await User.findById(req.user.sub);
    if (!user || !user.doctorId) {
        return res.status(400).json({ message: "Counter staff must be linked to a doctor." });
    }
    const doctorId = user.doctorId;

    const { start, end } = getStartAndEndOfDay();

    const count = await Visit.countDocuments({
      doctorId: doctorId,
      date: { $gte: start, $lte: end },
    });
    
    const appointmentNumber = count + 1;

    const newVisit = await Visit.create({
      patientName,
      age,
      phone,
      appointmentNumber,
      status: 'pending',
      doctorId: doctorId,
      date: new Date()
    });

    res.status(201).json(newVisit);
  } catch (err) {
    res.status(500).json({ message: "Error registering patient" });
  }
};

// Doctor: "Request Patient"
export const requestNextPatient = async (req: AuthRequest, res: Response) => {
    try {
        const doctorId = req.user.sub;
        const { start, end } = getStartAndEndOfDay();

        const existingInProgress = await Visit.findOne({
            doctorId,
            date: { $gte: start, $lte: end },
            status: "in_progress"
        });

        if (existingInProgress) {
            return res.status(200).json(existingInProgress);
        }

        const nextPatient = await Visit.findOne({
            doctorId,
            date: { $gte: start, $lte: end },
            status: 'pending'
        }).sort({ appointmentNumber: 1 });

        if (!nextPatient) {
            return res.status(404).json({ message: "No patients in the queue" });
        }

        nextPatient.status = 'in_progress';
        await nextPatient.save();

        res.status(200).json(nextPatient);
    } catch (err) {
        res.status(500).json({ message: "Error requesting patient" });
    }
};

// Doctor: Submit Treatment
export const submitTreatment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { diagnosis, prescription } = req.body;

        const visit = await Visit.findById(id);
        if (!visit) return res.status(404).json({ message: "Visit not found" });

        visit.diagnosis = diagnosis;
        visit.prescription = prescription;
        visit.status = 'completed';
        
        await visit.save();

        res.status(200).json({ message: "Treatment submitted successfully", data: visit });
    } catch (err) {
        res.status(500).json({ message: "Error submitting treatment" });
    }
};

// Doctor: Get Patient History
export const getPatientHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { phone } = req.params;
        const doctorId = req.user.sub;

        const history = await Visit.find({
            doctorId: doctorId,
            phone: phone,
            status: 'completed'
        }).sort({ date: -1 });

        res.status(200).json({ data: history });
    } catch (err) {
        res.status(500).json({ message: "Error fetching history" });
    }
};

// Counter: Get Queue Status (Includes Total Count)
export const getQueueStatus = async (req: AuthRequest, res: Response) => {
    try {
        let doctorId = req.user.sub;
        
        if (req.user.roles.includes(Role.COUNTER)) {
            const user = await User.findById(req.user.sub);
            if (user && user.doctorId) doctorId = user.doctorId.toString();
        }

        const { start, end } = getStartAndEndOfDay();

        // 1. Get Total Count for Today (All statuses: pending, in_progress, completed)
        const totalToday = await Visit.countDocuments({
            doctorId: doctorId,
            date: { $gte: start, $lte: end }
        });

        // 2. Get Current Patient
        const current = await Visit.findOne({
            doctorId: doctorId,
            date: { $gte: start, $lte: end },
            status: 'in_progress'
        });

        // 3. Get Completed List
        const completed = await Visit.find({
            doctorId: doctorId,
            date: { $gte: start, $lte: end },
            status: 'completed'
        }).sort({ appointmentNumber: -1 });

        res.status(200).json({
            currentPatient: current,
            completedList: completed,
            totalToday: totalToday
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching queue status" });
    }
};

// Counter: Get Single Visit Details
export const getVisitDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const visit = await Visit.findById(id);
        res.status(200).json(visit);
    } catch (err) {
        res.status(500).json({ message: "Error fetching details" });
    }
};