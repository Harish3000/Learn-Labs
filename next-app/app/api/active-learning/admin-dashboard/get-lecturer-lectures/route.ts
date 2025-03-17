import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  console.log(
    "API request received with query:",
    Object.fromEntries(url.searchParams)
  );

  if (!email || typeof email !== "string") {
    console.log("Invalid email parameter:", email);
    return NextResponse.json(
      { error: "Missing or invalid email" },
      { status: 400 }
    );
  }

  console.log(`Querying lectures for email: ${email}`);
  const { data, error } = await supabase
    .from("lectures")
    .select("lecture_id, lecture_title, lecture_live_start, joined_students")
    .eq("lecturer_email", email)
    .order("lecture_live_start", { ascending: true });

  if (error) {
    console.error("Supabase query error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch lectures" },
      { status: 500 }
    );
  }

  console.log("Lectures retrieved:", data);
  return NextResponse.json({ lectures: data });
}
