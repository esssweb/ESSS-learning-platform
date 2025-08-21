import { CourseButtonProps } from "@/types/dynamic-courses/types";
const CourseButton = ({ style, innerText }: CourseButtonProps) => {
  return (
    <button
      className={`w-[127px] h-[37px] border-solid border-[1.7px] border-Primary rounded-xl hover:opacity-70 ${
        style ? style : null
      }`}
    >
      {innerText}
    </button>
  );
};

export default CourseButton;
