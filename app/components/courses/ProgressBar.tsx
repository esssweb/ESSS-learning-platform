"use client";

import React, { useState } from "react";

export interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const [currentProgress, setCurrentProgress] = useState(progress);

  return (
    <div className="flex items-center">
      <div
        className="
          w-full bg-Quaternary rounded-full overflow-hidden
          h-[14px]
          min-[360px]:h-[16px]
          min-[414px]:h-[18px]
          max-w-[220px]
          min-[360px]:max-w-[260px]
          min-[414px]:max-w-[300px]
          sm:max-w-[310px]
          md:max-w-[440px]
          lg:max-w-[640px]
          xl:max-w-[840px]
          2xl:max-w-[1040px]
        "
      >
        <div
          className="progress-bar bg-Senary h-18 rounded-full"
          style={{ width: `${currentProgress}%`, height: "19px" }}
        ></div>
      </div>
      <p className="progress-value ml-2 font-bold text-3xl">
        {currentProgress}%
      </p>
    </div>
  );
};

export default ProgressBar;
