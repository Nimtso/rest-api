import request from "supertest";
import mongoose from "mongoose";

import { connectTestDB, disconnectTestDB } from "../setup";
import { createServer } from "../../server";
import postModel from "../../db/models/post";
const app = createServer();

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
    };

    const response = await request(app).post("/posts").send(newPost);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newPost);

    const postInDB = await postModel.findById(response.body._id);
    expect(postInDB).toBeTruthy();
    expect(postInDB?.title).toBe("Sample Title");
  });

  it("should not create a post with invalid data", async () => {
    const invalidPost = {
      content: "Missing Title",
    };

    const response = await request(app).post("/posts").send(invalidPost);

    expect(response.status).toBe(400); // Validation should fail
    expect(response.body).toHaveProperty("error");
  });

  it("should retrieve a post by ID", async () => {
    const post = await postModel.create({
      title: "Sample Title",
      content: "Sample Content",
      sender: "User1",
    });

    const response = await request(app).get(`/posts/${post._id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      title: "Sample Title",
      content: "Sample Content",
      sender: "User1",
    });
  });

  it("should retrieve posts by filter", async () => {
    await postModel.create([
      { title: "Title 1", content: "Content 1", sender: "User1" },
      { title: "Title 2", content: "Content 2", sender: "User2" },
    ]);

    const response = await request(app)
      .get("/posts")
      .query({ sender: "User1" });

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
    });

    const response = await request(app).delete(`/posts/${post._id}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe("Post Deleted");

    const postInDB = await postModel.findById(post._id);
    expect(postInDB).toBeNull();
  });

  it("should update a post by ID", async () => {
    const post = await postModel.create({
      title: "Original Title",
      content: "Original Content",
      sender: "User1",
    });

    const updatedPost = {
      title: "Updated Title",
      content: "Updated Content",
    };

    const response = await request(app)
      .put(`/posts/${post._id}`)
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

  it("should return 404 if a post to delete does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app).delete(`/posts/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe("Cannot find post");
  });
});
