const express = require("express");

const postHandler = require("../controllers/posts");
const validateData = require("../middlewares/validators");
const postSchema = require("../schemas/posts");

const router = express.Router();

router.get("/", postHandler.getAll);
router.post("/", validateData(postSchema.create), postHandler.insert);

module.exports = router;
