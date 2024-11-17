const { StatusCodes } = require("http-status-codes");

const commentModel = require("../db/models/comments");

const insert = async (req, res) => {
  const comment = req.body;
  const result = await commentModel.create(comment);
  res.status(StatusCodes.CREATED).send(result);
};

const findById = async (req, res) => {
  const id = req.params.id;
  const comment = await commentModel.findById(id);
  if (!comment) res.status(StatusCodes.NOT_FOUND);
  res.send(comment);
};

const findByFilter = async (req, res) => {
  const filter = req.query ?? {};
  const comments = await commentModel.find(filter);
  res.send(comments);
};

const deleteById = async (req, res) => {
  const id = req.params.id
  const comment = await commentModel.findByIdAndDelete(id);
  if (!comment) return res.status(StatusCodes.NOT_FOUND).send("Cannot find comment");
  res.send("Comment Deleted");
};

const update = async (req, res) => {
  const id = req.params.id;
  const updatedComment = req.body;
  const updateResult = await commentModel.findByIdAndUpdate(id, updatedComment);
  if (!updateResult) return res.status(StatusCodes.NOT_FOUND).send("Cannot find comment");
  res.send("Comment Updated");
};

module.exports = { insert, findById, findByFilter, deleteById, update, insert };
