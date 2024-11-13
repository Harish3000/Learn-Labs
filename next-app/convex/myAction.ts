import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";

interface IngestArgs {
  splitText: string; // assuming splitText is an array of strings
  fileId: string;
}

export const ingest = action({
    args: {
        splitText: v.any(),
        fileId : v.string(),
  },
  handler: async (ctx, args:IngestArgs) => {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: 'AIzaSyD01IOfTQfBBpgPvYT0YCU_cAVKJGwPOSs',
      model: "text-embedding-004", // 768 dimensions
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
    });
    await ConvexVectorStore.fromTexts(
      args.splitText,
      args.fileId,
      embeddings,
      { ctx }
      );
        return "Completed";
  },
});

export const search = action({
  args: {
    query: v.string(),
    fileId:v.string()
  },
  handler: async (ctx, args) => {
    const vectorStore = new ConvexVectorStore(
      new GoogleGenerativeAIEmbeddings({
      apiKey: 'AIzaSyD01IOfTQfBBpgPvYT0YCU_cAVKJGwPOSs',
      model: "text-embedding-004", // 768 dimensions
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
    }), { ctx });

    const resultOne = (await vectorStore.similaritySearch(args.query, 1)).filter(q=>q.metadata.fileId==args.fileId);
    console.log(resultOne);
    return JSON.stringify(resultOne);
  },
});
