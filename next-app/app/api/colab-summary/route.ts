import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Initialize Supabase client

export async function GET() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("breakroom_attendance")
      .select("*");

    if (error) {
      console.error("Error fetching breakroom attendance data:", error);
      return NextResponse.json(
        { error: "Failed to fetch summaries." },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// **UPDATE BREAKROOM ID**
export async function PATCH(req: Request) {
  const supabase = await createClient();
  try {
    console.log("Deviding students into student groups...");
    const body = await req.json();
    const { breakroomID, ids } = body;

    // console.log("breakroomID : ",breakroomID);
    // console.log("ids : ",ids);

    if (!breakroomID) {
      return NextResponse.json(
        { error: "breakroomID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Array of ids is required" },
        { status: 400 }
      );
    }

    // Bulk update using Supabase
    const { data, error } = await supabase
      .from("breakroom_attendance")
      .update({ breakroom_id: breakroomID })
      .in("id", ids);

    console.log("students devided into groups successfully...");

    if (error) {
      console.error("Supabase Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
