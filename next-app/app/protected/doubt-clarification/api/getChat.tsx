import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

console.log("Test get chat:", supabase);

// LangChain setup for embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!,
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
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!;

  // Initialize the GoogleGenerativeAI client with your API key
  const genAI = new GoogleGenerativeAI(apiKey);

  // Get the specific model (e.g., "gemini-1.5-flash")
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Create the prompt for the model
  const prompt = `
  You are a helpful assistant. If context is provided, refer to relevant timestamps and details in your response. If no context is provided, respond with a concise, general answer to the question.
  Context: ${context} Question: ${question} 
  The response should be a JSON object with the following structure:
  {res: response_text, timestamp: refer to relevant timestamps} Send only the json object starting from {, nothing else.
  Note: Ensure your responses are clear, direct, very short,not send timestamp in res section only in timestamp section, Direct and avoid repetitive phrases such as "The provided text" or "Based on the provided.
  `;

  try {
    // Generate content using the model with the prompt
    const result = await model.generateContent(prompt);
    console.log(result);
    const x = result.response.text();
    console.log(x);
    const y = JSON.parse(x);
    console.log(y);

    // Return the response content from the model
    return result.response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response from Gemini.");
  }
};

export default async function GetChat(question: string) {
  console.log(question);
  try {
    // Step 1: Perform vector search for relevant context
    const results = await vectorSearch(question);
    const context = results.map((chunk: any) => chunk.text).join("\n");

    // Step 2: Generate AI response using direct Gemini API call
    const answer = await generateResponse(context, question);

    // Send the response back to the client
    return answer;
  } catch (error) {
    console.error("Error in chat handler:", error);
    return "Failed to process the request.";
  }
}
