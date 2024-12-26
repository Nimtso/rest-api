import { z } from "zod";

const findCommentSchema = {
  query: z
    .object({
      postId: z.string().optional(),
      content: z.string().optional(),
      sender: z.string().optional(),
    })
    .strict(),
};

const createCommentSchema = {
  body: z.object({
    postId: z.string(),
    content: z.string().optional(),
    sender: z.string().min(1),
  }),
};

const updateCommentSchema = createCommentSchema;

export { findCommentSchema, createCommentSchema, updateCommentSchema };
