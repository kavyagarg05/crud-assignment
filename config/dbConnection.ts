import mongoose from "mongoose";

const DB_URI = "mongodb://localhost:27017/mydatabase";

export async function connectToDatabase() {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

export default mongoose;
