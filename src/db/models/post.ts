import mongoose from "mongoose";
import { Post } from "../../types/posts";

const postSchema = new mongoose.Schema<Post>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Users",
    default: [],
  },
});

const postModel = mongoose.model<Post>("Posts", postSchema);

export default postModel;
