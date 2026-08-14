import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },

  category: {
    type: String,
    default: "unknown"
  },

  type: {
    type: String
  },

  description: {
    type: String
  },

  imageUrl: {
    type: String
  },

  address: {
    type: String
  },

  // ✅ ADD THIS
  priority: {
    type: String
  },

  // ✅ ADD THIS
  priorityScore: {
    type: Number
  },

  status: {
    type: String,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

/*const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
*/
let Complaint;

if (mongoose.models.Complaint) {
  Complaint = mongoose.models.Complaint;
} else {
  Complaint = mongoose.model("Complaint", complaintSchema);
}

console.log("🔥 NEW SCHEMA LOADED");

export default Complaint;
