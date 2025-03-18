import React from "react";
import { checkRole } from "@/utils/checkRoles";
import { InfoIcon } from "lucide-react";
import CreateCourseForm from "./components/CreateCourseForm";
import VideoUploadForm from "./components/VideoUploadForm";

const CreateCourse = async () => {
  const user = await checkRole(["admin"]);
  console.log("User authenticated for CreateCourse:", user);

  return (
    <div className="flex flex-col items-center max-w-5xl px-12 mx-auto my-16 sm:px-0">
      <h2 className="self-center text-3xl font-bold text-center sm:text-6xl mb-10">
        Create Course
      </h2>
      <div className="flex p-6 mt-5 border-none bg-secondary w-full max-w-3xl">
        <InfoIcon className="w-12 h-12 mr-4 text-blue-400 flex-shrink-0" />
        <div>
          Provide Lecture video links to create chapter-wise Questions with
          varying difficulties using AI.
        </div>
      </div>
      <div className="flex w-full mt-10 space-x-12">
        <div className="w-1/2">
          <h3 className="text-xl font-semibold mb-6">Add Course with Links</h3>
          <CreateCourseForm />
        </div>
        <div className="w-1/2 border-l pl-12">
          <VideoUploadForm />
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
