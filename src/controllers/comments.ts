import commentModel from "../db/models/comment";
import BaseController from "./base";

const commentsController = new BaseController(commentModel);

export default commentsController;
