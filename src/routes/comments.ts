import express from "express";

import commentHandler from "../controllers/comments";
import validateData from "../middlewares/validators";
import { authMiddleware } from "../middlewares/auth";
import {
  createCommentSchema,
  findCommentSchema,
  updateCommentSchema,
} from "../schemas/comment";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - sender
 *         - postId
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the comment
 *         sender:
 *           type: string
 *           description: The sender of the comment
 *         postId:
 *           type: string
 *           description: The ID of the associated post
 *         content:
 *           type: string
 *           description: The content of the comment
 *       example:
 *         sender: "User1"
 *         postId: "677010abb1c9b18015b05760"
 *         content: "This is a comment."
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * security:
 *   - bearerAuth: []
 */

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API for managing comments
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get comments by filter
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter comments by sender
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter comments by post ID
 *     responses:
 *       200:
 *         description: The list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get(
  "/",
  validateData(findCommentSchema),
  commentHandler.findByFilter.bind(commentHandler)
);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: The comment data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 */
router.get("/:id", commentHandler.findById.bind(commentHandler));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 */
router.post(
  "/",
  authMiddleware,
  validateData(createCommentSchema),
  commentHandler.insert.bind(commentHandler)
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 *       404:
 *         description: Comment not found
 */
router.delete(
  "/:id",
  authMiddleware,
  commentHandler.deleteById.bind(commentHandler)
);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 *       404:
 *         description: Comment not found
 */
router.put(
  "/:id",
  authMiddleware,
  validateData(updateCommentSchema),
  commentHandler.update.bind(commentHandler)
);

export default router;
