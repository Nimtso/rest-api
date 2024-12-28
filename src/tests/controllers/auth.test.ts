import jwt from "jsonwebtoken";
import request from "supertest";

import userModel from "../../db/models/user";
import { createServer } from "../../server";
import { connectTestDB, disconnectTestDB } from "../setup";

const app = createServer();

describe("Auth API (Integration Tests)", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  beforeEach(async () => {
    await userModel.deleteMany();
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const newUser = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app).post("/auth/register").send(newUser);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ email: newUser.email });
      expect(response.body.password).toBeUndefined();

      const userInDB = await userModel.findOne({ email: newUser.email });
      expect(userInDB).toBeTruthy();
    });
  });

  describe("POST /auth/login", () => {
    it("should login an existing user and return tokens", async () => {
      const user = await userModel.create({
        email: "test@example.com",
        password: "password123",
      });

      const response = await request(app).post("/auth/login").send({
        email: user.email,
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should return 400 for invalid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /auth/refresh", () => {
    it.only("should refresh tokens with a valid refresh token", async () => {
      const user = await userModel.create({
        email: "test@example.com",
        password: "password123",
      });

      const response = await request(app).post("/auth/refresh").send({
        refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should return 400 for an invalid refresh token", async () => {
      const response = await request(app).post("/auth/refresh").send({
        refreshToken: "invalidToken",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /auth/logout", () => {
    it("should logout a user and invalidate the refresh token", async () => {
      const user = await userModel.create({
        email: "test@example.com",
        password: "password123",
      });

      const refreshToken = jwt.sign({ id: user._id }, "refresh_secret", {
        expiresIn: "7d",
      });

      const response = await request(app).post("/auth/logout").send({
        refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Logged out successfully"
      );
    });

    it("should return 400 for an invalid refresh token", async () => {
      const response = await request(app).post("/auth/logout").send({
        refreshToken: "invalidToken",
      });

      expect(response.status).toBe(400);
    });
  });
});
