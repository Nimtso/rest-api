import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import Logger from "../utils/logger";
import config from "../utils/config";

const API_KEY = config.auth.GEMINI_API_KEY;

const prompt = `
  Analyze this image and generate:
  1. Provide an interesting, funny, or attractive title (up to 3 words). Format: Title: [Your Title]
  2. A description (max 75 characters). Format: Content: [Your Description]
  Return only these two lines without extra words.
`;

const analyzeImage = async (filePath: string, maxRetries = 5, delay = 1000) => {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // Read and encode image as base64
  const imageBuffer = fs.readFileSync(`${process.cwd()}/${filePath}`);
  const imageBase64 = imageBuffer.toString("base64");

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      Logger.info("requesting Gemini API...");
      const result = await model.generateContent([
        {
          text: prompt,
        },
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
      ]);
      const response = extractTitleAndContent(result.response.text());
      return response;
    } catch (error: any) {
      Logger.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));

      delay *= 2; // Exponential backoff
    }
  }

  throw new Error("Error analyzing image. Max retries reached");
};

const extractTitleAndContent = (responseText: string) => {
  let lines = responseText.trim().split("\n");

  const title = lines.find((line) => line.startsWith("Title:"));
  const content = lines.find((line) => line.startsWith("Content:"));

  return {
    title: title ? title.replace("Title: ", "").trim() : null,
    content: content ? content.replace("Content: ", "").trim() : null,
  };
};

export { analyzeImage };
