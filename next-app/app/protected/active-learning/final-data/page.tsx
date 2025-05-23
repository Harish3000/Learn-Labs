"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Video,
  FileText,
  HelpCircle,
  BarChart2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface LectureData {
  lecture_id: number;
  lecture_title: string;
  description: string;
  playlist_id: string;
  upload_date: string;
  lecture_live_start: string;
  lecture_live_end: string;
  is_active: boolean;
  joined_students: string[];
  lecturer_email: string;
}

interface VideoData {
  video_id: string;
  lecture_id: number;
  video_title: string;
  video_url: string;
  duration_seconds: string;
  start_timestamp: string;
  end_timestamp: string;
  video_sequence: string;
  active_students: string[];
}

interface TranscriptChunkData {
  chunk_id: number;
  video_id: string;
  lecture_id: number;
  start_time: string;
  end_time: string;
  text: string;
  embedding: number[];
  chunk_sequence: string;
  timestamp: string;
}

interface QuestionData {
  question_id: number;
  chunk_id: number;
  lecture_id: number;
  display_time: string;
  question: string;
  options: string;
  answer: string;
  difficulty: string;
  updated_time: string;
}

export default function FinalLectureData() {
  const [lectureData, setLectureData] = useState<LectureData[]>([]);
  const [videoData, setVideoData] = useState<VideoData[]>([]);
  const [transcriptChunkData, setTranscriptChunkData] = useState<
    TranscriptChunkData[]
  >([]);
  const [questionData, setQuestionData] = useState<QuestionData[]>([]);
  const [updatedFields, setUpdatedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [changedData, setChangedData] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const searchParams = useSearchParams();
  const lectureId = searchParams.get("lectureId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/active-learning/final-data?lectureId=${lectureId}`
        );
        if (response.ok) {
          const data = await response.json();
          setLectureData(
            data.lectures.filter(
              (lecture: LectureData) => lecture.lecture_id === Number(lectureId)
            )
          );
          setVideoData(
            data.videos.filter(
              (video: VideoData) => video.lecture_id === Number(lectureId)
            )
          );
          setTranscriptChunkData(
            data.transcriptChunks
              .filter(
                (chunk: TranscriptChunkData) =>
                  chunk.lecture_id === Number(lectureId)
              )
              .sort(
                (a: TranscriptChunkData, b: TranscriptChunkData) =>
                  a.chunk_id - b.chunk_id
              )
          );
          setQuestionData(
            data.questions
              .filter(
                (question: QuestionData) =>
                  question.lecture_id === Number(lectureId)
              )
              .sort(
                (a: QuestionData, b: QuestionData) =>
                  a.question_id - b.question_id
              )
          );
        } else {
          console.error("Failed to fetch final data:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching final data:", error);
      }
    };

    if (lectureId) {
      fetchData();
    }
  }, [lectureId]);

  const handleUpdate = async (
    table: string,
    id: string | number,
    data: any
  ) => {
    try {
      setIsAnalyzing(true);
      const oldData = getOldData(table, id);
      const response = await fetch("/api/active-learning/update-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table, id, data }),
      });

      if (response.ok) {
        toast.success("Update Successful", {
          description: `Updated ${table} data successfully`,
        });
        setUpdatedFields((prev) => ({ ...prev, [`${table}-${id}`]: false }));

        await analyzeChanges(oldData, data);
      } else {
        toast.error("Update Failed", {
          description: `Failed to update ${table} data`,
          className: "text-gray-800",
        });
      }
    } catch (error) {
      console.error(`Error updating ${table} data:`, error);
      toast.error("Update Error", {
        description: `Error updating ${table} data`,
        className: "text-gray-800",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeChanges = async (oldData: any, newData: any) => {
    try {
      const response = await fetch("/api/active-learning/analyze-changes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldData,
          newData,
          userEmail: lectureData[0]?.lecturer_email || "admin@learnlabs.com",
        }),
      });

      if (response.ok) {
        console.log("Analysis completed successfully");
        toast.success("Analysis Completed", {
          description: "Changes have been analyzed and saved.",
          className: "text-gray-800",
        });
      } else {
        throw new Error("Failed to analyze changes");
      }
    } catch (error) {
      console.error("Error analyzing changes:", error);
      toast.error("Analysis Error", {
        description: "Failed to analyze changes",
        className: "text-gray-800",
      });
    }
  };

  const getOldData = (table: string, id: string | number) => {
    switch (table) {
      case "lectures":
        return lectureData.find((lecture) => lecture.lecture_id === id);
      case "videos":
        return videoData.find((video) => video.video_id === id);
      case "transcript_chunks":
        return transcriptChunkData.find((chunk) => chunk.chunk_id === id);
      case "questions":
        return questionData.find((question) => question.question_id === id);
      default:
        return null;
    }
  };

  const handleInputChange = (table: string, id: string | number) => {
    setUpdatedFields((prev) => ({ ...prev, [`${table}-${id}`]: true }));
  };

  const parseOptions = (optionsString: string): string[] => {
    try {
      const cleanedString = optionsString
        .replace(/^"|"$/g, "")
        .replace(/\\"/g, '"');
      const parsedOptions = JSON.parse(cleanedString);
      if (Array.isArray(parsedOptions) && parsedOptions.length === 4) {
        return parsedOptions.map((option) =>
          option.replace(/^[A-D]\.\s*/, "").trim()
        );
      } else {
        console.warn("Options are not in the expected format:", optionsString);
        return cleanedString
          .split('","')
          .map((option) => option.replace(/^[A-D]\.\s*/, "").trim());
      }
    } catch (error) {
      console.error("Error parsing options:", error);
      return optionsString
        .replace(/^\["|"\]$/g, "")
        .split('","')
        .map((option) => option.replace(/^[A-D]\.\s*/, "").trim());
    }
  };

  const formatOptions = (options: string[]): string => {
    const formattedOptions = options.map(
      (option, index) => `${String.fromCharCode(65 + index)}. ${option.trim()}`
    );
    return JSON.stringify(formattedOptions);
  };

  const getDifficultyColor = (difficulty: string | number) => {
    const numericDifficulty = Number(difficulty);
    if (numericDifficulty === 1) return "bg-green-500";
    if (numericDifficulty === 2) return "bg-yellow-500";
    if (numericDifficulty === 3) return "bg-red-500";
    return "bg-gray-500";
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-6 text-center text-primary"
      >
        Course Data Management
      </motion.h1>

      <Tabs defaultValue="lectures" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lectures" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Lectures
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="transcripts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transcripts
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lectures">
          <Card>
            <CardHeader>
              <CardTitle>Lecture Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh]">
                {lectureData.map((lecture) => (
                  <motion.div
                    key={lecture.lecture_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 border rounded-lg shadow-sm"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`lecture-title-${lecture.lecture_id}`}>
                          Lecture Title
                        </Label>
                        <Input
                          id={`lecture-title-${lecture.lecture_id}`}
                          defaultValue={lecture.lecture_title}
                          onChange={() =>
                            handleInputChange("lectures", lecture.lecture_id)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`lecture-description-${lecture.lecture_id}`}
                        >
                          Description
                        </Label>
                        <Textarea
                          id={`lecture-description-${lecture.lecture_id}`}
                          defaultValue={lecture.description}
                          onChange={() =>
                            handleInputChange("lectures", lecture.lecture_id)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`lecture-active-${lecture.lecture_id}`}
                          checked={lecture.is_active}
                          onCheckedChange={() =>
                            handleInputChange("lectures", lecture.lecture_id)
                          }
                        />
                        <Label htmlFor={`lecture-active-${lecture.lecture_id}`}>
                          Active
                        </Label>
                      </div>
                      <Button
                        onClick={() =>
                          handleUpdate("lectures", lecture.lecture_id, {
                            lecture_title: (
                              document.getElementById(
                                `lecture-title-${lecture.lecture_id}`
                              ) as HTMLInputElement
                            ).value,
                            description: (
                              document.getElementById(
                                `lecture-description-${lecture.lecture_id}`
                              ) as HTMLTextAreaElement
                            ).value,
                            is_active: (
                              document.getElementById(
                                `lecture-active-${lecture.lecture_id}`
                              ) as HTMLInputElement
                            ).checked,
                          })
                        }
                        disabled={
                          !updatedFields[`lectures-${lecture.lecture_id}`]
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Video Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh]">
                {videoData.map((video) => (
                  <motion.div
                    key={video.video_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 border rounded-lg shadow-sm"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`video-title-${video.video_id}`}>
                          Video Title
                        </Label>
                        <Input
                          id={`video-title-${video.video_id}`}
                          defaultValue={video.video_title}
                          onChange={() =>
                            handleInputChange("videos", video.video_id)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`video-duration-${video.video_id}`}>
                          Duration (ISO 8601 duration format)
                        </Label>
                        <Input
                          id={`video-duration-${video.video_id}`}
                          defaultValue={video.duration_seconds}
                          onChange={() =>
                            handleInputChange("videos", video.video_id)
                          }
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={() =>
                          handleUpdate("videos", video.video_id, {
                            video_title: (
                              document.getElementById(
                                `video-title-${video.video_id}`
                              ) as HTMLInputElement
                            ).value,
                            duration_seconds: (
                              document.getElementById(
                                `video-duration-${video.video_id}`
                              ) as HTMLInputElement
                            ).value,
                          })
                        }
                        disabled={!updatedFields[`videos-${video.video_id}`]}
                      >
                        Update
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcripts">
          <Card>
            <CardHeader>
              <CardTitle>Transcript Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh]">
                {transcriptChunkData.map((chunk) => (
                  <motion.div
                    key={chunk.chunk_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 border rounded-lg shadow-sm"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`transcript-text-${chunk.chunk_id}`}>
                          Transcript Text
                        </Label>
                        <Textarea
                          id={`transcript-text-${chunk.chunk_id}`}
                          defaultValue={chunk.text}
                          onChange={() =>
                            handleInputChange(
                              "transcript_chunks",
                              chunk.chunk_id
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Label
                            htmlFor={`transcript-start-time-${chunk.chunk_id}`}
                          >
                            Start Time
                          </Label>
                          <Input
                            id={`transcript-start-time-${chunk.chunk_id}`}
                            defaultValue={chunk.start_time}
                            onChange={() =>
                              handleInputChange(
                                "transcript_chunks",
                                chunk.chunk_id
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label
                            htmlFor={`transcript-end-time-${chunk.chunk_id}`}
                          >
                            End Time
                          </Label>
                          <Input
                            id={`transcript-end-time-${chunk.chunk_id}`}
                            defaultValue={chunk.end_time}
                            onChange={() =>
                              handleInputChange(
                                "transcript_chunks",
                                chunk.chunk_id
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          handleUpdate("transcript_chunks", chunk.chunk_id, {
                            text: (
                              document.getElementById(
                                `transcript-text-${chunk.chunk_id}`
                              ) as HTMLTextAreaElement
                            ).value,
                            start_time: (
                              document.getElementById(
                                `transcript-start-time-${chunk.chunk_id}`
                              ) as HTMLInputElement
                            ).value,
                            end_time: (
                              document.getElementById(
                                `transcript-end-time-${chunk.chunk_id}`
                              ) as HTMLInputElement
                            ).value,
                          })
                        }
                        disabled={
                          !updatedFields[`transcript_chunks-${chunk.chunk_id}`]
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[70vh]">
                {questionData.map((question) => (
                  <motion.div
                    key={question.question_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 border rounded-lg shadow-sm"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`question-id-${question.question_id}`}>
                          Question ID
                        </Label>
                        <Badge variant="outline">{question.question_id}</Badge>
                      </div>
                      <div>
                        <Label
                          htmlFor={`question-text-${question.question_id}`}
                        >
                          Question
                        </Label>
                        <Textarea
                          id={`question-text-${question.question_id}`}
                          defaultValue={question.question}
                          onChange={() =>
                            handleInputChange("questions", question.question_id)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Options</Label>
                        {parseOptions(question.options).map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 mt-2"
                          >
                            <Label
                              htmlFor={`question-option-${question.question_id}-${index}`}
                              className="w-6"
                            >
                              {String.fromCharCode(65 + index)}.
                            </Label>
                            <Input
                              id={`question-option-${question.question_id}-${index}`}
                              defaultValue={option}
                              onChange={() =>
                                handleInputChange(
                                  "questions",
                                  question.question_id
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <Label
                          htmlFor={`question-answer-${question.question_id}`}
                        >
                          Answer
                        </Label>
                        <Input
                          id={`question-answer-${question.question_id}`}
                          defaultValue={question.answer}
                          onChange={() =>
                            handleInputChange("questions", question.question_id)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`question-difficulty-${question.question_id}`}
                        >
                          Difficulty
                        </Label>
                        <div
                          className={`w-4 h-4 rounded-full ${getDifficultyColor(question.difficulty)}`}
                        ></div>
                        <Input
                          id={`question-difficulty-${question.question_id}`}
                          defaultValue={question.difficulty}
                          onChange={() =>
                            handleInputChange("questions", question.question_id)
                          }
                          className="w-16"
                          type="number"
                          min="1"
                          max="3"
                        />
                      </div>
                      <Button
                        onClick={() =>
                          handleUpdate("questions", question.question_id, {
                            question: (
                              document.getElementById(
                                `question-text-${question.question_id}`
                              ) as HTMLTextAreaElement
                            ).value,
                            options: formatOptions(
                              Array.from(
                                { length: 4 },
                                (_, i) =>
                                  (
                                    document.getElementById(
                                      `question-option-${question.question_id}-${i}`
                                    ) as HTMLInputElement
                                  ).value
                              )
                            ),
                            answer: (
                              document.getElementById(
                                `question-answer-${question.question_id}`
                              ) as HTMLInputElement
                            ).value,
                            difficulty: (
                              document.getElementById(
                                `question-difficulty-${question.question_id}`
                              ) as HTMLInputElement
                            ).value,
                          })
                        }
                        disabled={
                          !updatedFields[`questions-${question.question_id}`]
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end mt-8 space-x-4">
        <Link
          href={`/protected/active-learning/final-data/analysis?userEmail=${encodeURIComponent(
            lectureData[0]?.lecturer_email || "admin@learnlabs.com"
          )}`}
          passHref
        >
          <Button className="flex items-center gap-2" disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart2 className="w-4 h-4" />
                View Analysis
              </>
            )}
          </Button>
        </Link>
        <Link href="/protected/active-learning/admin/dashboard" passHref>
          <Button className="bg-blue-500 hover:bg-blue-600">
            Go to Admin Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
