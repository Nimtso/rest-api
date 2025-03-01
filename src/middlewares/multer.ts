import multer from "multer";
import config from "../utils/config";
import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

const uploadDir = config.database.storage;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    try {
      const ext = path.extname(file.originalname) || "";
      cb(null, `${Date.now()}${ext}`);
    } catch (error) {
      if (error instanceof Error) {
        cb(error, file.originalname);
      }
      console.error("Error generating filename:", error);
      throw new Error("Error generating filename");
    }
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

const uploadMiddleware = upload.single("file");
export default function (req: Request, res: Response, next: NextFunction) {
  uploadMiddleware(req, res, function (err) {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}
