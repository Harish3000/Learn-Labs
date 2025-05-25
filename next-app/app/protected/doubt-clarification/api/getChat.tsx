import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";

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

const generateResponse = async (
  context: string,
  question: string,
  lectureTitle: string
) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY_DOUBT_CLAz!;

  const genAI = new GoogleGenerativeAI(apiKey);
  const tunedModelsdoubtclarifying = "gemini-1.5-flash";

  // tunedModels/doubtclarifyingv3-lo0wnxah3bbz
  //gemini-1.5-flash

  const model = genAI.getGenerativeModel({
    model: tunedModelsdoubtclarifying,
  });

  const prompt = `Use ONLY the provided context and lecture title to answer the question. Follow this logic strictly
STEP-BY-STEP LOGIC:
1. If the question is asking for the lecture title — or is phrased in any way that clearly means “What is the title of this lecture?” (e.g., “What’s this lecture called?”, “Name of the lecture?”, “Give the title”) — return ONLY the exact string from the lecture title.
2. If the answer is found in the context:
   → Proceed ONLY if the answer is **clearly and directly relevant to the lecture title**.  
   → If the answer is in the context but NOT clearly related to the lecture title, DO NOT return it. Treat it as NOT FOUND.
3 If the answer is NOT found in the context but is clearly related to the lecture title topic, you MAY answer using general knowledge.
→ If doing so, clearly indicate that it is not from the context.
4. If the answer is neither in the context nor inferable from the lecture title, return that it is not found.
Lecture Title: ${lectureTitle}
Context: ${context}
Question: ${question}
Respond ONLY in one of the following formats:
1. Answer is found in the context:
{"res": response_text, "timestamp": relevant timestamps from context}
2. Answer is NOT found in the context but is related to the lecture topic and answered using LLM’s general knowledge:
{"res": "Not in the lecture context. Based on general knowledge: response_text", "timestamp": "LLM-generated (not in context)"}
3. Answer is NOT found in the context and cannot be inferred from the lecture title:
{"res": "Not found in context", "timestamp": ""}, IMPORTANT: Return raw JSON only. Do NOT use any backticks or code formatting.`;

  console.log("Prompt:", prompt);
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response from Gemini.");
  }
};

export default async function GetChat(question: string, lectureTitle: string) {
  console.log(question);
  console.log("test", lectureTitle);

  if (!validateQuestion(question)) {
    return "Your question contains restricted terms. Please rephrase.";
  }

  try {
    // Perform vector search for relevant context
    const results = await vectorSearch(question);
    const context = results.map((chunk: any) => chunk.text).join("\n");

    // Pass lectureTitle to generateResponse
    const answer = await generateResponse(context, question, lectureTitle);

    // Send the response back to the client
    return answer;
  } catch (error) {
    console.error("Error in chat handler:", error);
    return "Failed to process the request.";
  }
}
