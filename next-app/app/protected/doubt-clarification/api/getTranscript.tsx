import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize LangChain Google Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // Use the text-embedding-004 model (768 dimensions)
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});

// Function to split transcript into chunks based on token limit
const splitTextIntoChunks = (
  text: string,
  chunkSize: number = 500
): string[] => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

// Function to generate embeddings using LangChain's GoogleGenerativeAIEmbeddings
const generateEmbedding = async (text: string) => {
  const embedding = await embeddings.embedDocuments([text]);
  if (!embedding || !embedding[0]) {
    throw new Error("Failed to generate embedding");
  }
  return embedding[0];
};

// Main API route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract lecture and video metadata from the request, e.g., video_id and lecture_id
  // const video_id = "xRiwgtdyjQk";
  const { video_id, lecture_id } = req.query;

  if (!video_id || !lecture_id) {
    return res
      .status(400)
      .json({ error: "video_id and lecture_id are required" });
  }

  try {
    // Step 1: Call external API to fetch the transcript
    const fastApiResponse = await fetch(
      `http://127.0.0.1:8000/transcript/${video_id}`
    );
    const { transcript } = await fastApiResponse.json();

    if (!transcript) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    // Step 2: Split transcript into smaller chunks
    const chunks = splitTextIntoChunks(transcript);

    // Step 3: Generate embeddings and insert each chunk into Supabase
    const embeddings = await Promise.all(
      chunks.map(async (chunk, index) => {
        // Generate embedding for the transcript chunk
        const embedding = await generateEmbedding(chunk);

        // Insert each chunk and embedding into the `transcript_chunks` table
        const { data, error } = await supabase
          .from("transcript_chunks_test")
          .insert([
            {
              video_id,
              lecture_id,
              start_time: index * 10,
              text: chunk,
              embedding,
              chunk_sequence: index + 1,
            },
          ]);

        if (error) {
          throw new Error(
            `Failed to insert embedding into Supabase: ${error.message}`
          );
        }

        return data;
      })
    );

    res.status(200).json({
      message: "Transcript embedded and stored successfully",
      embeddings,
    });
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process transcript";
    res.status(500).json({ error: errorMessage });
  }
}
