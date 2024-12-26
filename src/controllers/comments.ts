import { StatusCodes } from "http-status-codes";

import commentModel from "../db/models/comments";
import type { Request, Response } from "express";

const insert = async (req: Request, res: Response) => {
  const comment = req.body;
  const result = await commentModel.create(comment);
  res.status(StatusCodes.CREATED).send(result);
};

const findById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const comment = await commentModel.findById(id);
  if (!comment) res.status(StatusCodes.NOT_FOUND);
  res.send(comment);
};

const findByFilter = async (req: Request, res: Response) => {
  const filter = req.query ?? {};
  const comments = await commentModel.find(filter);
  res.send(comments);
};

const deleteById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const comment = await commentModel.findByIdAndDelete(id);
  if (!comment) {
    res.status(StatusCodes.NOT_FOUND).send("Cannot find comment");
    return;
  }

  res.send("Comment Deleted");
};

const update = async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedComment = req.body;
  const updateResult = await commentModel.findByIdAndUpdate(id, updatedComment);
  if (!updateResult) {
    res.status(StatusCodes.NOT_FOUND).send("Cannot find comment");
    return;
  }

  res.send("Comment Updated");
};

export default { insert, findById, findByFilter, deleteById, update };
