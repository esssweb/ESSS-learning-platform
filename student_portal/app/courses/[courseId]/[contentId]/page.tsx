import { BsDot } from "react-icons/bs";
import { TiHome } from "react-icons/ti";

import ModuleListCard from "@/app/components/dynamic-course/ModuleListCard";
import {
  courseData,
  moduleData,
  subCoursesData,
} from "@/types/dynamic-courses/types";
import {
  getCourseById,
  getModulesBySubCoureseId,
  getSubCourseById,
} from "@/utils/fetchItem";

const SubCoursePage = async ({
  params,
}: {
  params: { courseId: string; contentId: string; moduleId: string };
}) => {
  const course: courseData = await getCourseById(params.courseId);
  const subCourse: subCoursesData = await getSubCourseById(params.contentId);
  const modules: moduleData[] = await getModulesBySubCoureseId(
    params.contentId,
  );

  return (
    <div className="mx-auto max-w-6xl xl:max-w-4xl 2xl:max-w-6xl px-4 py-3 w-full text-Primary">
      <div className="flex flex-wrap sm:gap-3 items-center mb-8">
        <TiHome size={40} className="sm:w-10 sm:h-10 w-8 h-8" />

        <BsDot size={30} className="pt-2" />

        <p className="pt-3 font-SofiaProMedium text-base sm:text-xl text-Primary">
          {course?.level}
        </p>

        <BsDot size={30} className="pt-2" />

        <p className="pt-3 font-SofiaProMedium text-base sm:text-xl text-Primary">
          {course?.title}
        </p>
      </div>

      <h2 className="font-SofiaProSemiBold text-2xl sm:text-3xl my-6">
        {`Sub-Course ${subCourse?.part}: ${subCourse?.title}`}
      </h2>

      <div className="lg:px-16 md:px-10 px-5 py-3 bg-white border-l-8 rounded-lg border-Primary">
        <h3 className="font-SofiaProSemiBold text-lg sm:text-xl py-5 max-w-[80%] sm:max-w-[60%] border-b">
          About the Sub-Course
        </h3>

        <p className="text-justify font-SofiaProLight text-sm sm:text-base py-3 max-w-4xl">
          {subCourse.description}
        </p>
      </div>

      {modules?.map((module: moduleData) => (
        <ModuleListCard key={module._id} id={module._id} title={module.title} />
      ))}
    </div>
  );
};

export default SubCoursePage;
