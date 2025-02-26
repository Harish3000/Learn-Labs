import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const responseSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      start_time: {
        type: SchemaType.NUMBER,
        description: "Start time of the chapter",
        nullable: false,
      },
      end_time: {
        type: SchemaType.NUMBER,
        description: "End time of the chapter",
        nullable: false,
      },
      text: {
        type: SchemaType.STRING,
        description: "Text of the chapter",
        nullable: false,
      },
      sequence: {
        type: SchemaType.NUMBER,
        description: "Chapter sequence number",
        nullable: false,
      },
    },
    required: ["start_time", "end_time", "text", "sequence"],
  },
};

const questionResponseSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      question: {
        type: SchemaType.STRING,
        description: "Question text",
        nullable: false,
      },
      options: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.STRING,
        },
        description: "List of options for the question",
        nullable: false,
      },
      answer: {
        type: SchemaType.STRING,
        description: "Correct answer to the question",
        nullable: false,
        maxLength: 1,
      },
      difficulty: {
        type: SchemaType.NUMBER,
        description:
          "Difficulty level of the question (1: Easy, 2: Medium, 3: Hard)",
        nullable: false,
      },
    },
    required: ["question", "options", "answer", "difficulty"],
  },
};

export async function processTranscript(transcript: any[]) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  // Properly format the transcript
  const transcriptString = JSON.stringify(transcript, null, 2);

  console.log("--------------------transcript", transcriptString);
  const prompt = `Analyze the following transcript and generate chapters with timestamps
  (IMPORTANT 
    1.In the transcript offset=start_time
    2.In the transcript offset+duration=end_time
    3.each chapter must be minimum 120 seconds long in total duration and maximum 900 seconds long total duration based on timestamp duration values in transcript
    4..Each transcript must have minimum 2 chapters and maximum 8 chapters
    5. For text attribute in output expected output format below = do not over summarize. this should contain all key points, steps and important terms discussed in the video. DO NOT LEAVE OUT ANY IMPORTANT POINTS 
  ):

${transcriptString}

Please provide the output in the following format:
[
  {
    "start_time": 0,
    "end_time": 120,
    "text": "Chapter 1 content",
    "sequence": 1
  },
  ...
]`;

  console.log("=============================", prompt);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const chapters = JSON.parse(response.text()); // JSON response handling
  console.log("output--------------1--------------", chapters);

  // Generate embeddings for each chapter
  const embeddingModel = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  for (const chapter of chapters) {
    const embeddingResult = await embeddingModel.embedContent(chapter.text);
    chapter.embedding = embeddingResult.embedding;
  }
  console.log("output--------------2--------------", chapters);
  return chapters;
}

export async function generateQuestions(chapterText: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: questionResponseSchema,
    },
  });

  const prompt = `Generate 3 multiple-choice questions (easy, medium, and hard) based on the following text:
(IMPORTANT : the question must be answerable based on the text provided. Do not create out of scope of the text)
${chapterText}
Please provide the output in the following format:
[
  {
    "question": "Question text",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "answer": "A",
    "difficulty": 1
  },
  ...
]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text()); // JSON response handling
}
