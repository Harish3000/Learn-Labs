import { AlertTriangle } from "lucide-react";

export default function WarningPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-lg text-center border border-red-500">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="text-red-500" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Warning</h2>
        <p className="text-gray-700">
          This meeting is recorded, and your lecturer will be notified about what you discuss during the session.
        </p>
      </div>
    </div>
  );
}