import express from "express";

import filesSchema from "../schemas/files";
import uploadMiddleware from "../middlewares/multer";
import validateData from "../middlewares/validators";
import config from "../utils/config";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  uploadMiddleware,
  validateData(filesSchema.uploadImageSchema),
  (req, res) => {
    const filePath = req.file?.path.replace(/\\/g, "/");
    const domain = config.app.domainBase + ":" + config.app.port;
    res.status(200).send({ url: domain + "/" + filePath });
  }
);

export default router;
