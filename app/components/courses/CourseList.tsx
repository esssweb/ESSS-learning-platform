import Course from "./Course";
import { CoursesDataProps } from "@/types/dynamic-courses/types";

const CourseList = ({ coursesData }: CoursesDataProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-1 place-items-center">
      {coursesData.map((c) => (
        <Course
          key={c._id}
          id={c._id}
          title={c.title}
          description={c.description}
          // category={c.category}
          // level={c.level}
          // price={c.price}
          // rating={c.rating}
          // thumbnail={c.thumbnail}
        />
      ))}
    </div>
  );
};

export default CourseList;
