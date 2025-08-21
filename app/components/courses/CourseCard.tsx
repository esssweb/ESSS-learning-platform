"use client";

import Image from "next/image";
import React from "react";
import ProgressBar from "./ProgressBar";

type Props = {
  title: string;
  imageSrc: string;
  progress: number;
  resumeText?: string;
};

const CourseCard: React.FC<Props> = ({
  title,
  imageSrc,
  progress,
  resumeText = "Resume",
}) => {
  return (
    <div
      className="
        w-full px-3 pt-5 pb-4 border-2 shadow-lg
        rounded-[28px]
        min-[360px]:rounded-[36px]
        min-[414px]:rounded-[44px]
        max-w-[300px]
        min-[320px]:max-w-[320px]
        min-[360px]:max-w-[350px]
        min-[414px]:max-w-[400px]
        sm:min-w-[480px]
        md:min-w-[640px]
        lg:min-w-[920px]
        xl:min-w-[1190px]
        2xl:max-w-[1390px]
        [1920px]:max-w-[1450px]
      "
    >
      <div className="flex items-center content-center flex-col px-3 sm:px-6 md:px-8 lg:flex-row">
        {/* Course Image */}
        <div
          className="
            relative w-full overflow-hidden rounded-3xl
            aspect-[4/3]
            min-[360px]:aspect-[16/11]
            min-[414px]:aspect-[16/10]
            sm:w-full sm:aspect-[16/10]
            md:w-full md:h-[340px] md:aspect-auto
            lg:w-[240px] lg:h-[240px]
          "
        >
          <Image src={imageSrc} alt={title} fill className="object-cover" />
        </div>

        {/* Course Content */}
        <div
          className="
            flex flex-col w-full mt-5 lg:mt-0 lg:ml-12 flex-grow
            sm:text-center md:text-center lg:text-left
            sm:items-center md:items-center lg:items-start
          "
        >
          <h3
            className="
              font-SofiaProMedium mb-2
              text-[18px]
              min-[320px]:text-[20px]
              min-[360px]:text-[22px]
              min-[414px]:text-[24px]
              sm:text-[30px]
              md:text-[34px]
              lg:text-4xl
            "
          >
            {title}
          </h3>

          <div className="sm:mx-auto md:mx-auto lg:mx-0 w-full">
            <ProgressBar progress={progress} />
          </div>

          <h3
            className="
              font-SofiaProMedium mt-2 mb-3
              text-[16px]
              min-[360px]:text-[18px]
              min-[414px]:text-[20px]
              sm:text-2xl
              md:text-[26px]
              lg:text-3xl
            "
          >
            Your Progress
          </h3>

          <button
            className="
              w-full
              sm:w-full md:w-full
              lg:w-auto lg:ml-auto
              bg-Primary text-Secondary font-SofiaProSemiBold
              rounded-3xl
              py-3 px-8
              min-[360px]:py-3.5 min-[360px]:px-10
              min-[414px]:py-4 min-[414px]:px-12
              md:px-20 md:py-4
              transition duration-300 ease-in-out
              hover:bg-Secondary hover:text-Primary hover:shadow-md
            "
          >
            {resumeText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
