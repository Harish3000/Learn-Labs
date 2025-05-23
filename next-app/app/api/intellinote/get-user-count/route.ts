import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Initialize Supabase client

export async function GET() {
  const supabase = await createClient();
  // Fetch total count of users (admins + users)
  const { count: totalCount, error: totalError } = await supabase
    .from("roles")
    .select("*", { count: "exact", head: true });

  // Fetch count of admins
  const { count: adminCount, error: adminError } = await supabase
    .from("roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  // Fetch count of users
  const { count: userCount, error: userError } = await supabase
    .from("roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

  // Handle errors
  if (totalError || adminError || userError) {
    return NextResponse.json(
      {
        error: totalError?.message || adminError?.message || userError?.message,
      },
      { status: 500 }
    );
  }

  console.log(totalCount, adminCount, userCount);
  return NextResponse.json({ totalCount, adminCount, userCount });
}
