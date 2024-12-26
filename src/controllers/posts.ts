import postModel from "../db/models/posts";
import BaseController from "./base";

const postsController = new BaseController(postModel);

export default postsController;
