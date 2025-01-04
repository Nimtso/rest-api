import jwt from "jsonwebtoken";
import { NextFunction, Request, response, Response } from "express";
import { StatusCodes } from "http-status-codes";

import config from "../utils/config";
import UserModel, { IUser } from "../db/models/user";

const { TOKEN_SECRET, TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } = config.auth;

const generateAccessToken = (user: IUser): string => {
  return jwt.sign({ _id: user._id, email: user.email }, TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRES,
  });
};

const generateRefreshToken = (user: IUser): string => {
  return jwt.sign({ _id: user._id, email: user.email }, TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
};

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User already exists" });
    return;
  }

  const newUser = new UserModel({ email, password });
  await newUser.save();

  res.status(StatusCodes.CREATED).json({
    message: "User registered successfully",
    user: { email: newUser.email, _id: newUser._id },
  });
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid credentials" });
    return;
  }

  const isValidPassword = await user.isValidPassword(password);
  if (!isValidPassword) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid credentials" });
    return;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken.push(refreshToken);
  await user.save();

  res.status(StatusCodes.OK).json({ accessToken, refreshToken, _id: user._id });
};

const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Refresh token is required" });
    return;
  }

  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, TOKEN_SECRET) as jwt.JwtPayload;

    const user = await UserModel.findById(decoded._id);
    if (!user || !user.refreshToken.includes(refreshToken)) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = jwt.sign(
      { _id: user._id, email: user.email },
      TOKEN_SECRET,
      { expiresIn: config.auth.TOKEN_EXPIRES }
    );
    const newRefreshToken = jwt.sign(
      { _id: user._id, email: user.email },
      TOKEN_SECRET,
      { expiresIn: config.auth.REFRESH_TOKEN_EXPIRES }
    );

    user.refreshToken = user.refreshToken.filter(
      (token) => token !== refreshToken
    );
    user.refreshToken.push(newRefreshToken);
    await user.save();

    res
      .status(StatusCodes.OK)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Refresh token has expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid refresh token" });
      return;
    }

    throw error;
  }
};

const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  const user = await UserModel.findOne({
    refreshToken: { $in: [refreshToken] },
  });

  if (!user) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid refresh token" });
    return;
  }

  user.refreshToken = user.refreshToken.filter(
    (token: string) => token !== refreshToken
  );
  await user.save();

  res.status(StatusCodes.OK).json({ message: "Logout successful" });
};

export default { logout, register, login, refresh };
