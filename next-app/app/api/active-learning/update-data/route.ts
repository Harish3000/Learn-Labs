import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { table, id, data } = await req.json();

    let idColumn: string;
    switch (table) {
      case "lectures":
        idColumn = "lecture_id";
        break;
      case "videos":
        idColumn = "video_id";
        break;
      case "transcript_chunks":
        idColumn = "chunk_id";
        break;
      case "questions":
        idColumn = "question_id";
        break;
      default:
        throw new Error("Invalid table name");
    }

    const { error } = await supabase.from(table).update(data).eq(idColumn, id);

    if (error) {
      throw new Error(`Error updating ${table} data: ${error.message}`);
    }

    return NextResponse.json({ message: `${table} data updated successfully` });
  } catch (error) {
    console.error(`Error updating data:`, error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}
