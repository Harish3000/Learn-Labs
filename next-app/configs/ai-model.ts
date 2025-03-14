import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
  GenerationConfig,
} from "@google/generative-ai";

//grammer check api key
const apiKey: string ='AIzaSyB9-suI-nIGx1--xsjxjEi3reOFD7u0Y0c'
// default api key
// const apiKey: string = `AIzaSyD01IOfTQfBBpgPvYT0YCU_cAVKJGwPOSs`;
const genAI = new GoogleGenerativeAI(apiKey);

const model: GenerativeModel = genAI.getGenerativeModel({
      // model: "gemini-1.5-flash",
  model: "tunedModels/grammardataset1-js9icitawa2k",
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

  
