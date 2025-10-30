"use client";

import React from "react";

type CourseProps = {
  id: number | string;
  title: string;
  description: string;
  image?: string;
};

const Course: React.FC<CourseProps> = ({ id, title, description, image }) => {
  const img = image || "/assets/images/img.jpg";

  return (
    <div
      className="
        w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px] lg:max-w-[340px]
        bg-white rounded-xl shadow-md overflow-hidden flex flex-col
      "
    >
      <div className="p-3">
        <img
          src={img}
          alt={title}
          className="w-full h-[140px] sm:h-[160px] md:h-[180px] object-cover rounded-lg"
        />
      </div>
      <div className="px-4 pb-5 flex flex-col flex-grow">
        <h4 className="font-SofiaProMedium text-Primary text-lg sm:text-xl mb-2">
          {title}
        </h4>
        <p className="font-SofiaProLight text-Quinary text-sm sm:text-base mb-4 line-clamp-3">
          {description}
        </p>
        <div className="flex justify-start">
          <button
            className="
              px-5 py-2 border border-Primary rounded-xl text-sm font-SofiaProMedium
              hover:bg-Primary hover:text-white transition-colors
            "
          >
            Enroll for Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default Course;
