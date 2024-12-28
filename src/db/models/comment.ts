import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  postId: {
    type: ObjectId,
    required: true,
  },
  content: String,
});

const commentModel = mongoose.model("Comments", commentSchema);

export default commentModel;
