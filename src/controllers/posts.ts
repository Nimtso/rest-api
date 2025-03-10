import mongoose from "mongoose";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import postModel from "../db/models/post";
import { analyzeImage } from "../requestors/gemini";
import { Post } from "../types/posts";
import BaseController from "./base";
import config from "../utils/config";

import { AuthenticatedRequest } from "../types/auth";

class PostsController extends BaseController<Post> {
  constructor() {
    super(postModel);
  }

  insert = async (req: Request, res: Response) => {
    let item = req.body;
    if (!item.content || !item.title) {
      const generativeImageData = await analyzeImage(item.imageUrl);
      item = { ...item, ...generativeImageData };
    }
    const result = await postModel.insertMany(item);
    res.status(StatusCodes.CREATED).send(result);
  };

  uploadPostImage = async (req: Request, res: Response) => {
    const filePath = req.file?.path.replace(/\\/g, "/");
    const generativeImageData = await analyzeImage(filePath || "");
    const domain = config.app.domainBase + ":" + config.app.port;
    const storagePath = config.database.storage;
    res
      .status(200)
      .send({
        url: `${domain}/${storagePath}/${filePath}`,
        ...generativeImageData,
      });
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const post = await postModel.findById(id);
    if (!post) {
      res.status(StatusCodes.NOT_FOUND).send();
      return;
    }
    res.send({
      _id: post._id.toString(),
      content: post.content,
      title: post.title,
      sender: post.sender,
      imageUrl: post.imageUrl,
      likes: post.likes.length,
    });
  };

  findByFilter = async (req: Request, res: Response) => {
    const filter = req.query;
    const posts = (await postModel.find(filter)).map((post) => ({
      _id: post._id.toString(),
      content: post.content,
      title: post.title,
      sender: post.sender,
      imageUrl: post.imageUrl,
      likes: post.likes.length,
    }));
    res.send(posts);
  };

  likePost = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { postId } = req.params;
      const userId = new mongoose.Types.ObjectId(
        (req as AuthenticatedRequest & Request).user.id
      );

      const post = await postModel.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if the user has already liked the post by comparing ObjectId strings
      const userHasLiked = post.likes.some(
        (likeId) => likeId.toString() === userId.toString()
      );

      if (userHasLiked) {
        const updatedPost = await postModel.findByIdAndUpdate(
          postId,
          { $pull: { likes: userId } },
          { new: true }
        );

        return res.status(200).json({
          message: "Post unliked successfully",
          likesCount: updatedPost?.likes.length || 0,
        });
      }

      const updatedPost = await postModel.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      );

      return res.status(200).json({
        message: "Post liked successfully",
        likesCount: updatedPost?.likes.length || 0,
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };
}

const postsController = new PostsController();

export default postsController;
