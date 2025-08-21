"use client";

import React from "react";

type CourseProps = {
  id: number | string;
  title: string;
  description: string;
  image?: string;
};

const Course: React.FC<CourseProps> = ({ title, description, image }) => {
  const img = image || "/assets/images/img.jpg";

  return (
    <div
      className="
        w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px] lg:max-w-[340px]
        bg-white rounded-2xl shadow-[2px_5px_10px_#00000029] overflow-hidden
      "
    >
      <div
        className="w-full h-[140px] sm:h-[160px] md:h-[180px] bg-center bg-cover"
        style={{ backgroundImage: `url(${img})` }}
      />

      <div className="p-4">
        <h4 className="font-SofiaProMedium text-Primary text-lg sm:text-xl mb-2">
          {title}
        </h4>
        <p className="font-SofiaProLight text-Quinary text-sm sm:text-base line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  );
};

export default Course;
