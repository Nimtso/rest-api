import userModel from "../db/models/user";
import BaseController from "./base";

const usersController = new BaseController(userModel);

export default usersController;
