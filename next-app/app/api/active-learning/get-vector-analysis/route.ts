import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  calculateSemanticDrift,
  performClusterAnalysis,
  identifyOutliers,
} from "@/utils/vectorAnalysis";

type VectorData = {
  vector: number[] | string;
  update_timestamp: string;
  content_type: string;
  content_id: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      console.log("User email is missing in the request");
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching vector data for user: ${userEmail}`);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_feedback_preferences")
      .select("vector, update_timestamp, content_type, content_id")
      .eq("user_email", userEmail)
      .order("update_timestamp", { ascending: true });

    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(`Error fetching vector data: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log("No vector data found for the user");
      return NextResponse.json(
        { error: "No vector data found" },
        { status: 404 }
      );
    }

    console.log(`Retrieved ${data.length} vector entries`);
    const vectorData = data as VectorData[];
    const analysisData = analyzeVectorData(vectorData);

    console.log("Vector analysis completed successfully");
    return NextResponse.json(analysisData);
  } catch (error) {
    console.error("Error in vector analysis:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze vector data",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

function analyzeVectorData(data: VectorData[]) {
  console.log("Starting vector data analysis");
  const vectors = data.map((item) => parseVector(item.vector));
  const timestamps = data.map((item) => item.update_timestamp);
  const contentTypes = data.map((item) => item.content_type);
  const contentIds = data.map((item) => item.content_id);

  if (vectors.length === 0) {
    console.error("No valid vectors found in the data");
    throw new Error("No valid vectors found in the data");
  }

  console.log("Calculating cosine similarities");
  const cosineSimilarities = calculateCosineSimilarities(vectors);

  console.log("Calculating centroid distances");
  const centroid = calculateCentroid(vectors);
  const centroidDistances = calculateCentroidDistances(vectors, centroid);

  console.log("Calculating magnitudes");
  const magnitudes = calculateMagnitudes(vectors);

  console.log("Calculating semantic drift");
  const semanticDrift = calculateSemanticDrift(vectors, timestamps);

  console.log("Performing cluster analysis");
  const clusters = performClusterAnalysis(vectors);

  console.log("Identifying outliers");
  const outliers = identifyOutliers(vectors);

  console.log("Vector analysis completed");
  return {
    timestamps,
    contentTypes,
    contentIds,
    cosineSimilarities,
    centroidDistances,
    magnitudes,
    semanticDrift,
    clusters,
    outliers,
  };
}

function parseVector(vec: number[] | string): number[] {
  if (Array.isArray(vec)) {
    return vec;
  }
  if (typeof vec === "string") {
    try {
      // Remove brackets and split by comma
      return vec
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map(Number);
    } catch (error) {
      console.error("Error parsing vector string:", error);
      throw new Error("Invalid vector format");
    }
  }
  throw new Error("Invalid vector type");
}

function calculateCosineSimilarities(vectors: number[][]): number[] {
  return vectors.slice(1).map((vec, i) => cosineSimilarity(vectors[i], vec));
}

function calculateCentroid(vectors: number[][]): number[] {
  const sum = vectors.reduce(
    (acc, vec) => acc.map((val, i) => val + vec[i]),
    new Array(vectors[0].length).fill(0)
  );
  return sum.map((val) => val / vectors.length);
}

function calculateCentroidDistances(
  vectors: number[][],
  centroid: number[]
): number[] {
  return vectors.map((vec) => cosineSimilarity(vec, centroid));
}

function calculateMagnitudes(vectors: number[][]): number[] {
  return vectors.map((vec) =>
    Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0))
  );
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    console.error("Invalid vector type in cosineSimilarity:", { vecA, vecB });
    throw new Error("Invalid vector type");
  }

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    console.warn(
      "Zero magnitude vector detected in cosine similarity calculation"
    );
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
