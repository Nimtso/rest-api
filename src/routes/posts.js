const express = require("express");

const postHandler = require("../controllers/posts");
const validateData = require("../middlewares/validators");
const postSchema = require("../schemas/posts");

const router = express.Router();

router.get("/", postHandler.findByFilter);
router.post("/", validateData(postSchema.createPostSchema), postHandler.insert);
router.get("/:id", validateData(postSchema.getPostById), postHandler.findById);

module.exports = router;
