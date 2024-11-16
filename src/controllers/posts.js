const { StatusCodes } = require("http-status-codes");

const postModel = require("../db/models/posts");

const insert = async (req, res) => {
  const post = req.body;
  const result = await postModel.insertMany(post);
  res.status(StatusCodes.CREATED).send(result);
};

const getAll = async (req, res) => {
  const posts = await postModel.find({});
  res.send(posts);
};

const findByFilter = async (filter) => {
  const posts = await postModel.find(filter);
  if (!post.length) res.status(StatusCodes.NOT_FOUND);
  res.send(posts);
};

const deleteByFilter = async (filter) => {
  const result = await postModel.deleteMany(filter);
  res.send(result);
};

const update = async (updateFilter) => {
  const updateResult = await postModel.updateMany(updateFilter);
  res.send(updateResult);
};

module.exports = { getAll, findByFilter, deleteByFilter, update, insert };
