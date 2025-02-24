import { z } from "zod";

const uploadImageSchema = {
  file: z.object({}),
};

export default {
  uploadImageSchema,
};
