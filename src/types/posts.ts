import mongoose from "mongoose";

export interface Post {
  title: string;
  content: string;
  sender: string;
  imageUrl: string;
  likes: mongoose.Types.ObjectId[];
}
