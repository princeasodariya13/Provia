const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  console.log("Checking model...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const res = await model.generateContent("hello");
    console.log("1.5-flash works:", res.response.text());
  } catch(e) {
    console.log("1.5 error:", e.message);
  }
}
main();
