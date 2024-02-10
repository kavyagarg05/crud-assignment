import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendOtpOnEmail = async (data: any, subject: string) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: data.email,
    subject,
    text: `Your verification OTP is ${data.otp}`,
  };

  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      console.log(error.message);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

interface CustomRequest extends Request {
  user?: {
    username: string;
    email: string;
    _id: string;
  };
}

//@desc Register the user
//@route POST /api/users/register
//@access public
const registerUser = async (req: CustomRequest, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new Error("All fields are mandatory");
    }

    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
      throw new Error("User already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password----->", hashedPassword);

    const otp: number = Math.floor(1000 + Math.random() * 9000);

    await sendOtpOnEmail({ otp, email }, "Verification OTP");

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      otp,
    });

    await newUser.save();

    const accessToken = jwt.sign(
      {
        user: {
          username: newUser.username,
          email: newUser.email,
          _id: newUser._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "10h" }
    );

    if (newUser) {
      return res.status(200).json({
        success: true,
        _id: newUser._id,
        email: newUser.email,
        otp,
        message: "Submit the OTP",
        accessToken,
      });
    } else {
      throw new Error("User data is not valid");
    }
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

const submitOTP = async (req: CustomRequest, res: Response) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      // res.status(404);
      throw new Error("otp is mandatory");
    }

    const user = await User.findById(req.user?._id);

    if (user?.otp == otp) {
      await User.updateOne(
        { _id: req.user?._id },
        {
          is_verified: true,
          otp: 0,
        }
      );

      return res.status(200).json({ success: true, message: "user verified" });
    } else {
      throw new Error("Wrong OTP or user not found");
    }
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

const sendOTP = async (req: CustomRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (user) {
      const otp: number = Math.floor(1000 + Math.random() * 9000);
      //send mail

      await sendOtpOnEmail({ otp, email: user.email }, "Verification OTP");
      await User.updateOne(
        { _id: req.user?._id },
        {
          is_verified: false,
          otp,
        }
      );

      return res.status(200).json({ success: true, message: "OTP sent" });
    } else {
      throw new Error("Wrong OTP or user not found");
    }
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = async (req: CustomRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      // res.status(404);
      throw new Error("All fields are mandatory!");
    }

    const user = await User.findOne({ email });

    if (!user?.is_verified) {
      throw new Error("Please verify your account");
    }

    // Compare password with hashedPassword
    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = jwt.sign(
        {
          user: {
            is_verified: user.is_verified,
            username: user.username,
            email: user.email,
            _id: user._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "10h" }
      );
      return res.status(200).json({ success: true, accessToken });
    } else {
      // res.status(401);
      throw new Error("Email or password is not valid");
    }
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

//@desc Current user
//@route POST /api/users/current
//@access private
const currentUser = async (req: CustomRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user?.is_verified) {
      throw new Error("Please verify your account");
    }
    return res.json(user);
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export { registerUser, submitOTP, sendOTP, loginUser, currentUser };
