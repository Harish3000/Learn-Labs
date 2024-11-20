import { checkRole } from "@/utils/checkRoles";
import { InfoIcon } from "lucide-react";
import CreateCourseForm from "./components/CreateCourseForm";
import { Separator } from "@/components/ui/separator";

const CreateCourse = async () => {
  const user = await checkRole(["admin"]);

  return (
    <div className="flex flex-col items-start max-w-xl px-8 mx-auto my-16 sm:px-0">
      <h2 className="self-center text-3xl font-bold text-center sm:text-6xl">
        Create Course
      </h2>
      <div className="flex p-4 mt-8 mb-8 border-none bg-secondary">
        <InfoIcon className="w-6 h-6 mr-3 text-blue-400" />
        <div>Add course title and YouTube video links</div>
      </div>
      <CreateCourseForm />
    </div>
  );
};

export default CreateCourse;
