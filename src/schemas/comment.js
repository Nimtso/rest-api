const { z } = require("zod");

const findCommentSchema = z.object({
  query: z.object({
    postId: z.string(),
    content: z.string().min(1).optional(),
    sender: z.string().min(1).optional(),
  })
});

const createCommentSchema = z.object({
  body: z.object({
    postId: z.string(),
    content: z.string().min(1).optional(),
    sender: z.string().min(1).optional(),
  })
});

const updateCommentSchema = createCommentSchema;

module.exports = { findCommentSchema, createCommentSchema, updateCommentSchema };
