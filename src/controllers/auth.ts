import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import UserModel from "../db/models/user";
import config from "../utils/config";
const generateTokens = (userId: string) => ({
  accessToken: jwt.sign({ userId }, config.auth.TOKEN_SECRET, {
    expiresIn: "15m",
  }),
  refreshToken: jwt.sign({ userId }, config.auth.TOKEN_SECRET, {
    expiresIn: "7d",
  }),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    const user = await UserModel.create({ email, password, name });
    const tokens = generateTokens(user._id as string);
    await user.addRefreshToken(tokens.refreshToken);

    res.status(201).json({
      ...tokens,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(400).json({ message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user || !(await user.isValidPassword(password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      config.auth.TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      config.auth.TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await user.addRefreshToken(refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.app.env === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(400).json({ message: "Login failed" });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const decoded = jwt.verify(refreshToken, config.auth.TOKEN_SECRET) as {
      userId: string;
    };
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    await user.revokeRefreshToken(refreshToken);
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      config.auth.TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    const accessToken = jwt.sign(
      { userId: user._id },
      config.auth.TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    await user.addRefreshToken(newRefreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(204).end();
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, config.auth.TOKEN_SECRET) as {
        userId: string;
      };

      const user = await UserModel.findById(decoded.userId);
      if (user) {
        await user.revokeRefreshToken(refreshToken);
      }
    } catch (tokenError) {
      console.log("Invalid token during logout:", tokenError);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.app.env === "production",
      sameSite: "strict",
    });

    res.status(204).end();
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};
