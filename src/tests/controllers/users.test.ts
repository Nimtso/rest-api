import request from "supertest";
import mongoose from "mongoose";

import { connectTestDB, disconnectTestDB } from "../setup";
import { createServer } from "../../server";
import userModel from "../../db/models/user";
import { ObjectId } from "mongodb";
const app = createServer();

describe("Users API (Integration Tests)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await userModel.deleteMany();
  });

  it("should create a user", async () => {
    const newUser = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
    };

    const response = await request(app).post("/users").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: "John Doe",
      email: "john.doe@example.com",
    });

    const userInDB = await userModel.findById(response.body._id);
    expect(userInDB).toBeTruthy();
    expect(userInDB?.email).toBe("john.doe@example.com");
  });

  it("should not create a user with invalid data", async () => {
    const invalidUser = {
      name: "",
      email: "invalid-email",
    };

    const response = await request(app).post("/users").send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should retrieve a user by ID", async () => {
    const user = await userModel.create({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "securepassword",
    });

    const response = await request(app).get(`/users/${user._id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: "Jane Doe",
      email: "jane.doe@example.com",
    });
  });

  it("should retrieve users by filter", async () => {
    await userModel.create([
      { name: "Alice", email: "alice@example.com", password: "password1" },
      { name: "Bob", email: "bob@example.com", password: "password2" },
    ]);

    const response = await request(app).get("/users").query({ name: "Alice" });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toMatchObject({
      name: "Alice",
      email: "alice@example.com",
    });
  });

  it("should delete a user by ID", async () => {
    const user = await userModel.create({
      name: "To Be Deleted",
      email: "delete.me@example.com",
      password: "password",
    });

    const response = await request(app).delete(`/users/${user._id}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe("Item deleted");

    const userInDB = await userModel.findById(user._id);
    expect(userInDB).toBeNull();
  });

  it("should update a user by ID", async () => {
    const user = await userModel.create({
      name: "Original Name",
      email: "original@example.com",
      password: "originalpassword",
    });

    const updatedUser = {
      name: "Updated Name",
      email: "updated@example.com",
    };

    const response = await request(app)
      .put(`/users/${user._id}`)
      .send(updatedUser);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: "Updated Name",
      email: "updated@example.com",
    });

    const updatedUserInDB = await userModel.findById(user._id);
    expect(updatedUserInDB?.name).toBe("Updated Name");
    expect(updatedUserInDB?.email).toBe("updated@example.com");
  });

  it("should get 404 for trying to update non-existing user", async () => {
    const response = await request(app)
      .put(`/users/${new ObjectId().toString()}`)
      .send({
        name: "Nonexistent User",
      });

    expect(response.status).toBe(404);
  });

  it("should return 404 if a user to delete does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app).delete(`/users/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe("Cannot find item");
  });
});
