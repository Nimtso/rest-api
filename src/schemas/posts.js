const { z } = require("zod");

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
  title: z.string().min(1),
  content: z.string().min(1),
  owner: z.string().min(1),
});

const getPostById = z.object({
  senderId: z.string().min(1),
});

module.exports = { findPostSchema, createPostSchema };
