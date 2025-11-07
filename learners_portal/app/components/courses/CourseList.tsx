import Course from "./Course";
import { CoursesDataProps } from "@/types/dynamic-courses/types";

const CourseList = ({ coursesData }: CoursesDataProps) => {
  return (
    <div
      className="
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6
      "
    >
      {coursesData.map((c, index) => (
        <div
          key={c._id || c.id || index}
          className="flex justify-center sm:justify-start"
        >
          <Course
            id={(c._id as string) || String(c.id) || String(index)}
            title={c.title}
            description={c.description}
            image="/assets/images/img.jpg"
          />
        </div>
      ))}
    </div>
  );
};

export default CourseList;
