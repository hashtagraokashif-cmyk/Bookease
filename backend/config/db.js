import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI =
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/appointment_booking";

  const connection = await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB Connected: ${connection.connection.host}`);
};

export default connectDB;