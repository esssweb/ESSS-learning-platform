import { TfiSearch } from "react-icons/tfi";

const CoursesBar = () => {
  return (
    <div
      className="
        flex justify-between items-center h-[76px] bg-Primary text-Secondary
        text-base px-3                     /* base */
        min-[360px]:h-[88px] min-[360px]:text-[18px] min-[360px]:px-4
        min-[414px]:h-[96px] min-[414px]:text-[20px] min-[414px]:px-5
        sm:px-[20px] md:px-[50px] lg:px-[80px] xl:px-[95px]
      "
    >
      <div className="explore-wrapper flex items-center gap-2">
        <TfiSearch size="24px" className="min-[414px]:!h-7 min-[414px]:!w-7" />
        <p>Explore</p>
      </div>
      <div className="user-name">
        <p>Welcome, Ayantu</p>
      </div>
    </div>
  );
};

export default CoursesBar;
