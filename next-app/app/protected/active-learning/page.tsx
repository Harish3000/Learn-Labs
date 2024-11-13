// app/active-learning/page.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ActiveLearning = () => {
  return (
    <div>
      <h1>Active Learning</h1>
      <p>
        This is the active learning section where members can create their
        components.
      </p>
      {/* Button to navigate to the protected page */}
      <Link href="/protected/active-learning/admin">
        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
          Go to Admin Only Page
        </button>
       
      </Link>
      <Button>Create New course</Button>
    </div>
  );
};

export default ActiveLearning;
