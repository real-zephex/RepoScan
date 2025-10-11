import Groq from "groq-sdk";

const GroqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default GroqClient;
