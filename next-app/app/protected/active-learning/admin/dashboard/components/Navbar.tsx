import { Button } from "@/components/ui/button";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col gap-2 rounded-lg shadow-md">
      <Button
        onClick={() => setActiveTab("Courses")}
        className={`w-full border-2 border-black ${
          activeTab === "Courses"
            ? "bg-transparent text-black border-4"
            : "bg-black text-white border-2 hover:bg-white hover:text-black"
        }`}
      >
        Courses
      </Button>
      <Button
        onClick={() => setActiveTab("Students")}
        className={`w-full border-2 border-black ${
          activeTab === "Students"
            ? "bg-transparent text-black border-4"
            : "bg-black text-white border-2 hover:bg-white hover:text-black"
        }`}
      >
        Students
      </Button>
      <Button
        onClick={() => setActiveTab("Preferences")}
        className={`w-full border-2 border-black ${
          activeTab === "Preferences"
            ? "bg-transparent text-black border-4"
            : "bg-black text-white border-2 hover:bg-white hover:text-black"
        }`}
      >
        Preferences
      </Button>
    </div>
  );
}
