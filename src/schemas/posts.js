const { z } = require("zod");

const findPostSchema = z.object({
  query: z
    .object({
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      owner: z.string().min(1).optional(),
    })
    .strict(),
});

const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    owner: z.string().min(1),
  }),
});

const updatePostSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      owner: z.string().min(1).optional(),
    })
    .strict(),
});

module.exports = { findPostSchema, createPostSchema, updatePostSchema };
