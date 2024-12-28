import request from "supertest";

import { createServer } from "../../server";
import { connectTestDB, disconnectTestDB } from "../setup";
import commentModel from "../../db/models/comment";
import { ObjectId } from "mongodb";

const app = createServer();

describe("Comments API (Integration Tests)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await commentModel.deleteMany(); // Clear the collection before each test
  });

  it("should create a comment", async () => {
    const newComment = {
      sender: "User1",
      postId: new ObjectId().toString(),
      content: "This is a comment.",
    };

    const response = await request(app).post("/comments").send(newComment);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newComment);

    const commentInDB = await commentModel.findById(response.body._id);
    expect(commentInDB).toBeTruthy();
    expect(commentInDB?.sender).toBe("User1");
  });

  it("should retrieve a comment by ID", async () => {
    const comment = {
      sender: "User1",
      postId: new ObjectId().toString(),
      content: "This is a test comment.",
    };
    const insertResult = await commentModel.create(comment);

    const response = await request(app).get(`/comments/${insertResult._id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(comment);
  });

  it("should retrieve comments by filter", async () => {
    await commentModel.create([
      {
        sender: "User1",
        postId: new ObjectId().toString(),
        content: "Comment 1",
      },
      {
        sender: "User2",
        postId: new ObjectId().toString(),
        content: "Comment 2",
      },
    ]);

    const response = await request(app)
      .get("/comments")
      .query({ sender: "User1" });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].sender).toBe("User1");
  });

  it("should delete a comment by ID", async () => {
    const comment = await commentModel.create({
      sender: "User1",
      postId: new ObjectId().toString(),
      content: "This comment will be deleted.",
    });

    const response = await request(app).delete(`/comments/${comment._id}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe("Comment Deleted");

    const commentInDB = await commentModel.findById(comment._id);
    expect(commentInDB).toBeNull();
  });

  it("should update a comment by ID", async () => {
    const comment = {
      sender: "User1",
      postId: new ObjectId().toString(),
      content: "Original Comment",
    };
    const commentDocument = await commentModel.create(comment);

    const response = await request(app)
      .put(`/comments/${commentDocument._id}`)
      .send({ ...comment, content: "Updated Comment" });

    expect(response.status).toBe(200);
    expect(response.text).toBe("Comment Updated");

    const updatedCommentInDB = await commentModel.findById(commentDocument._id);
    expect(updatedCommentInDB?.content).toBe("Updated Comment");
  });
});
