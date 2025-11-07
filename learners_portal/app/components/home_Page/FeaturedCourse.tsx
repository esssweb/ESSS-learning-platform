import Image from "next/image";
import { logoItems } from "./dummyData";

const FeaturedCourse = () => {
  return (
    <section className="flex flex-col">
      <h1 className="flex justify-center text-5xl font-SofiaProBlack">
        Courses Featured In
      </h1>
      <div className="h-56 mt-20 gap-x-[-4rem] justify-around flex ">
        {logoItems.map((logo, index) => (
          <div key={index} className="h-full w-36 lg:w-60 relative">
            <Image
              fill
              className="object-contain"
              alt={logo.alt}
              src={logo.imageUrl}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCourse;
