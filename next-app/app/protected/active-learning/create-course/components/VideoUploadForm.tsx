"use client";

import React, { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VideoUploadForm: React.FC = () => {
  const [lectureTitle, setLectureTitle] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!uploadPreset) {
    console.error(
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not defined in .env.local"
    );
    throw new Error("Upload preset not configured");
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoUrl) {
      console.error("No video URL available to submit");
      return;
    }
    if (!lectureTitle) {
      console.error("Lecture title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting to /api/active-learning/create-course with:", {
        title: lectureTitle,
        links: [videoUrl],
      });
      const response = await fetch("/api/active-learning/create-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: lectureTitle,
          links: [videoUrl], // Send as array to match existing schema
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Course created successfully:", data);
        // Redirect to verification page with video URL and title
        router.push(
          `/protected/active-learning/create-course/verify-uploaded?url=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(lectureTitle)}`
        );
      } else {
        console.error("Failed to create course:", data.error);
      }
    } catch (error) {
      console.error("Error submitting course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold">Upload Video</h3>
      <Input
        type="text"
        value={lectureTitle}
        onChange={(e) => setLectureTitle(e.target.value)}
        placeholder="Lecture Title"
        className="w-full"
        required
      />
      <CldUploadWidget
        uploadPreset={uploadPreset}
        options={{
          maxFiles: 1,
          resourceType: "video",
        }}
        onSuccess={(result: CloudinaryUploadWidgetResults) => {
          console.log("Upload result:", result);
          const info = result.info as { secure_url?: string };
          if (info && info.secure_url) {
            console.log("Video uploaded successfully:", info.secure_url);
            setVideoUrl(info.secure_url);
            setIsUploading(false);
          } else {
            console.error("Upload succeeded but no secure_url found");
            setIsUploading(false);
          }
        }}
      >
        {({ open }) => (
          <div className="flex gap-4">
            <Button
              type="button" // Prevent form submission on upload click
              onClick={() => {
                console.log("Opening upload widget");
                setIsUploading(true);
                open();
              }}
              className="bg-blue-500 hover:bg-blue-600"
              disabled={isUploading}
            >
              Upload Video
            </Button>
            {videoUrl && (
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Course..." : "Create Course"}
              </Button>
            )}
          </div>
        )}
      </CldUploadWidget>
    </form>
  );
};

export default VideoUploadForm;
