import { Suspense } from "react";

import { TiHome } from "react-icons/ti";
import { BsDot } from "react-icons/bs";

import SubCourseDescriptionCard from "@/app/components/dynamic-course/SubCourseDescriptionCard";
import { courseData, subCoursesData } from "@/types/dynamic-courses/types";
import { getCourseById, getSubCoursesByCourseId } from "@/utils/fetchItem";
import { SubCourseDescriptionSkeleton } from "@/app/components/Skeletons";

const CoursePage = async ({
  params,
}: {
  params: { courseId: string; contentId: string; moduleId: string };
}) => {
  const course: courseData = await getCourseById(params.courseId);
  const subCourses: subCoursesData[] = await getSubCoursesByCourseId(
    params.courseId,
  );

  return (
    <div className="mx-auto max-w-6xl xl:max-w-4xl 2xl:max-w-6xl rounded-3xl text-Primary px-5 py-2">
      <div className="flex sm:gap-3 items-center">
        <TiHome size={40} />

        <BsDot size={30} className="pt-2" />

        <p className="pt-3 font-SofiaProMedium text-base sm:text-2xl text-Primary">
          {course.level}
        </p>
      </div>

      <h2 className="font-SofiaProSemiBold text-2xl sm:text-3xl lg:text-4xl my-4">
        {course.title}
      </h2>

      {subCourses?.map((subCourse: subCoursesData) => (
        <Suspense
          key={subCourse._id}
          fallback={<SubCourseDescriptionSkeleton />}
        >
          <SubCourseDescriptionCard
            part={subCourse.part}
            title={subCourse.title}
            subCourseId={subCourse._id}
          />
        </Suspense>
      ))}
    </div>
  );
};

export default CoursePage;
