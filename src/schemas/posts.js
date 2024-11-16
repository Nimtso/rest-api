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

module.exports = { findPostSchema, createPostSchema };
