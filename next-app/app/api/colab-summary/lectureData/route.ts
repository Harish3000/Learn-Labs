import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
    try {
        // Get query parameters from the URL
        const url = new URL(req.url);
        const lectureID = url.searchParams.get("lectureID");

        console.log("lecture id : ", lectureID);

        if (!lectureID) {
            return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
        }

        const supabase = await createClient();

        // Fetch lecture data
        const { data, error } = await supabase
            .from("lectures")
            .select("*")
            .eq("lecture_id", lectureID);

        if (error) {
            console.error("Error fetching lecture data:", error);
            return NextResponse.json({ error: "Failed to fetch lecture data." }, { status: 500 });
        }
        // Return the fetched data
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}