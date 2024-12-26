import express from "express";

import postHandler from "../controllers/posts";
import validateData from "../middlewares/validators";
import postSchemas from "../schemas/posts";

const router = express.Router();

router.get(
  "/",
  validateData(postSchemas.findPostSchema),
  postHandler.findByFilter.bind(postHandler)
);
router.get("/:id", postHandler.findById.bind(postHandler));

router.post(
  "/",
  validateData(postSchemas.createPostSchema),
  postHandler.insert.bind(postHandler)
);

router.delete("/:id", postHandler.deleteById.bind(postHandler));

router.put(
  "/:id",
  validateData(postSchemas.updatePostSchema),
  postHandler.update.bind(postHandler)
);

export default router;
