import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    // Count Admins
    const { count: adminCount, error: adminError } = await supabase
        .from("roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

    // Count Users
    const { count: userCount, error: userError } = await supabase
        .from("roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "user");
    
    

    if (adminError || userError) {
        return NextResponse.json({ 
            error: adminError?.message || userError?.message 
        }, { status: 500 });
    }

    return NextResponse.json({ adminCount, userCount });
}
