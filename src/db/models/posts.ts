import mongoose from "mongoose";
import { Post } from "../../types/posts";

const postSchema = new mongoose.Schema<Post>({
  title: {
    type: String,
    required: true,
  },
  content: String,
  sender: {
    type: String,
    required: true,
  },
});

const postModel = mongoose.model<Post>("Posts", postSchema);

export default postModel;
