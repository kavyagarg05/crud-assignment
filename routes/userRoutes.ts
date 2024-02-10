import express from "express";
import {
  registerUser,
  submitOTP,
  sendOTP,
  loginUser,
  currentUser,
} from "../controllers/userController";
import validateToken from "../middlewares/validateTokenHandler";

const router = express.Router();

router.post("/register", registerUser);

router.post("/submitOTP", validateToken, submitOTP);

router.post("/sendOTP", validateToken, sendOTP);

router.post("/login", loginUser);

router.post("/current", validateToken, currentUser);

export default router;
