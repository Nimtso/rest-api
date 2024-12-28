import mongoose from "mongoose";

import bcrypt from "bcrypt";

export interface IUser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: [String],
    default: [],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isValidPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model<IUser>("Users", userSchema);

export default UserModel;
