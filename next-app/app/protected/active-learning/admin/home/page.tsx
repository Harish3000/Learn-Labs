// app/protected/active-learning/home/page.jsx
import Link from "next/link";

export default function ActiveLearningHome() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Active Learning Dashboard
        </h1>

        <div className="space-y-4">
          <p className="text-gray-600">
            Welcome to the Active Learning platform. Start exploring interactive
            learning features.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/protected/active-learning/lessons"
              className="block p-4 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <h2 className="text-lg font-semibold text-blue-800">
                Interactive Lessons
              </h2>
              <p className="text-sm text-gray-600">
                Engage with dynamic learning content
              </p>
            </Link>

            <Link
              href="/protected/active-learning/quizzes"
              className="block p-4 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
            >
              <h2 className="text-lg font-semibold text-green-800">
                Practice Quizzes
              </h2>
              <p className="text-sm text-gray-600">
                Test your knowledge with interactive quizzes
              </p>
            </Link>
          </div>

          <Link
            href="/"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
