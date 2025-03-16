import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

// Retrieve user from server without role checks
export const getUserFromServer = async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Restrict access based on roles and return user
export const restrictServer = async (allowedRoles: string[]): Promise<User> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !allowedRoles.includes(user.user_metadata?.role)) {
    redirect("/protected/general/unauthorized");
  }

  console.log("**Server security check : passed**");
  return user;
};
