import postModel from "../db/models/post";
import BaseController from "./base";

const postsController = new BaseController(postModel);

export default postsController;
