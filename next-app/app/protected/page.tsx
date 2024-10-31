import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProtectedHomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold">Welcome to Learn Labs 🥳</h1>
      <div className="space-x-4">
        <Link href="/protected/active-learning">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Active Learning
          </button>
        </Link>
        <Link href="/protected/doubt-clarification">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Doubt Clarification
          </button>
        </Link>
        <Link href="/protected/colab-summary">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Collab Summary
          </button>
        </Link>
        <Link href="/protected/intelli-notes">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Intelli Notes
          </button>
        </Link>
      </div>
    </div>
  );
}
