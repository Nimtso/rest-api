import { z } from "zod";

const findPostSchema = {
  query: z
    .object({
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      sender: z.string().min(1).optional(),
    })
    .strict(),
};

const createPostSchema = {
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    sender: z.string().min(1),
  }),
};

const updatePostSchema = {
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      sender: z.string().min(1).optional(),
    })
    .strict(),
};

export default { findPostSchema, createPostSchema, updatePostSchema };
