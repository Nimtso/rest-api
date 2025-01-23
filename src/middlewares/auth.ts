import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import config from "../utils/config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authorization = req.header("Authorization");
  const token = authorization && authorization.split(" ")[1];

  if (!token) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Access Denied: No Token Provided" });
    return;
  }

  if (!config.auth.TOKEN_SECRET) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error: Missing Token Secret" });
    return;
  }

  try {
    const payload = jwt.verify(token, config.auth.TOKEN_SECRET) as Payload;
    req.params.userId = payload._id;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Access Denied: Token Expired" });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Access Denied: Invalid Token" });
    } else {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Server Error: Token Verification Failed" });
    }
  }
};

type Payload = {
  _id: string;
};
