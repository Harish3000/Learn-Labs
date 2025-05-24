import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
  GenerationConfig,
} from "@google/generative-ai";

//intellinote api key
// const apiKey: string ='AIzaSyBUd3SeazOqi66Rcpc6HzkTC0YyZk2hpdU'
// default api key
const apiKey: string = `AIzaSyCgkJhM2g7diEVKanhfqeVNtxf04hba0LY`;
const genAI = new GoogleGenerativeAI(apiKey);

const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
  // model:"tunedModels/final-intellinote-model-3ahfy3uq2flx"
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

  
