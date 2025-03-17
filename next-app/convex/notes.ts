import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


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
