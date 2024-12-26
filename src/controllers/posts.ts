import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

import postModel from "../db/models/posts";

const insert = async (req: Request, res: Response) => {
  const post = req.body;
  const result = await postModel.insertMany(post);
  res.status(StatusCodes.CREATED).send(result);
};

const findById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const post = await postModel.findById(id);
  if (!post) res.status(StatusCodes.NOT_FOUND);
  res.send(post);
};

const findAll = async (req: Request, res: Response) => {
  const posts = await postModel.find({});
  res.send(posts);
};

const findByFilter = async (req: Request, res: Response) => {
  const filter = req.query || {};
  const posts = await postModel.find(filter);
  res.send(posts);
};

const deleteById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const post = await postModel.findByIdAndDelete(id);
  if (!post) {
    res.status(StatusCodes.NOT_FOUND).send("Cannot find post");
    return;
  }

  res.send("Post Deleted");
};

const update = async (req: Request, res: Response) => {
  const id = req.params.id;
  const updateFilter = req.body;
  const updateResult = await postModel.findOneAndUpdate(
    { _id: id },
    updateFilter
  );

  if (!updateResult) {
    res.status(StatusCodes.NOT_FOUND).send(`Cannot find post with id - ${id}`);
    return;
  }

  res.status(StatusCodes.OK).send(updateResult);
};

export default { findAll, findById, findByFilter, deleteById, update, insert };
