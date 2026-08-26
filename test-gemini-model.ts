import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./lib/env";

async function main() {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
  
  const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-2.5-flash", "gemini-3.6-flash"];
  
  for (const modelName of modelsToTest) {
    console.log(`Checking model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent("hello");
      console.log(`[SUCCESS] ${modelName} works:`, res.response.text());
    } catch(e) {
      console.log(`[FAIL] ${modelName} error:`, e.message);
    }
  }
}
main();
