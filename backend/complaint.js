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
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  address: {
  type: String
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

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
