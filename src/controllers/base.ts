import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Model } from "mongoose";

class BaseController<T> {
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async insert(req: Request, res: Response) {
    const item = req.body;
    const result = await this.model.insertMany(item);
    res.status(StatusCodes.CREATED).send(result);
  }

  async findById(req: Request, res: Response) {
    const id = req.params.id;
    const item = await this.model.findById(id);
    if (!item) res.status(StatusCodes.NOT_FOUND);
    res.send(item);
  }

  async findAll(req: Request, res: Response) {
    const items = await this.model.find({});
    res.send(items);
  }

  async findByFilter(req: Request, res: Response) {
    const filter = req.query || {};
    const items = await this.model.find(filter as Partial<T>);
    res.send(items);
  }

  async deleteById(req: Request, res: Response) {
    const id = req.params.id;
    const item = await this.model.findByIdAndDelete(id);
    if (!item) {
      res.status(StatusCodes.NOT_FOUND).send("Cannot find item");
      return;
    }

    res.send("Item deleted");
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const updateFilter = req.body;
    const updateResult = await this.model.findOneAndUpdate(
      { _id: id },
      updateFilter,
      { new: true }
    );

    if (!updateResult) {
      res.status(StatusCodes.NOT_FOUND).send(`Cannot find item`);
      return;
    }

    res.status(StatusCodes.OK).send(updateResult);
  }
}
export default BaseController;
