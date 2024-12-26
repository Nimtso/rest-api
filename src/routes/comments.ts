import express from "express";

import commentHandler from "../controllers/comments";
import validateData from "../middlewares/validators";
import {
  createCommentSchema,
  findCommentSchema,
  updateCommentSchema,
} from "../schemas/comment";

const router = express.Router();

router.get("/", validateData(findCommentSchema), commentHandler.findByFilter);
router.get("/:id", commentHandler.findById);

router.post("/", validateData(createCommentSchema), commentHandler.insert);

router.delete("/:id", commentHandler.deleteById);

router.put("/:id", validateData(updateCommentSchema), commentHandler.update);

export default router;
