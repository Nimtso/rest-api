import { z } from "zod";

const findUserSchema = {
  query: z
    .object({
      name: z.string().min(1).optional(),
      email: z.string().min(1).optional(),
    })
    .strict(),
};

const createUserSchema = {
  body: z.object({
    name: z.string().min(1),
    email: z.string().min(1),
    password: z.string().min(1),
  }),
};

const updateUserSchema = {
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      password: z.string().min(1).optional(),
      email: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
    })
    .strict(),
};

export default { findUserSchema, createUserSchema, updateUserSchema };
