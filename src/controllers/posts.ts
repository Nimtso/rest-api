import postModel from "../db/models/post";
import { analyzeImage } from "../requestors/gemini";
import { Post } from "../types/posts";
import config from "../utils/config";
import BaseController from "./base";

class PostsController extends BaseController<Post> {
  constructor() {
    super(postModel);
  }

  uploadPostImage = async (req: any, res: any) => {
    const generativeImageData = await analyzeImage(req.file?.path);
    const domain = config.app.domainBase + ":" + config.app.port;
    res
      .status(200)
      .send({ url: domain + "/" + req.file?.path, ...generativeImageData });
  };
}

const postsController = new PostsController();

export default postsController;
