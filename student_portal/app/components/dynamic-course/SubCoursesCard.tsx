import { cardData } from "@/types/dynamic-courses/types";

const SubCoursesCard = (props: cardData) => {
  return (
    <div className="px-2 py-3 xl:py-2 border-l-[6px] border-Primary rounded-md">
      <h3 className="mb-1 flex gap-3 sm:gap-7 sm:text-lg text-Primary font-SofiaProSemiBold">
        {props.isLoading ? "Loading..." : `Sub Course ${props.part}`}
      </h3>

      <p className="text-sm sm:text-base text-Primary font-SofiaProLight">
        {props.isLoading ? "Loading..." : props.title}
      </p>
    </div>
  );
};

export default SubCoursesCard;
