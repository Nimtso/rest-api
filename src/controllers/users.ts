import { Request, Response } from "express";
import UserModel, { IUser } from "../db/models/user";
import BaseController from "../controllers/base";
import { AuthRequest } from "../types/auth";

class UsersController extends BaseController<IUser> {
  constructor() {
    super(UserModel);
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthRequest & Request).user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized access" });
        return;
      }

      const user = await this.model.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await user.cleanupExpiredTokens();

      const returnUserDTO = user.toObject() as Partial<IUser>;
      delete returnUserDTO.password;
      delete returnUserDTO.refreshTokens;

      res.json(returnUserDTO);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async insert(req: Request, res: Response): Promise<void> {
    try {
      const existingUser = await this.model.findOne({ email: req.body.email });
      if (existingUser) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

      const user = await this.model.create(req.body);

      const returnUserDTO = user.toObject() as Partial<IUser>;
      delete returnUserDTO.password;
      delete returnUserDTO.refreshTokens;

      res.status(201).json(returnUserDTO);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      if (req.body.email) {
        const existingUser = await this.model.findOne({
          email: req.body.email,
          _id: { $ne: req.params.id },
        });
        if (existingUser) {
          res.status(409).json({ message: "Email already registered" });
          return;
        }
      }

      const user = await this.model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const returnUserDTO = user.toObject() as Partial<IUser>;
      delete returnUserDTO.password;
      delete returnUserDTO.refreshTokens;

      res.json(returnUserDTO);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}

const usersController = new UsersController();

export default usersController;
