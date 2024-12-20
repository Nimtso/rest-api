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
  if (!post) res.status(StatusCodes.NOT_FOUND);
  res.send(post);
};

const findAll = async (req, res) => {
  const posts = await postModel.find({});
  res.send(posts);
};

const findByFilter = async (req, res) => {
  const filter = req.query || {};
  const posts = await postModel.find(filter);
  res.send(posts);
};

const deleteById = async (req, res) => {
  const id = req.params.id
  const post = await postModel.findByIdAndDelete(id);
  if (!post) return res.status(StatusCodes.NOT_FOUND).send("Cannot find post");
  res.send("Post Deleted");
};

const update = async (req, res) => {
  const id = req.params.id;
  const updateFilter = req.body;
  const updateResult = await postModel.findOneAndUpdate(
    { _id: id },
    updateFilter
  );

  if (!updateResult)
    return res
      .status(StatusCodes.NOT_FOUND)
      .send(`Cannot find post with id - ${id}`);

  res.status(StatusCodes.OK).send(updateResult);
};

module.exports = {
  findAll,
  findById,
  findByFilter,
  deleteById,
  update,
  insert,
};
