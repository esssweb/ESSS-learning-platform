"use client";

import {
  IoIosArrowDropdownCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";
import clsx from "clsx";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { toggleSidebar } from "@/store/features/sidebarslice";

const Heading = () => {
  const isSidebar = useSelector((state: RootState) => state.isSidebar.value);
  const dispatch: AppDispatch = useDispatch();

  return (
    <div
      className={clsx(
        "md:px-10 px-5 py-2 sm:py-3 lg:px-5 flex gap-10 items-center",
        {
          hidden: isSidebar,
          block: !isSidebar,
        },
      )}
    >
      <div className="w-full mx-auto flex gap-10 items-center border-b border-Quaternary pb-2">
        <h2 className="font-SofiaProSemiBold text-xl sm:text-2xl">
          Sub-Courses
        </h2>

        {isSidebar ? (
          <IoIosArrowDropdownCircle
            size={30}
            className="rounded-full text-Secondary bg-Primary hover:cursor-pointer w-5 h-5 sm:w-6 sm:h-6 md:w-[30px] md:h-[30px]"
            onClick={() => dispatch(toggleSidebar())}
          />
        ) : (
          <IoIosArrowDroprightCircle
            size={30}
            className="rounded-full hover:cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
            onClick={() => dispatch(toggleSidebar())}
          />
        )}
      </div>
    </div>
  );
};

export default Heading;
