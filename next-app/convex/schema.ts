import { defineSchema, defineTable } from 'convex/server';
import {v} from 'convex/values';

export default defineSchema({
    users: defineTable({
        id: v.string(),
        userName: v.string(),
        email: v.string(),
        createdAt:v.string()
    }),

    pdfFiles: defineTable({
        fileId: v.string(),
        storageId: v.string(),
        fileName: v.string(),
        createdBy: v.string(),
        createdAt: v.string()
    })
});
