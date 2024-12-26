import mongoose from "mongoose";
import { Comment } from "../../types/comments";

const commentSchema = new mongoose.Schema<Comment>({
  sender: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  content: String,
});

const commentModel = mongoose.model<Comment>("Comments", commentSchema);

export default commentModel;
