import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || "",
});

export async function transcribeVideo(url: string) {
  const transcript = await client.transcripts.transcribe({
    audio: url,
  });

  return transcript;
}

export async function getTranscriptWithTimestamps(transcriptId: string) {
  const { sentences } = await client.transcripts.sentences(transcriptId);

  return sentences.map((sentence) => ({
    text: sentence.text,
    start_time: sentence.start,
    end_time: sentence.end,
  }));
}
