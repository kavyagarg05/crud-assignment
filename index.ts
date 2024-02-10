import express, { Application, Request, Response } from "express";
import { connectToDatabase } from "./config/dbConnection";
import dotenv from "dotenv";
import userRoute from "./routes/userRoutes";
import contactRoute from "./routes/contactRoutes";
// import nodemailer from "nodemailer";

dotenv.config();

const app: Application = express();

const port: number = parseInt(process.env.PORT || "5000");

app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/contacts", contactRoute);
app.use("*", (_req: Request, res: Response) => {
  return res.status(400).json({
    success: false,
    error: "URL not found",
  });
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectToDatabase();
});
