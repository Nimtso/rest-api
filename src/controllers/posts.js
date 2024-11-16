const { StatusCodes } = require("http-status-codes");

const postModel = require("../db/models/posts");

const insert = async (req, res) => {
  const post = req.body;
  const result = await postModel.insertMany(post);
  res.status(StatusCodes.CREATED).send(result);
};

const findById = async (req, res) => {
  const id = req.params.id;
  const post = await postModel.findById(id);
  if (!post.length) res.status(StatusCodes.NOT_FOUND);
  res.send(post);
};

const findByFilter = async (req, res) => {
  const filter = req.query || {};
  const posts = await postModel.find(filter);
  if (!posts.length) res.status(StatusCodes.NOT_FOUND);
  res.send(posts);
};

const deleteByFilter = async (req, res) => {
  const filter = res.body;
  const result = await postModel.deleteMany(filter);
  res.send(result);
};

const update = async (req, res) => {
  const updateFilter = req.body;
  const updateResult = await postModel.updateMany(updateFilter);
  res.send(updateResult);
};

module.exports = {
  findById,
  findByFilter,
  deleteByFilter,
  update,
  insert,
};
