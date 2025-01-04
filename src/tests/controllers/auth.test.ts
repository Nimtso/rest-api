import request from "supertest";

import { connectTestDB, disconnectTestDB } from "../setup";
import { createServer } from "../../server";
import UserModel from "../../db/models/user";
import jwt from "jsonwebtoken";
import config from "../../utils/config";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

const app = createServer();
const { TOKEN_SECRET } = config.auth;

describe("Auth API (Integration Tests)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await UserModel.deleteMany();
  });

  it("should register a new user", async () => {
    const newUser = {
      email: "test@example.com",
      password: "password123",
    };

    const response = await request(app).post("/auth/register").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      message: "User registered successfully",
      user: { email: "test@example.com" },
    });

    const userInDB = await UserModel.findOne({ email: "test@example.com" });
    expect(userInDB).toBeTruthy();
    expect(userInDB?.email).toBe("test@example.com");
  });

  it("should not register a user with an existing email", async () => {
    await UserModel.create({
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "User already exists");
  });

  it("should login a registered user", async () => {
    const user = new UserModel({
      email: "test@example.com",
      password: "password123",
    });
    await user.save();

    const response = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    const userInDB = await UserModel.findOne({ email: "test@example.com" });
    expect(userInDB).toBeTruthy();
    expect(userInDB?.refreshToken).toContain(response.body.refreshToken);
  });

  it("should not login with invalid credentials", async () => {
    await UserModel.create({
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should refresh tokens", async () => {
    const user = new UserModel({
      email: "test@example.com",
      password: "password123",
    });
    await user.save();

    const refreshToken = jwt.sign(
      { _id: user._id, email: user.email },
      TOKEN_SECRET
    );
    user.refreshToken.push(refreshToken);
    await user.save();

    const response = await request(app).post("/auth/refresh").send({
      refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    const userInDB = await UserModel.findById(user._id);
    expect(userInDB?.refreshToken).toContain(response.body.refreshToken);
    expect(userInDB?.refreshToken).not.toContain(refreshToken);
  });

  it("should not refresh tokens with an invalid token", async () => {
    const response = await request(app).post("/auth/refresh").send({
      refreshToken: "invalidToken",
    });

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(response.body).toHaveProperty("message", "Invalid refresh token");
  });

  it("should logout a user", async () => {
    const user = new UserModel({
      email: "test@example.com",
      password: "password123",
    });
    await user.save();

    const refreshToken = jwt.sign(
      { _id: user._id, email: user.email },
      TOKEN_SECRET
    );
    user.refreshToken.push(refreshToken);
    await user.save();

    const response = await request(app).post("/auth/logout").send({
      refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Logout successful");

    const userInDB = await UserModel.findById(user._id);
    expect(userInDB?.refreshToken).not.toContain(refreshToken);
  });

  it("should return 400 if refreshToken is missing in refresh endpoint", async () => {
    const response = await request(app).post("/auth/refresh").send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Refresh token is required"
    );
  });

  it("should return 401 if user is not found for valid refreshToken", async () => {
    const refreshToken = jwt.sign(
      { _id: new mongoose.Types.ObjectId() },
      TOKEN_SECRET
    );

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid refresh token");
  });

  it("should return 401 for expired refreshToken", async () => {
    const expiredToken = jwt.sign(
      { _id: new mongoose.Types.ObjectId() },
      TOKEN_SECRET,
      { expiresIn: "-10s" }
    );

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: expiredToken });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Refresh token has expired"
    );
  });

  it("should return 401 for malformed refreshToken", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "malformed.token.string" });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid refresh token");
  });

  it("should return 401 if user is not found during logout", async () => {
    const refreshToken = jwt.sign(
      { _id: new mongoose.Types.ObjectId() },
      TOKEN_SECRET
    );

    const response = await request(app)
      .post("/auth/logout")
      .send({ refreshToken });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid refresh token");
  });

  it("should return 401 for invalid refreshToken during logout", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: "malformed.token.string" });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid refresh token");
  });
});
