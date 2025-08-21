import Course from "../Course";
import { coursesDataProps } from "@/types/dynamic-courses/types";

const CourseList = ({ coursesData }: coursesDataProps) => {
  return (
    <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-1  place-items-center">
      {coursesData.map((course) => (
        <Course key={course.id} {...course} />
      ))}
    </div>
  );
};

export default CourseList;
