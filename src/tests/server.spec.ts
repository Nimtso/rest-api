import { createServer } from "../../src/server";

describe("Server Initialization", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should throw an error if required environment variables are missing", () => {
    process.env = { ...originalEnv, TOKEN_SECRET: undefined }; // Remove TOKEN_SECRET
    expect(() => createServer()).toThrowError(
      "Missing required environment variables"
    );
  });
});
