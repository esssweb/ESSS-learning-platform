import { TfiSearch } from "react-icons/tfi";

const CoursesBar = () => {
  return (
    <div className="flex justify-between items-center h-[111px] text-2xl bg-Primary text-Secondary px-[10px] sm:px-[20px] md:px-[50px] lg:px-[80px] xl:px-[95px]">
      <div className="explore-wrapper flex items-center">
        <TfiSearch size="30px" />
        <p>Explore</p>
      </div>
      <div className="user-name">
        {/* name to be filled from backend */}
        <p>Welcome, Ayantu</p>
      </div>
    </div>
  );
};

export default CoursesBar;