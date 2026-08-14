


import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://parth_db_user:Nepalimadarchod123@cluster0.f9fj7y2.mongodb.net/citysync?retryWrites=true&w=majority");
    console.log("MongoDB connected ");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
