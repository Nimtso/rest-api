const postModel = require("../db/models/posts");

const getAll = async () => {
  return postModel.find({});
};

const findByFilter = async (filter) => {
  return postModel.find(filter);
};

const deleteByFilter = async (filter) => {
  return postModel.deleteMany(filter);
};

const update = async (updateFilter) => {
  return postModel.updateMany(updateFilter);
};
