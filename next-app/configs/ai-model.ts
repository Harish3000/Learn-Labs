import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
  ChatSession,
  GenerationConfig,
} from "@google/generative-ai";

const apiKey: string ='AIzaSyD01IOfTQfBBpgPvYT0YCU_cAVKJGwPOSs'
const genAI = new GoogleGenerativeAI(apiKey);

const model: GenerativeModel = genAI.getGenerativeModel({
    //   model: "gemini-1.5-flash",
    model: "gemini-1.5-pro",
});

const generationConfig: GenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};


  export const chatSession: ChatSession = model.startChat({
    generationConfig,
    history: [],
  });
