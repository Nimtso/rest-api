import { Request, Response } from "express";
import express from "express";

import postHandler from "../controllers/posts";
import validateData from "../middlewares/validators";
import postSchemas from "../schemas/posts";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - sender
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         sender:
 *           type: string
 *           description: The sender of the post
 *         imageUrl:
 *           type: string
 *           description: The image URL of the post
 *       example:
 *         title: "Sample Post"
 *         content: "This is the content of the post."
 *         sender: "User1"
 *         imageUrl: "https://example.com/image.jpg"
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
 *   name: Posts
 *   description: API for managing posts
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get posts by filter
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter posts by title
 *       - in: query
 *         name: content
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter posts by content
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter posts by sender
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get(
  "/",
  validateData(postSchemas.findPostSchema),
  postHandler.findByFilter.bind(postHandler)
);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: The post data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */

router.get("/:id", authMiddleware, postHandler.findById.bind(postHandler));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 */
router.post(
  "/",
  authMiddleware,
  validateData(postSchemas.createPostSchema),
  postHandler.insert.bind(postHandler)
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 *       404:
 *         description: Post not found
 */
router.delete("/:id", authMiddleware, postHandler.deleteById.bind(postHandler));

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 *       404:
 *         description: Post not found
 */
router.put(
  "/:id",
  authMiddleware,
  validateData(postSchemas.updatePostSchema),
  postHandler.update.bind(postHandler)
);

/**
 * @swagger
 * /posts/image:
 *   post:
 *     summary: Upload an image for a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of the uploaded image
 *       400:
 *         description: Bad request - No file uploaded
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 */

router.post(
  "/image",
  authMiddleware,
  validateData(postSchemas.uploadPostImageSchema),
  postHandler.uploadPostImage.bind(postHandler)
);

router.put("/:postId/like", authMiddleware, async (req, res, next) => {
  try {
    await postHandler.likePost(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
