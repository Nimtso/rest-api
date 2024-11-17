const express = require("express");

const commentHandler = require("../controllers/comments");
const validateData = require("../middlewares/validators");
const commentSchemas = require("../schemas/comment");

const router = express.Router();

router.get(
  "/",
  validateData(commentSchemas.findCommentSchema),
  commentHandler.findByFilter
);
router.get("/:id", commentHandler.findById);

router.post(
  "/",
  validateData(commentSchemas.createCommentSchema),
  commentHandler.insert
);

router.delete("/:id", commentHandler.deleteById)

router.put("/:id", validateData(commentSchemas.updateCommentSchema), commentHandler.update);

module.exports = router;
