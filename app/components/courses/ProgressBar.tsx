"use client";

import React from "react";

export interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
<<<<<<< HEAD
  const [currentProgress, setCurrentProgress] = useState(progress);
=======
  const pct = Math.max(0, Math.min(100, progress));
>>>>>>> a2ecf41 (WIP: my Explore updates + keep my ProgressBar)

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
<<<<<<< HEAD
          className="progress-bar bg-Senary h-18 rounded-full"
          style={{ width: `${currentProgress}%`, height: "19px" }}
        ></div>
      </div>
      <p className="progress-value ml-2 font-bold text-3xl">
        {currentProgress}%
=======
          className="bg-Senary h-full rounded-full transition-[width] duration-300 ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p
        className="
          ml-2 font-bold
          text-base
          min-[360px]:text-lg
          min-[414px]:text-xl
          sm:text-[20px]
          md:text-[22px]
          lg:text-3xl
        "
        aria-live="polite"
      >
        {pct}%
>>>>>>> a2ecf41 (WIP: my Explore updates + keep my ProgressBar)
      </p>
    </div>
  );
};

export default ProgressBar;
