import { z } from "zod";

const findPostSchema = z
  .object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    owner: z.string().min(1).optional(),
  })
  .refine((data) => data.title || data.content || data.owner, {
    message: "At least one of 'title', 'comment', or 'owner' is required.",
    path: [],
  });

const createPostSchema = z.object({
  title: z.string().min(1).required(),
  content: z.string().min(1),
  owner: z.string().min(1).require(),
});

const getPostById = z.object({
  senderId: z.string().min(1).required(),
});

module.exports = findPostBody;
