import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

export default client;
