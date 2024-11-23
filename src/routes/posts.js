const express = require("express");

const postHandler = require("../controllers/posts");
const validateData = require("../middlewares/validators");
const postSchemas = require("../schemas/posts");

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

router.put(
  "/:id",
  validateData(postSchemas.updatePostSchema),
  postHandler.update
);

module.exports = router;
