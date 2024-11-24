import { mutation, query } from "./_generated/server";
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
    return 'Inserted';
  },
});

export const getFileUrl = mutation({
  args: {
    storageId: v.string()
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  }
})

export const GetFileRecord = query({
  args: {
    fileId: v.string()
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("pdfFiles").filter((q) => q.eq(q.field('fileId'), args.fileId)).first();
    console.log(result);
    return result;
  }
})

export const GetUserFiles = query({
  
  args: {
    createdBy: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    if(!args?.createdBy){
      return;
    }
    const result = await ctx.db.query("pdfFiles").filter((q) => q.eq(q.field('createdBy'), args.createdBy)).first();
    return result;
  }
})
