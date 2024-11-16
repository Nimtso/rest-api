const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  postId: {
    type: String,
    required: true,
  },
  content: String,
});

const commentModel = mongoose.model("Comments", commentSchema);

module.exports = commentModel;
