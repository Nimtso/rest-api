import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { connectTestDB, disconnectTestDB } from "../setup";
import { createServer } from "../../server";
import postModel from "../../db/models/post";
import { ObjectId } from "mongodb";
import config from "../../utils/config";

const app = createServer();

const mockUserId = new mongoose.Types.ObjectId();
const mockToken = jwt.sign({ _id: mockUserId }, config.auth.TOKEN_SECRET, {
  expiresIn: "1h",
});

describe("Posts API (Integration Tests)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
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
      .post("/posts")
      .set("Authorization", `Bearer ${mockToken}`)
      .send(newPost);

    expect(response.status).toBe(201);
    expect(response.body[0]).toMatchObject(newPost);

    const postInDB = await postModel.findById(response.body[0]._id);
    expect(postInDB).toBeTruthy();
    expect(postInDB?.title).toBe("Sample Title");
  });

  it("should not create a post with invalid data", async () => {
    const invalidPost = {
      content: "Missing Title",
    };

    const response = await request(app)
      .post("/posts")
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
      .get(`/posts/${post._id}`)
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
      .get("/posts")
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
      .delete(`/posts/${post._id}`)
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
      .put(`/posts/${post._id}`)
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
      .put(`/posts/${new ObjectId().toString()}`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send({
        title: "fakeName",
      });

    expect(response.status).toBe(404);
  });

  it("should return 404 if a post to delete does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/posts/${nonExistentId}`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe("Cannot find item");
  });
});
