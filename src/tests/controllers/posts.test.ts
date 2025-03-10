import fs from "fs";
import path from "path";
import axios from "axios";
import jwt from "jsonwebtoken";
import request from "supertest";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { connectTestDB, disconnectTestDB } from "../setup";
import { createServer } from "../../server";
import postModel from "../../db/models/post";
import { ObjectId } from "mongodb";
import config from "../../utils/config";
import { Post } from "../../types/posts";

const app = createServer();

jest.mock("@google/generative-ai");
jest.mock("axios");
const mockUserId = new mongoose.Types.ObjectId();
const mockToken = jwt.sign(
  { userId: mockUserId.toString() },
  config.auth.TOKEN_SECRET,
  {
    expiresIn: "1h",
  }
);

describe("Posts API (Integration Tests)", () => {
  const mockAIResponse = { title: "mocked title", content: "mocked content" };
  const testImagePath = path.join(__dirname, "test-image.jpg");

  beforeAll(async () => {
    await connectTestDB();
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () =>
              `Title: ${mockAIResponse.title}\nContent: ${mockAIResponse.content}`,
          },
        }),
      }),
    }));

    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, "dummy image content");
    }
  });

  afterAll(async () => {
    await disconnectTestDB();
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  beforeEach(async () => {
    await postModel.deleteMany();
  });

  it("should create a post", async () => {
    const newPost = {
      title: "Sample Title",
      content: "This is sample content.",
      sender: "User1",
      imageUrl: "https://example.com/image.jpg",
    };

    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(newPost);

    expect(response.status).toBe(201);
    expect(response.body[0]).toMatchObject(newPost);

    const postInDB = await postModel.findById(response.body[0]._id);
    expect(postInDB).toBeTruthy();
    expect(postInDB?.title).toBe("Sample Title");
  });

  it("should create a post with AI when content or title not exist", async () => {
    const imageBuffer = fs.readFileSync(testImagePath);
    (axios.get as jest.Mock).mockResolvedValue({ data: imageBuffer });
    const newPost = {
      sender: "User1",
      imageUrl: "https://example.com/image.jpg",
    };

    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(newPost);

    expect(response.status).toBe(201);
    expect(response.body[0].title).toEqual(mockAIResponse.title);
    expect(response.body[0].content).toEqual(mockAIResponse.content);

    const postInDB = await postModel.findById(response.body[0]._id);
    expect(postInDB).toBeTruthy();
    expect(postInDB?.title).toBe(mockAIResponse.title);
    expect(postInDB?.content).toBe(mockAIResponse.content);
  });

  it("should not create a post with invalid data", async () => {
    const invalidPost = {
      content: "Missing Title",
    };

    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(invalidPost);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should retrieve a post by ID", async () => {
    const post = await postModel.create({
      title: "Sample Title",
      content: "Sample Content",
      sender: "User1",
      imageUrl: "https://example.com/image.jpg",
    });

    const response = await request(app)
      .get(`/api/posts/${post._id}`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      title: "Sample Title",
      content: "Sample Content",
      sender: "User1",
    });
  });

  it("should retrieve posts by filter", async () => {
    await postModel.create([
      {
        title: "Title 1",
        content: "Content 1",
        sender: "User1",
        imageUrl: "https://example.com/image1.jpg",
      },
      {
        title: "Title 2",
        content: "Content 2",
        sender: "User2",
        imageUrl: "https://example.com/image2.jpg",
      },
    ]);

    const response = await request(app)
      .get("/api/posts")
      .query({ sender: "User1" })
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toMatchObject({
      title: "Title 1",
      sender: "User1",
    });
  });

  it("should delete a post by ID", async () => {
    const post = await postModel.create({
      title: "To Be Deleted",
      content: "Content",
      sender: "User1",
      imageUrl: "https://example.com/image.jpg",
    });

    const response = await request(app)
      .delete(`/api/posts/${post._id}`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe("Item deleted");

    const postInDB = await postModel.findById(post._id);
    expect(postInDB).toBeNull();
  });

  it("should update a post by ID", async () => {
    const post = await postModel.create({
      title: "Original Title",
      content: "Original Content",
      sender: "User1",
      imageUrl: "https://example.com/image.jpg",
    });

    const updatedPost = {
      title: "Updated Title",
      content: "Updated Content",
    };

    const response = await request(app)
      .put(`/api/posts/${post._id}`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send(updatedPost);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      title: "Updated Title",
      content: "Updated Content",
      sender: "User1",
    });

    const updatedPostInDB = await postModel.findById(post._id);
    expect(updatedPostInDB?.title).toBe("Updated Title");
    expect(updatedPostInDB?.content).toBe("Updated Content");
  });

  it("should get 404 for trying to update non-existing post", async () => {
    const response = await request(app)
      .put(`/api/posts/${new ObjectId().toString()}`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send({
        title: "fakeName",
      });

    expect(response.status).toBe(404);
  });

  it("should return 404 if a post to delete does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/posts/${nonExistentId}`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe("Cannot find item");
  });

  describe("Post Like Functionality", () => {
    let testPost: mongoose.Document<unknown, {}, Post> &
      Post & { _id: mongoose.Types.ObjectId };
    let anotherUserId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      testPost = await postModel.create({
        title: "Test Post",
        content: "Test Content",
        sender: "User1",
        imageUrl: "https://example.com/image.jpg",
        likes: [],
      });

      anotherUserId = new mongoose.Types.ObjectId();
    });

    it("should like a post successfully", async () => {
      const response = await request(app)
        .put(`/api/posts/${testPost._id}/like`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Post liked successfully");

      const updatedPost = await postModel.findById(testPost._id);

      expect(updatedPost?.likes).toContainEqual(mockUserId);
    });

    it("should unlike a previously liked post", async () => {
      await postModel.findByIdAndUpdate(testPost._id, {
        $addToSet: { likes: mockUserId },
      });

      const response = await request(app)
        .put(`/api/posts/${testPost._id}/like`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Post unliked successfully");

      const updatedPost = await postModel.findById(testPost._id);
      expect(updatedPost?.likes).not.toContainEqual(mockUserId);
    });

    it("should prevent duplicate likes from the same user", async () => {
      // First like
      await request(app)
        .put(`/api/posts/${testPost._id}/like`)
        .set("Authorization", `Bearer ${mockToken}`);

      const response = await request(app)
        .put(`/api/posts/${testPost._id}/like`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Post unliked successfully");

      const updatedPost = await postModel.findById(testPost._id);
      expect(
        updatedPost?.likes.filter(
          (id) => mockUserId.toString() === id.toString()
        )
      ).toHaveLength(0);
    });

    it("should allow multiple users to like the same post", async () => {
      const anotherToken = jwt.sign(
        { userId: anotherUserId },
        config.auth.TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      // First user likes
      await request(app)
        .put(`/api/posts/${testPost._id}/like`)
        .set("Authorization", `Bearer ${mockToken}`);

      // Second user likes
      const response = await request(app)
        .put(`/api/posts/${testPost._id}/like`)
        .set("Authorization", `Bearer ${anotherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Post liked successfully");

      const updatedPost = await postModel.findById(testPost._id);
      expect(updatedPost?.likes).toHaveLength(2);
      expect(updatedPost?.likes).toContainEqual(mockUserId);
      expect(updatedPost?.likes).toContainEqual(anotherUserId);
    });

    it("should return 404 for non-existent post", async () => {
      const fakePostId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/posts/${fakePostId}/like`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Post not found");
    });

    it("should require authentication to like a post", async () => {
      const response = await request(app).put(
        `/api/posts/${testPost._id}/like`
      );

      expect(response.status).toBe(401);
    });
  });
});
