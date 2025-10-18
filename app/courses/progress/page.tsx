"use client";

import React from "react";
import CoursesBar from "../../components/courses/CoursesBar";
import CourseCard from "../../components/courses/CourseCard";
import Pagination from "../../components/explore/dynamic-explore/Pagination";

const Courses = () => {
  return (
    <div>
      <CoursesBar />
      <div
        className="
          mt-6 mb-4 px-4 text-center
          md:text-center
          lg:text-left lg:ml-[113px] lg:mt-[57px] lg:mb-[26px]
        "
      >
        <h1
          className="
            font-SofiaProMedium
            mb-2
            text-[22px]
            min-[320px]:text-[24px]
            min-[360px]:text-[26px]
            min-[414px]:text-[28px]
            sm:text-4xl
            md:text-[40px]
          "
        >
          Your Courses
        </h1>
      </div>
      <div className="flex justify-center items-center mb-8">
        <CourseCard
          title="Space Weather"
          imageSrc="/assets/images/courses/course1.png"
          progress={36}
          resumeText="Resume"
        />
      </div>

      <div className="flex justify-center items-center mb-8">
        <CourseCard
          title="Aerospace Eng."
          imageSrc="/assets/images/courses/course2.png"
          progress={72}
          resumeText="Resume"
        />
      </div>
      <div className="flex items-center mt-16 mb-40 justify-center">
        <Pagination totalPages={3} />
      </div>
    </div>
  );
};

export default Courses;
