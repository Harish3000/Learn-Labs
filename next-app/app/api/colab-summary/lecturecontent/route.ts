import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
    try {
        // Get query parameters from the URL
        const url = new URL(req.url);
        const lectureID = url.searchParams.get("lectureID");
        const videoID = url.searchParams.get("videoID");

        if (!lectureID || !videoID) {
            return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
        }

        const supabase = await createClient();

        // Fetch breakroom attendance based on breakroomID and userID
        const { data, error } = await supabase
            .from("transcript_chunks")
            .select("chunk_id, chunk_sequence, text, lecture:lecture_id(lecture_title)")
            .eq("lecture_id", lectureID)
            .eq("video_id", videoID);

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

// **UPDATE BREAKROOM ID**
export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, summaryCorrectness, summaryMissedPoints } = body;

        console.log("id : ",id);
        console.log("correctness : ",summaryCorrectness);
        console.log("missing points : ",summaryMissedPoints);

        if (!id || !summaryCorrectness || !summaryMissedPoints) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('summaries')
            .update({
                correctness: summaryCorrectness,
                missed_points: summaryMissedPoints
            })
            .eq('id', id).select("*").single();

            // console.log("data updated : ",data);

        if (error) {
            console.error('Supabase Error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

