import Image from "next/image";

import { getCourseById } from "@/utils/fetchItem";
import { courseData } from "@/types/dynamic-courses/types";

const Hero = async ({ id }: { id: string }) => {
  const course: courseData = await getCourseById(id);

  return (
    <section className="bg-[url('/assets/images/dynamic-courses/hero-bg.png')] relative rounded-l-md">
      <Image
        src="/assets/images/dynamic-courses/space-shuttle.png"
        width={1972}
        height={500}
        alt="background image"
        className="object-contain z-10"
      />

      <div className="absolute right-1 sm:right-10 lg:right-20 -bottom-1 sm:bottom-5">
        <h1 className="font-SofiaProSemiBold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-Primary">
          {course.title}
        </h1>

        <div className="ml-auto max-w-fit">
          <p className="text-Primary text-lg sm:text-2xl font-SofiaProMedium sm:mt-6 lg:mt-9">
            Course Length
          </p>

          <p className="font-SofiaProSemiBold text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-Primary">
            {"2Hrs 35 Mins"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
