import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import request from "supertest";
import mongoose from "mongoose";

import { createServer } from "../../server";
import config from "../../utils/config";

const app = createServer();

const mockUserId = new mongoose.Types.ObjectId();
const mockToken = jwt.sign({ _id: mockUserId }, config.auth.TOKEN_SECRET, {
  expiresIn: "1h",
});

describe("Files API (Integration Tests)", () => {
  describe("POST /file", () => {
    const testImagePath = path.join(__dirname, "test-image.jpg");

    beforeAll(() => {
      if (!fs.existsSync(testImagePath)) {
        fs.writeFileSync(testImagePath, "dummy image content");
      }
    });

    afterAll(() => {
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it("should upload an image successfully", async () => {
      const response = await request(app)
        .post("/files")
        .set("Authorization", `Bearer ${mockToken}`)
        .attach("file", testImagePath);

      expect(response.status).toBe(200);
      const { url } = response.body;
      expect(url).toContain(config.database.storage);
    });

    it("should return 400 if no file is uploaded", async () => {
      const response = await request(app)
        .post("/files")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });
});
