import clsx from "clsx";
import Image from "next/image";

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-black/30 before:to-transparent";

const shimmerWhite =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export const CourseHeroSkeleton = () => {
  return (
    <section
      className={`bg-[url('/assets/images/dynamic-courses/hero-bg.png')] ${shimmer} relative rounded-l-md overflow-clip`}
    >
      <Image
        src="/assets/images/dynamic-courses/space-shuttle.png"
        width={1972}
        height={500}
        alt="background image"
        className="object-contain z-10 invisible"
      />

      <div className="absolute right-1 sm:right-10 lg:right-20 -bottom-1 sm:bottom-5">
        <h1
          className={`font-SofiaProSemiBold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-Primary`}
        ></h1>

        <div className="ml-auto max-w-fit">
          <p
            className={`text-Primary text-lg sm:text-2xl font-SofiaProMedium sm:mt-6 lg:mt-9`}
          ></p>

          <p
            className={`font-SofiaProSemiBold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-Primary`}
          ></p>
        </div>
      </div>
    </section>
  );
};

export const CoursePageSkeleton = () => {
  return (
    <div className="mx-auto relative max-w-6xl overflow-clip xl:max-w-4xl 2xl:max-w-6xl text-Primary px-5 py-2">
      <div
        className={`${shimmer} relative overflow-clip rounded-lg h-10 w-1/3`}
      ></div>

      <h2
        className={`${shimmer} relative overflow-clip h-8 sm:h-9 lg:h-10 my-4 rounded-lg w-3/4`}
      ></h2>

      <SubCourseDescriptionSkeleton />
      <SubCourseDescriptionSkeleton />
      <SubCourseDescriptionSkeleton />
    </div>
  );
};

export const SubCourseDescriptionSkeleton = () => {
  return (
    <div className="border-l-8 rounded-lg text-Primary border-Primary bg-white px-5 py-4 my-4">
      <div className="border-b pb-4 w-full mb-4 sm:max-w-[80%] md:max-w-[60%]">
        <h2
          className={`${shimmer} relative overflow-clip rounded-md sm:max-w-[80%] h-8 text-lg lg:text-xl`}
        ></h2>
      </div>

      <ModuleDescriptionSkeleton />
      <ModuleDescriptionSkeleton />
      <ModuleDescriptionSkeleton />
    </div>
  );
};

const ModuleDescriptionSkeleton = () => {
  return (
    <div className="my-4">
      <h3
        className={`${shimmer} relative overflow-clip rounded-md text-base h-6 lg:h-7 lg:text-lg`}
      ></h3>
    </div>
  );
};

export const SubCoursePageSkeleton = () => {
  return (
    <div className="mx-auto max-w-6xl xl:max-w-4xl 2xl:max-w-6xl px-4 py-3 w-full text-Primary">
      <div
        className={`${shimmer} relative overflow-clip rounded-md h-10 w-2/3`}
      ></div>

      <h2
        className={`${shimmer} relative overflow-clip h-8 sm:h-9 lg:h-10 my-4 rounded-md w-3/4`}
      ></h2>

      <div className="lg:px-16 md:px-10 px-5 py-3 bg-white border-l-8 border-Primary rounded-lg">
        <div className="max-w-[80%] sm:max-w-[60%] border-b py-5">
          <h3
            className={`${shimmer} relative overflow-clip max-w-[80%] rounded-sm h-5`}
          ></h3>
        </div>

        <div className="max-w-4xl py-3">
          <p
            className={`${shimmer} relative overflow-clip h-5 rounded-t-md`}
          ></p>
          <p className={`${shimmer} relative overflow-clip h-5`}></p>
          <p className={`${shimmer} relative overflow-clip h-5`}></p>
          <p className={`${shimmer} relative overflow-clip h-5`}></p>
          <p className={`${shimmer} relative overflow-clip h-5`}></p>
          <p
            className={`${shimmer} relative overflow-clip h-5 rounded-b-md`}
          ></p>
        </div>
      </div>

      {[1, 2, 3].map((_, idx) => (
        <ModuleListSkeleton key={idx} />
      ))}
    </div>
  );
};

export const ModuleListSkeleton = ({
  inSidebar,
  isFirst,
  isLast,
}: {
  inSidebar?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) => {
  return (
    <div
      className={clsx("bg-Primary", {
        "my-3 rounded-lg lg:px-16 md:px-10 px-5 py-3": !inSidebar,
        "px-2 py-1": inSidebar,
        "rounded-t-lg mt-3 pt-3": isFirst,
        "rounded-b-lg": isLast,
      })}
    >
      <h4
        className={clsx(
          `${shimmerWhite} relative overflow-clip mb-[6px] rounded-sm max-w-[80%] sm:max-w-[35%]`,
          {
            "text-lg h-6": inSidebar,
            "text-base h-5": !inSidebar,
          },
        )}
      ></h4>

      <ul
        className={clsx("max-w-[80%] sm:max-w-[60%]", {
          "px-3 sm:px-10": !inSidebar,
          "px-1": inSidebar,
        })}
      >
        <li
          className={`${shimmerWhite} relative h-5 overflow-clip my-2 rounded-sm`}
        ></li>

        <li
          className={`${shimmerWhite} relative h-5 overflow-clip my-2 rounded-sm`}
        ></li>

        <li
          className={`${shimmerWhite} relative h-5 overflow-clip my-2 rounded-sm`}
        ></li>
      </ul>
    </div>
  );
};

export const ModulePageSkeleton = () => {
  return (
    <div className="mx-auto max-w-6xl xl:max-w-4xl 2xl:max-w-6xl px-4 py-3 w-full text-Primary mb-3">
      <div
        className={`${shimmer} relative overflow-clip rounded-md h-10 w-2/3`}
      ></div>

      <h2
        className={`${shimmer} relative overflow-clip h-8 sm:h-9 lg:h-10 my-4 rounded-md w-3/4`}
      ></h2>

      <div
        className={`${shimmer} relative overflow-clip border-2 aspect-video w-full max-w-6xl mx-auto rounded-[10px]`}
      ></div>

      <div className="flex items-center gap-3 sm:gap-9 justify-end mt-8 text-xs md:text-sm lg:text-lg">
        <div className={`${shimmer} relative rounded-md overflow-clip w-[60%]`}>
          <div className="px-2 py-1 sm:py-2 sm:px-4">
            <p className="h-4 md:h-5 lg:h-7"></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SideBarSubCourseSkeleton = () => {
  return (
    <div className={`${shimmer} relative border overflow-clip rounded-lg`}>
      <div className="px-2 py-3 xl:py-2 border-Primary rounded-md">
        <h3 className="mb-1 flex h-6 sm:h-7 sm:text-lg"></h3>

        <p className="h-5 sm:h-6"></p>
      </div>
    </div>
  );
};
