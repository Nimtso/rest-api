import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import UserModel from "../db/models/user";
import config from "../utils/config";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

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
    try {
      const user = await UserModel.create({ email, password, name });
      const tokens = generateTokens(user._id as string);
      await user.addRefreshToken(tokens.refreshToken);
      res.status(201).json({
        ...tokens,
        user: { id: user._id, email: user.email, name: user.name },
        message: "User registered successfully",
      });
      return;
    } catch (error) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
  } catch (error) {
    res.status(400).json({ message: "Registration failed" });
    return;
  }
};

export const googleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  const credential = req.body.credential;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    if (!email) {
      res.status(400).send("error missing email or password");
      return;
    }

    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({
        email,
        name: payload.name,
      });
    }
    const tokens = generateTokens(user._id as string);
    await user.addRefreshToken(tokens.refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.app.env === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: tokens.accessToken,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(400).send("Login failed");
    return;
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
    if (!refreshToken) {
      res.status(400).json({ message: "No refresh token provided" });
      return;
    }
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
  } catch (error: any) {
    if (error && error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Refresh token has expired" });
    }
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
        await user.revokeRefreshToken(refreshToken.toString());
      } else {
        res.status(401).json({ message: "Invalid refresh token" }).end();
        return;
      }
    } catch (tokenError) {
      res.status(401).json({ message: "Invalid refresh token" }).end();
      return;
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.app.env === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};
