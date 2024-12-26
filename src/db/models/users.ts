import mongoose from "mongoose";
import { User } from "../../types/users";

const Schema = mongoose.Schema;

const userSchema = new Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const userModel = mongoose.model<User>("Users", userSchema);

export default userModel;
