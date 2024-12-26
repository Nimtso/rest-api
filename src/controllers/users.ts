import userModel from "../db/models/users";
import BaseController from "./base";

const usersController = new BaseController(userModel);

export default usersController;
