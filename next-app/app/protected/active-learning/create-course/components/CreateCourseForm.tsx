"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const createCourseSchema = z.object({
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
          /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
          "Link must be a valid YouTube URL"
        )
    )
    .min(1, "At least one link is required"),
});

type FormData = z.infer<typeof createCourseSchema>;

export default function CreateCourseForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      links: [""],
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/active-learning/create-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create course");
      const result = await response.json();
      router.push(
        `/protected/active-learning/create-course/verify?urls=${encodeURIComponent(JSON.stringify(data.links))}`
      );
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl">Course Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the main topic of the course"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {form.watch("links").map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FormField
                control={form.control}
                name={`links.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl">
                      YouTube Link {index + 1}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter YouTube URL" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>
          ))}
          <Separator className="flex-[1]" />
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.setValue("links", [...form.watch("links"), ""])
              }
            >
              Add Link <Plus className="w-4 h-4 ml-2" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.setValue("links", form.watch("links").slice(0, -1))
              }
              disabled={form.watch("links").length <= 1}
            >
              Remove Link <Trash className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Course..." : "Create Course"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
