import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";
//import prompt from "./command";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const validateQuestion = (question: string): boolean => {
  const forbiddenPatterns = [
    /jailbreak/i,
    /bypass/i,
    /override/i,
    /ignore/i,
    /exploit/i,
    /ethical hacking/i,
    /cheat code/i,
    /system prompt/i,
    /developer mode/i,
    /debug mode/i,
    /confidential/i,
    /private/i,
    /hack/i,
    /crack/i,
    /unlock/i,
  ];

  return !forbiddenPatterns.some((pattern) => pattern.test(question));
};

const RATE_LIMIT_WINDOW = 60 * 10000;
const MAX_REQUESTS = 750; // Maximum requests per window
const rateLimit = new Map<string, { count: number; lastRequest: number }>();

const checkRateLimit = (ip: string): boolean => {
  const currentTime = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry) {
    rateLimit.set(ip, { count: 1, lastRequest: currentTime });
    return true;
  }

  if (currentTime - entry.lastRequest > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, lastRequest: currentTime });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  entry.lastRequest = currentTime;
  rateLimit.set(ip, entry);
  return true;
};

console.log("Test get chat:", supabase);

// LangChain setup for embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY_DOUBT_CLA!,
  modelName: "text-embedding-004",
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});

const vectorSearch = async (query: string) => {
  console.log("Test get chat:", query);
  // Generate embedding using LangChain
  const queryEmbedding = await embeddings.embedQuery(query);

  console.log("queryEmbedding:", queryEmbedding);

  // Perform Supabase  RPC call for vector search
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    similarity_threshold: 0.4,
    match_count: 3,
  });

  console.log("data:", data);

  if (error) {
    throw new Error(`Vector search error: ${error.message}`);
  }

  return data || [];
};

const generateResponse = async (context: string, question: string) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY_DOUBT_CLAz!;

  const genAI = new GoogleGenerativeAI(apiKey);

  // tunedModels/doubtclarifyingv3-lo0wnxah3bbz
  //gemini-1.5-flash
  const model = genAI.getGenerativeModel({
    model: "tunedModels/doubtclarifyingv6-8xgw6oo36twd",
  });

  const prompt = `You are a helpful assistant. ONLY use the provided context to answer the question. DO NOT use general knowledge, assumptions, or external information.
  If the context does NOT contain relevant information to answer the question, respond with:
  {"res": "Not found in context", "timestamp": ""}
  Context: ${context}
  Question: ${question}
  Respond ONLY with a JSON object in this structure:
  {"res": response_text, "timestamp": relevant timestamps from context}
  Instructions:If context includes relevant timestamps, refer to them ,If no relevant content, return "Not found in context" and set timestamp to an empty string.,If the response is "Not found in context," ALWAYS set the timestamp to an empty string.
  - Do NOT use phrases like "Based on the context."
  - Keep responses short, clear, and direct.
  - Do NOT guess, infer, or use external knowledge.
  - DO NOT include markdown formatting, extra symbols, or backticks. Return ONLY the raw JSON object as plain text, **without any formatting** or code block markers.`;

  try {
    // Generate content using the model with the prompt
    const result = await model.generateContent(prompt);

    const x = result.response.text();
    console.log("response:", x);

    // Return the response content from the model
    return result.response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response from Gemini.");
  }
};

export default async function GetChat(question: string) {
  console.log(question);

  if (!validateQuestion(question)) {
    return "Your question contains restricted terms. Please rephrase.";
  }

  try {
    // Perform vector search for relevant context
    const results = await vectorSearch(question);
    const context = results.map((chunk: any) => chunk.text).join("\n");

    // Generate AI response using direct Gemini call
    const answer = await generateResponse(context, question);

    // Send the response back to the client
    return answer;
  } catch (error) {
    console.error("Error in chat handler:", error);
    return "Failed to process the request.";
  }
}
