import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Function to split transcript into chunks
const splitTextIntoChunks = (
  text: string,
  chunkSize: number = 300
): string[] => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

// Function to generate embeddings using Google Gemini API
const generateEmbedding = async (text: string) => {
  const response = await fetch("https://api.google.com/gemini/v1/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GOOGLE_GEMINI_API_KEY}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) throw new Error("Failed to generate embedding");

  const data = await response.json();
  return data.embedding; // Adjust based on actual response structure
};

// Main API route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const video_id = "xRiwgtdyjQk"; // Hard-coded value for testing

  try {
    // Step 1: Fetch the transcript
    const response = await fetch(
      `http://localhost:8000/transcript/${video_id}`
    );
    const { transcript } = await response.json();

    if (!transcript) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    // Step 2: Split transcript into smaller chunks
    const chunks = splitTextIntoChunks(transcript);

    // Step 3: Generate embeddings for each chunk and store in Supabase
    const embeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk);

        // Insert each embedding into Supabase
        const { data, error } = await supabase.from("embeddings").insert([
          {
            video_id,
            chunk,
            embedding,
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
