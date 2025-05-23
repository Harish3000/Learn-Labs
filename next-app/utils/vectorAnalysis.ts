import { kmeans } from "ml-kmeans";

export function calculateSemanticDrift(
  vectors: number[][],
  timestamps: string[]
): number[] {
  console.log("Calculating semantic drift");
  const drift: number[] = [];
  for (let i = 1; i < vectors.length; i++) {
    const similarity = cosineSimilarity(vectors[i - 1], vectors[i]);
    const timeDiff =
      (new Date(timestamps[i]).getTime() -
        new Date(timestamps[i - 1]).getTime()) /
      (1000 * 60 * 60 * 24);
    drift.push(1 - similarity / timeDiff);
  }
  console.log(`Semantic drift calculated for ${drift.length} points`);
  return drift;
}

export function performClusterAnalysis(vectors: number[][]): number[] {
  console.log("Performing cluster analysis");
  const k = Math.min(5, Math.floor(vectors.length / 2));
  const options = {
    maxIterations: 100,
    tolerance: 1e-6,
    distanceFunction: euclideanDistance,
  };
  const result = kmeans(vectors, k, options);
  console.log(`Cluster analysis completed with ${k} clusters`);
  return result.clusters;
}

export function identifyOutliers(vectors: number[][]): boolean[] {
  console.log("Identifying outliers");
  const threshold = 2; // Adjust this threshold as needed
  const centroid = calculateCentroid(vectors);
  const distances = vectors.map((vec) => euclideanDistance(vec, centroid));
  const mean =
    distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
  const stdDev = Math.sqrt(
    distances.reduce((sum, dist) => sum + Math.pow(dist - mean, 2), 0) /
      distances.length
  );
  const outliers = distances.map((dist) => (dist - mean) / stdDev > threshold);
  console.log(`Identified ${outliers.filter(Boolean).length} outliers`);
  return outliers;
}

function calculateCentroid(vectors: number[][]): number[] {
  const sum = vectors.reduce(
    (acc, vec) => acc.map((val, i) => val + vec[i]),
    new Array(vectors[0].length).fill(0)
  );
  return sum.map((val) => val / vectors.length);
}

function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    console.error("Invalid vector type in euclideanDistance:", { vecA, vecB });
    throw new Error("Invalid vector type");
  }
  return Math.sqrt(
    vecA.reduce((sum, a, i) => sum + Math.pow(a - vecB[i], 2), 0)
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
