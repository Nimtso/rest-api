import multer from "multer";
import config from "../utils/config";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${config.database.storage}\\`);
  },
  filename: function (req, file, cb) {
    const ext = file.originalname
      .split(".")
      .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
      .slice(1)
      .join(".");
    cb(null, Date.now() + "." + ext);
  },
});

const upload = multer({ storage: storage });
const uploadMiddleware = upload.single("file");

export default uploadMiddleware;
