import Complaint from "../models/complaint.js";
import getRoadwaysPriority from "../utils/roadwaysPriority.js";

export const createComplaint = async (data) => {
  try {
    const {
      description,
      image,
      category,
      address
    } = data;

    // 🚧 For now, we are handling ROADWAYS only
    const department = "ROADWAYS";

    // 🔤 Normalize inputs
    const normalizedCategory = category.toUpperCase();
    const normalizedAddress = address.trim().toLowerCase();

    // 🔁 Frequency calculation (VERY IMPORTANT)
    const frequency = await Complaint.countDocuments({
      category: normalizedCategory,
      address: normalizedAddress,
      department
    });

    // ⚡ Priority calculation
    const priority = getRoadwaysPriority(
      normalizedCategory,
      frequency + 1 // include current complaint
    );

    // 💾 Create complaint
    const newComplaint = new Complaint({
      description,
      image,
      category: normalizedCategory,
      address: normalizedAddress,
      department,
      priority
    });

    await newComplaint.save();

    return {
      message: "Complaint created successfully",
      complaint: newComplaint,
      priority,
      frequency: frequency + 1
    };

  } catch (error) {
    throw new Error(error.message);
  }
};
