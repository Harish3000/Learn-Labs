import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";

interface IngestArgs {
  splitText: any;
  fileId: string;
}

export const ingest = action({
    args: {
        splitText: v.any(),
        fileId : v.string(),
  },
  handler: async (ctx, args: IngestArgs) => {
      const metadataArray = args.splitText.map(() => ({
      fileId: args.fileId  // Single fileId instead of split characters
    }));
    await ConvexVectorStore.fromTexts(
      args.splitText,
     metadataArray, 
      new GoogleGenerativeAIEmbeddings({
      apiKey: 'AIzaSyD01IOfTQfBBpgPvYT0YCU_cAVKJGwPOSs',
      model: "text-embedding-004", // 768 dimensions
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
    }),
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

    // const resultOne = (await vectorStore.similaritySearch(args.query, 1)).filter(q=>q.metadata.fileId == args.fileId);
    // console.log(resultOne);
    // return JSON.stringify(resultOne);

    // chat gpt
//     const resultOne = await vectorStore.similaritySearch(args.query, 1);
    // console.log("Unfiltered Results:", resultOne);


    
 // Perform the similarity search
    const results = await vectorStore.similaritySearch(args.query, 1);
    
    // Filter results to only include documents with matching fileId
    const filteredResults = results.filter(doc => doc.metadata.fileId === args.fileId);
    
    // Format the response to match the desired structure
    const formattedResponse = filteredResults.map(doc => ({
      pageContent: doc.pageContent,
      metadata: {
        fileId: doc.metadata.fileId
      }
    }));

    return JSON.stringify(formattedResponse);





  },
});
