import { z } from "zod";

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  links: z
    .array(
      z
        .string()
        .url("A valid URL is required")
        .regex(
          /^https:\/\/(www\.)?(youtube\.com|youtu\.be|drive\.google\.com)\/.+$/,
          "Link must be a valid YouTube or Google Drive URL"
        )
    )
    .min(1, "At least one link is required"),
});
