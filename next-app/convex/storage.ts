import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const generateUploadUrl = mutation(async (ctx) => {
 const url = await ctx.storage.generateUploadUrl();
console.log("Generated upload URL:", url);
return url;
});

export const AddFileEntryToDb = mutation({
  args:
  {
        fileId: v.string(),
        storageId: v.string(),
        fileName: v.string(),
        fileUrl:v.string(),
        createdBy: v.any()
  },
  handler: async (ctx, args) => {
    const result =await ctx.db.insert("pdfFiles", {
       fileId: args.fileId,
        storageId: args.storageId,
        fileName: args.fileName,
        fileUrl:args.fileUrl,
        createdBy:args.createdBy
    });
    console.log("File entry added to DB:", result);
    return 'Inserted';
  },
});

export const getFileUrl = mutation({
  args: {
    storageId: v.string()
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    console.log("Fetched file URL for storageId:", args.storageId, "URL:", url);
    return url;
  }
})

export const GetFileRecord = query({
  args: {
    fileId: v.string()
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("pdfFiles").filter((q) => q.eq(q.field('fileId'), args.fileId)).first();
  console.log("GetFileRecord results for fileId:", args.fileId, "Result:", result);
    return result;
  }
})

export const GetUserFiles = query({
  
  args: {
    createdBy: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    if (!args?.createdBy) {
      console.log("No 'createdBy' argument provided.");
      return;
    }
    const result = await ctx.db.query("pdfFiles").filter((q) => q.eq(q.field('createdBy'), args.createdBy)).collect();
    console.log("Fetched user files for createdBy:", args.createdBy, "Results:", result);
    return result;
  }
})
