// components/AuthButton.jsx
import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div>
            <Badge
              variant={"default"}
              className="font-normal pointer-events-none"
            >
              Please update .env.local file with anon key and url
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              variant={"outline"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={"default"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      {user.user_metadata?.role === "admin" && (
        <Badge variant={"default"} className="font-normal pointer-events-none">
          🔴Administrator Account
        </Badge>
      )}
      {user.user_metadata?.role === "admin" ? (
        <div className="relative group">
          <span className="cursor-pointer hover:text-blue-500 transition-colors">
            👤 Hey, {user.email}!
          </span>
          <div className="absolute left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
            <div className="bg-white py-2 rounded-lg shadow-lg border border-gray-100">
              <Link
                href="/protected/active-learning/admin/dashboard"
                className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Active-learning analysis
              </Link>
              <Link
                href="/protected/doubt-clarification/admin/home"
                className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Doubt-Clarification
              </Link>
              <Link
                href="/protected/collaborative-summary/admin/home"
                className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Collaborative-summary
              </Link>
              <Link
                href="/protected/intelinote/admin/home"
                className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Intelinote
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>👤 Hey, {user.email}!</>
      )}
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
