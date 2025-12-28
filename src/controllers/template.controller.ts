import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrescriptionTemplate } from "../models/template.model";

// Search Image from Google Custom Search API
export const searchMedicineImage = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;
    
    // Google Custom Search API URL
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(data.error.code).json({ 
          message: "Google API Error", 
          details: data.error.message 
      });
    }

    if (data.items && data.items.length > 0) {
      // Return the first image link
      return res.status(200).json({ imageUrl: data.items[0].link });
    } else {
      return res.status(404).json({ message: "No image found" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching image from Google" });
  }
};

// Save with Image OR Only Name
export const addTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, imageUrl } = req.body; // imageUrl can be null or a valid URL
    const doctorId = req.user.sub;

    if (!name) {
      return res.status(400).json({ message: "Template name is required" });
    }

    const newTemplate = await PrescriptionTemplate.create({
      name,
      imageUrl: imageUrl || null, // If user clicked "Only Save Name", this will be null
      doctorId
    });

    res.status(201).json({ message: "Template saved successfully", data: newTemplate });
  } catch (err) {
    res.status(500).json({ message: "Error saving template" });
  }
};

export const getMyTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.user.sub;
    
    // Fetch templates sorted by newest first
    const templates = await PrescriptionTemplate.find({ doctorId }).sort({ createdAt: -1 });

    res.status(200).json({ data: templates });
  } catch (err) {
    res.status(500).json({ message: "Error fetching templates" });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.sub;

    const deleted = await PrescriptionTemplate.findOneAndDelete({ _id: id, doctorId });

    if (!deleted) {
      return res.status(404).json({ message: "Template not found or unauthorized" });
    }

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting template" });
  }
};