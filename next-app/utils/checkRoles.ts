// utils/checkRole.ts
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const checkRole = async (allowedRoles: string[]) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the user doesn't exist or their role is not allowed, redirect
  if (!user || !allowedRoles.includes(user.user_metadata?.role)) {
    redirect("/protected/general/unauthorized"); // Redirect to unauthorized page
  }

  return user; // Optionally return the user for further use
};
