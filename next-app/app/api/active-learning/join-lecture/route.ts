import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // Create Supabase client and get the authenticated user
    const supabase = await createClient();
    const userResponse = await supabase.auth.getUser();

    if (!userResponse.data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = userResponse.data.user.email;
    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Get lecture_id from request body
    const { lecture_id } = await request.json();
    if (!lecture_id) {
      return NextResponse.json(
        { error: "Lecture ID is required" },
        { status: 400 }
      );
    }

    // Fetch the current joined_students for the lecture
    const { data: lectureData, error: fetchError } = await supabase
      .from("lectures")
      .select("joined_students")
      .eq("lecture_id", lecture_id)
      .single();

    if (fetchError || !lectureData) {
      console.error("Error fetching lecture:", fetchError);
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    // Initialize joined_students as an array if null
    let joinedStudents = lectureData.joined_students || [];
    if (!Array.isArray(joinedStudents)) {
      joinedStudents = [];
    }

    // Check if the user is already joined
    if (joinedStudents.includes(email)) {
      return NextResponse.json({ message: "Already joined" }, { status: 200 });
    }

    // Add the user's email to the array
    joinedStudents.push(email);

    // Update the lectures table
    const { error: updateError } = await supabase
      .from("lectures")
      .update({ joined_students: joinedStudents })
      .eq("lecture_id", lecture_id);

    if (updateError) {
      console.error("Error updating lecture:", updateError);
      return NextResponse.json(
        { error: "Failed to join lecture" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully joined lecture" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in join-lecture POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get lecture_id from query parameters
    const url = new URL(request.url);
    const lecture_id = url.searchParams.get("lecture_id");

    if (!lecture_id) {
      return NextResponse.json(
        { error: "Lecture ID is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Fetch lecture_live_start and lecture_live_end
    const { data, error } = await supabase
      .from("lectures")
      .select("lecture_live_start, lecture_live_end")
      .eq("lecture_id", lecture_id)
      .single();

    if (error || !data) {
      console.error("Error fetching lecture times:", error);
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    return NextResponse.json({
      lecture_live_start: data.lecture_live_start,
      lecture_live_end: data.lecture_live_end,
    });
  } catch (error) {
    console.error("Error in join-lecture GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
