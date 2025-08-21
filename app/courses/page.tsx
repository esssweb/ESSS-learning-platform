import React, { useEffect, useState } from "react";
import CoursesBar from "../components/courses/CoursesBar";
import CurrentCourse from "../components/courses/CurrentCourse";
import CourseList from "../components/courses/CourseList";
import CourseButton from "../components/courses/CourseButton";

const course = async () => {
  const fetchCoursesData = async () => {
    try {
      const res = await fetch(
        `https://dummyjson.com/products?limit=4&&select=id,title,description`
      );
      const cdata = await res.json();
      return cdata;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const coursesData = await fetchCoursesData();

  return (
    <div className="overflow-hidden">
      <CoursesBar />
      <CurrentCourse />
      <div className="courses-list pt-3 pb-8 px-[10px] md:px-[20px] lg:px-[30px] xl:px-[44px] xl:px-[80px] bg-Tertiary mb-20">
        <p className="text-xl font-SofiaProMedium font-bold mb-2 mt-3 ">
          Most Popular Courses
        </p>
        <CourseList coursesData={coursesData.products} />
        <CourseButton style="bg-Secondary mt-8" innerText="See more" />
      </div>
    </div>
  );
};

export default course;
