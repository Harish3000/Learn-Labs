import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { chatSession } from "@/configs/ai-model";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY_intellinote!);


export const AddNotes = mutation({
  args: {
    fileId: v.string(),
    notes: v.any(),
    createdBy: v.any()
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("notes")
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .first();
        
        if (!record) {
      // Insert a new record if none exists
      await ctx.db.insert("notes", {
        fileId: args.fileId,
        notes: args.notes,
        createdBy: args.createdBy
      });
          console.log("Added new notes for fileId:", args.fileId);
    } else {
      // Update existing record with new notes
          await ctx.db.patch(record._id, { notes: args.notes });
          console.log("Updated notes for fileId:", args.fileId);
    }
  },
});

export const GetNotes = query({
  args: {
    fileId:v.string()
  },
  handler: async(ctx, args)=>{
    const result = await ctx.db
      .query("notes")
      .filter((q) => q.eq(q.field("fileId"),args.fileId))
      .first();
    return result?.notes ?? '';
  }
})

export const GetAllNotes = query({
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").order("desc").take(10); // Fetch latest 10 notes
    const enrichedNotes = await Promise.all(
      notes.map(async (note) => {
        const file = await ctx.db.query("pdfFiles").filter((q) => q.eq(q.field('fileId'), note.fileId)).first();
        return {
          ...note,
          fileName: file?.fileName || "Unknown",
        };
      })
    );
    return enrichedNotes;
  },
});


export const GetTopKeywords = query({
  handler: async (ctx) => {
    const result = await ctx.db.query("notes").collect();
    const allText = result.map((note) => note.notes).join(" "); // Combine all notes into a single string

    // Function to extract keyword frequencies
    const getKeywordFrequencies = (text: string) => {
      const words = text.toLowerCase().match(/\b\w+\b/g) || []; // Tokenize words
      const stopwords = new Set(["the", "and", "is", "of", "to", "in", "that", "with", "for", "on", "it", "by"]); // Basic stopwords
      const keywordMap = new Map<string, number>();

      for (const word of words) {
        if (!stopwords.has(word) && word.length > 2) {
          keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
        }
      }

      return Array.from(keywordMap.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by frequency
        .slice(0, 5) // Get top 5 keywords
        .map(([keyword, count]) => ({ keyword, count }));
    };

    return getKeywordFrequencies(allText);
  },
});



export const GetRecommendedTopics = query({
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").collect();
    const allText = notes.map((note) => note.notes).join(" ");

    const extractKeywords = (text: string) => {
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      const stopwords = new Set(["the", "and", "is", "of", "to", "in", "that", "with", "for", "on", "it", "by"]);
      const keywordMap = new Map();

      for (const word of words) {
        if (!stopwords.has(word) && word.length > 3) {
          keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
        }
      }

      return Array.from(keywordMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([keyword]) => keyword);
    };

    const generateTopics = async (keywords: string[]) => {
      const prompt = `Generate five creative and relevant academic topics using the following keywords: ${keywords.join(", ")}. The topics should be clear, engaging, and suitable for an educational setting.`;
      
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      try {
        const response = await model.generateContent(prompt);
        const generatedText = response.response.text();  
        return generatedText.split("\n").filter((line) => line.trim() !== "");  
      } catch (error) {
        console.error("Error generating topics:", error);
        return ["Error generating topics. Please try again."];
      }
    };

    const keywords = extractKeywords(allText);
    return await generateTopics(keywords);
  },
});

