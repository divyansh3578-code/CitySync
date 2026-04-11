import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("xxxxxxx");
    console.log("MongoDB connected 🚀");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
