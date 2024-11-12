import { mutation } from "./_generated/server";
import { v } from "convex/values";


export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});



export const AddFileEntryToDb = mutation({
  args:
  {
        fileId: v.string(),
        storageId: v.string(),
        fileName: v.string(),
        createdBy: v.string(),
        createdAt: v.string()
  },
  handler: async (ctx, args) => {
    const result =await ctx.db.insert("pdfFiles", {
       fileId: args.fileId,
        storageId: args.storageId,
        fileName:args.fileName,
        createdBy:args.createdBy,
        createdAt:args.createdAt
    });
    return 'Inserted';
  },
});
