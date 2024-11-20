// import {
//   GoogleGenerativeAI,
//   HarmCategory,
//   HarmBlockThreshold,
//   GenerativeModel,
//   ChatSession,
//   GenerationConfig,
// } from "@google/generative-ai";

// const apiKey: string = process.env.GOOGLE_GENERATIVE_AI_API_KEY as string;
// const genAI = new GoogleGenerativeAI(apiKey);

// const model: GenerativeModel = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash",
// });

// const generationConfig: GenerationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 40,
//   maxOutputTokens: 8192,
//   responseMimeType: "text/plain",
// };


//   export const chatSession: ChatSession = model.startChat({
//     generationConfig,
//     history: [],
//   });





//   const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
//   console.log(result.response.text());
