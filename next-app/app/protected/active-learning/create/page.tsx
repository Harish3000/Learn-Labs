import React from 'react'
import { checkRole } from "@/utils/checkRoles";
import { InfoIcon } from 'lucide-react';
import CreateCourseForm from '@/components/CreateCourseForm';

const CreateCourse = async() => {
  const user = await checkRole(["admin"]);

  return (
      <div className="flex flex-col items-start max-w-xl px-8 mx-auto my-16 sm:px-0">
      <h2 className="self-center text-3xl font-bold text-center sm:text-6xl">
        Test Notifications
      </h2>
      <div className="flex p-4 mt-5 border-none bg-secondary">
        <InfoIcon className="w-12 h-12 mr-3 text-blue-400" />
        <div> 
            test
        </div>
      </div>
      <CreateCourseForm />

    </div>
  )
}

export default CreateCourse
