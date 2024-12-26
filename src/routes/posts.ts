import express from "express";

import postHandler from "../controllers/posts";
import validateData from "../middlewares/validators";
import postSchemas from "../schemas/posts";

const router = express.Router();

router.get(
  "/",
  validateData(postSchemas.findPostSchema),
  postHandler.findByFilter
);
router.get("/:id", postHandler.findById);

router.post(
  "/",
  validateData(postSchemas.createPostSchema),
  postHandler.insert
);

router.delete("/:id", postHandler.deleteById);

router.put(
  "/:id",
  validateData(postSchemas.updatePostSchema),
  postHandler.update
);

export default router;
