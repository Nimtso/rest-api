import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import Logger from "../utils/logger";
import config from "../utils/config";

const API_KEY = config.auth.GEMINI_API_KEY;

const prompt = `
  Analyze this image and generate:
  1. Provide an interesting, funny, or attractive title (up to 3 words). Format: Title: [Your Title]
  2. A description (max 75 characters). Format: Content: [Your Description]
  Return only these two lines without extra words.
`;

const isValidImageUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return true;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(parsedUrl.pathname);
  } catch {
    return false;
  }
};

const analyzeImage = async (imageUrl: string, maxRetries = 5, delay = 1000) => {
  if (!isValidImageUrl(imageUrl)) {
    throw new Error("Invalid image URL. Only remote image URLs are allowed.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  let imageBase64: string;

  try {
    Logger.info(`Downloading image from URL: ${imageUrl}`);
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    imageBase64 = Buffer.from(response.data, "binary").toString("base64");
  } catch (error) {
    throw new Error("Failed to download the image from the URL.");
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      Logger.info("Requesting Gemini API...");
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
      ]);
      return extractTitleAndContent(result.response.text());
    } catch (error: any) {
      Logger.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error("Error analyzing image. Max retries reached");
};

const extractTitleAndContent = (responseText: string) => {
  const lines = responseText.trim().split("\n");

  const title = lines.find((line) => line.startsWith("Title:"));
  const content = lines.find((line) => line.startsWith("Content:"));

  return {
    title: title ? title.replace("Title: ", "").trim() : null,
    content: content ? content.replace("Content: ", "").trim() : null,
  };
};

export { analyzeImage };
