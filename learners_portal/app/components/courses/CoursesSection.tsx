import CourseList from "./CourseList";
import CourseButton from "./CourseButton";
import { courseData } from "@/types/dynamic-courses/types";

type CoursesSectionProps = {
  title: string;
  data: courseData[];
  bg?: string;
};

const CoursesSection = ({ title, data, bg }: CoursesSectionProps) => {
  return (
    <div className={`${bg || "bg-white"} pt-3 pb-8 mb-20`}>
      <div
        className="
          mx-auto 
          sm:ml-[20px] md:ml-[40px] lg:ml-[80px] xl:ml-[123px] 
          max-w-[90%] sm:max-w-none
        "
      >
        <p
          className="
            text-xl
            sm:text-2xl
            md:text-3xl
            lg:text-4xl
            font-SofiaProMedium
            mb-6 mt-3
          "
        >
          {title}
        </p>

        <CourseList coursesData={data} />

        <div className="flex justify-center sm:justify-start mt-8">
          <CourseButton style="bg-Secondary" innerText="See More" />
        </div>
      </div>
    </div>
  );
};

export default CoursesSection;
