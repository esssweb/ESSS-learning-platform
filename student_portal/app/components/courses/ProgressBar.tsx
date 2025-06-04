"use client";
import { useState } from "react";

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress}) => {
  const [currentProgress, setCurrentProgress] = useState(progress);

  return (
    <div className="flex items-center">
      <div className="max-w-[220px] sm:max-w-[310px] md:max-w-[440px] lg:max-w-[640px] xl:max-w-[840px] 2xl:max-w-[1040px] w-full bg-Quaternary rounded-full h-[19px] overscroll-none current_course-wrapper">
        <div
          className="progress-bar bg-Senary h-18 rounded-full"
          style={{ width: `${currentProgress}%`, height: '19px'}}
        ></div>
      </div>
      <p className="progress-value ml-2 font-bold text-3xl">{currentProgress}%</p>
    </div>
  );
};

export default ProgressBar;
