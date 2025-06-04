import Link from "next/link";
import CoursesBar from "../components/courses/CoursesBar";

const Explore = () => {
  return (
    <div>
    <CoursesBar />
    <div className="pt-10 p-20">
      <div>
        <h1 className="font-SofiaProMedium text-4xl mb-[59px] ">
          Explore Courses based Difficulty
        </h1>
      </div>
      <div>
        <Link href="/explore/Beginner" className="max-w-[1723px] mx-auto">
          <div className="bg-[url(/assets/images/explore/beginning.png)] flex bg-cover items-center justify-end min-h-[110px] max-w-[1723px] mx-auto lg:min-h-[230px] lg:mb-32 md:min-h-[180px] md:mb-16 sm:min-h-[150px] mb-7 border-solid border-4 rounded-3xl  border-Primary ">
            <h2 className="font-SofiaProMedium text-Primary xl:text-[187px] py-6 mr-4 lg:text-9xl md:text-8xl  sm:text-6xl min-[500px]:text-5xl text-3xl">
              Beginner
            </h2>
          </div>
        </Link>
        <Link href="/explore/Intermediate" className="max-w-[1723px] mx-auto">
          <div className="bg-[url(/assets/images/explore/intermediate.png)] flex bg-cover items-center justify-start min-h-[110px] max-w-[1723px] mx-auto lg:min-h-[230px] lg:mb-32 md:min-h-[180px] md:mb-16 sm:min-h-[150px] mb-7  border-solid border-4 rounded-3xl border-Secondary ">
            <h2 className="font-SofiaProMedium text-Secondary  xl:text-[187px] py-6 ml-6 lg:text-9xl md:text-8xl sm:text-6xl min-[500px]:text-5xl text-3xl">
              Intermediate
            </h2>
          </div>
        </Link>
        <Link href="/explore/Advanced" className="max-w-[1723px] mx-auto">
          <div className="bg-[url(/assets/images/explore/advanced.png)] flex bg-cover items-center justify-end min-h-[110px] max-w-[1723px] mx-auto lg:min-h-[230px] md:min-h-[180px] sm:min-h-[150px] border-solid border-4 mb-[318px] rounded-3xl border-Primary">
            <h2 className="font-SofiaProMedium text-Primary  xl:text-[187px] py-6 mr-4 lg:text-9xl md:text-8xl sm:text-6xl min-[500px]:text-5xl text-3xl">
              Advanced
            </h2>
          </div>
        </Link>
      </div>
    </div>
    </div>
  );
};
export default Explore;