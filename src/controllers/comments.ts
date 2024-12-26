import commentModel from "../db/models/comments";
import BaseController from "./base";

const commentsController = new BaseController(commentModel);

export default commentsController;
