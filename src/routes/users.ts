import express from "express";

import userHandler from "../controllers/users";
import validateData from "../middlewares/validators";
import userSchemas from "../schemas/users";

const router = express.Router();

router.get(
  "/",
  validateData(userSchemas.findUserSchema),
  userHandler.findByFilter.bind(userHandler)
);
router.get("/:id", userHandler.findById.bind(userHandler));

router.post(
  "/",
  validateData(userSchemas.createUserSchema),
  userHandler.insert.bind(userHandler)
);

router.delete("/:id", userHandler.deleteById.bind(userHandler));

router.put(
  "/:id",
  validateData(userSchemas.updateUserSchema),
  userHandler.update.bind(userHandler)
);

export default router;
