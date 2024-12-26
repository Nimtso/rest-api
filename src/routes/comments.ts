import express from "express";

import commentHandler from "../controllers/comments";
import validateData from "../middlewares/validators";
import {
  createCommentSchema,
  findCommentSchema,
  updateCommentSchema,
} from "../schemas/comment";

const router = express.Router();

router.get(
  "/",
  validateData(findCommentSchema),
  commentHandler.findByFilter.bind(commentHandler)
);
router.get("/:id", commentHandler.findById.bind(commentHandler));

router.post(
  "/",
  validateData(createCommentSchema),
  commentHandler.insert.bind(commentHandler)
);

router.delete("/:id", commentHandler.deleteById.bind(commentHandler));

router.put(
  "/:id",
  validateData(updateCommentSchema),
  commentHandler.update.bind(commentHandler)
);

export default router;
