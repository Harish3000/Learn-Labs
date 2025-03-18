import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const analysisResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    language_tone_preference: {
      type: SchemaType.STRING,
      description: "User's preferred tone (e.g., 'informal tone')",
      nullable: false,
    },
    sentence_structure_preference: {
      type: SchemaType.STRING,
      description:
        "User's preference for sentence structure (e.g., 'short sentences')",
      nullable: false,
    },
    vocabulary_preference: {
      type: SchemaType.STRING,
      description:
        "User's preference for vocabulary (e.g., 'simple vocabulary')",
      nullable: false,
    },
    readability_preference: {
      type: SchemaType.STRING,
      description:
        "User's preference for readability (e.g., 'easy-to-read text')",
      nullable: false,
    },
    clarity_preference: {
      type: SchemaType.STRING,
      description:
        "User's preference for clarity (e.g., 'clear and direct communication')",
      nullable: false,
    },
    topic: {
      type: SchemaType.STRING,
      description: "Main topic of the content",
      nullable: false,
    },
    topic_summary: {
      type: SchemaType.STRING,
      description: "Brief summary of the topic to provide additional context",
      nullable: false,
    },
    detailed_analysis: {
      type: SchemaType.OBJECT,
      properties: {
        language_tone_comparison: {
          type: SchemaType.STRING,
          description:
            "Comparison of language tone between old and new versions",
          nullable: false,
        },
        sentence_structure_comparison: {
          type: SchemaType.STRING,
          description:
            "Comparison of sentence structure between old and new versions",
          nullable: false,
        },
        vocabulary_comparison: {
          type: SchemaType.STRING,
          description: "Comparison of vocabulary between old and new versions",
          nullable: false,
        },
        readability_comparison: {
          type: SchemaType.STRING,
          description: "Comparison of readability between old and new versions",
          nullable: false,
        },
        clarity_comparison: {
          type: SchemaType.STRING,
          description: "Comparison of clarity between old and new versions",
          nullable: false,
        },
      },
      required: [
        "language_tone_comparison",
        "sentence_structure_comparison",
        "vocabulary_comparison",
        "readability_comparison",
        "clarity_comparison",
      ],
    },
    statistical_comparison: {
      type: SchemaType.OBJECT,
      properties: {
        word_count_ratio: {
          type: SchemaType.NUMBER,
          description:
            "Normalized word count comparison between new and old versions (0 to 1)",
          nullable: false,
        },
        relevance_ratio: {
          type: SchemaType.NUMBER,
          description:
            "Measure of relevance of the new version compared to the old version (0 to 1)",
          nullable: false,
        },
        complexity_ratio: {
          type: SchemaType.NUMBER,
          description:
            "Normalized vocabulary complexity comparison between new and old versions (0 to 1)",
          nullable: false,
        },
      },
      required: ["word_count_ratio", "relevance_ratio", "complexity_ratio"],
    },
  },
  required: [
    "language_tone_preference",
    "sentence_structure_preference",
    "vocabulary_preference",
    "readability_preference",
    "clarity_preference",
    "topic",
    "topic_summary",
    "detailed_analysis",
    "statistical_comparison",
  ],
};

export async function POST(req: Request) {
  try {
    const { oldData, newData, userEmail } = await req.json();
    console.log("Analyzing changes:", { oldData, newData, userEmail });

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
      },
    });

    const prompt = `
      You are an assistant analyzing and comparing two versions of a text. Your task is to compare the old version with the new version, providing insights into how the text was adjusted based on language tone, sentence structure, vocabulary complexity, readability, and clarity. Based on this analysis, you'll also track user preferences and generate a detailed JSON response.

      Old version: ${JSON.stringify(oldData)}
      New version: ${JSON.stringify(newData)}

      Please provide normalized statistical comparison values for word count ratio, relevance ratio, and complexity ratio. These values should be highly accurate and reflect nuanced changes, ranging between 0 and 1, where 0 represents no change or the lowest level of difference, and 1 represents the highest level of change. Ensure these values are precise, incorporating incremental variations such as 0.1, 0.25, or 0.83, based on subtle language differences identified through analysis.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());

    console.log("Generated analysis:", analysis);

    const supabase = await createClient();

    // Manually generate and add required fields
    const analysisId = uuidv4();
    const generatedAt = new Date().toISOString();

    // Save the analysis to the database
    const { data, error } = await supabase
      .from("user_feedback_preferences")
      .insert({
        analysis_id: analysisId,
        user_email: userEmail,
        generated_at: generatedAt,
        ...analysis,
        vector: await generateEmbedding(JSON.stringify(analysis)),
      })
      .select();

    if (error) {
      throw new Error(`Error inserting analysis: ${error.message}`);
    }

    return NextResponse.json({
      message: "Analysis completed successfully",
      data,
    });
  } catch (error) {
    console.error("Error analyzing changes:", error);
    return NextResponse.json(
      { error: "Failed to analyze changes" },
      { status: 500 }
    );
  }
}

async function generateEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
