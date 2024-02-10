import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface CustomRequest extends Request {
  user?: {
    // Define the 'user' property
    password: string;
    username: string;
    email: string;
    id: string;
  };
}

const validateToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: any;
    let authHeader: any =
      req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
        (err: any, decoded: any) => {
          if (err) {
            throw new Error("User is not authorized");
          }
          req.user = decoded.user;
          next();
        }
      );
    } else {
      throw new Error("User is not authorized or the token is missing");
    }
  } catch (error: any) {
    return res.status(401).json({ success: false, error: error.message });
  }
};

export default validateToken;
