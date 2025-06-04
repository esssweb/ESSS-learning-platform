"use client";

import { useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { FaRegCircleCheck } from "react-icons/fa6";
import clsx from "clsx";

import {
  actionButtonsData,
  moduleData,
  subCoursesData,
} from "@/types/dynamic-courses/types";
import Popup from "../Popup";

const ActionButtons = ({
  subCourse,
  subCourses,
  module,
  modules,
}: actionButtonsData) => {
  const [isPopup, setIsPopup] = useState(false);
  const [popupAlert, setPopupAlert] = useState("");

  const pathName = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const prevModule: moduleData[] = modules.filter(
    (m) => m.part === module.part - 1,
  );
  const prevSubCourse: subCoursesData[] = subCourses.filter(
    (s) => s.part === subCourse.part - 1,
  );
  const nextModule: moduleData[] = modules.filter(
    (m) => m.part === module.part + 1,
  );
  const nextSubCourse: subCoursesData[] = subCourses.filter(
    (s) => s.part === subCourse.part + 1,
  );
  const path = `courses/${params.courseId}`;
  const mode = searchParams.get("mode") || "video";

  const handleNext = () => {
    switch (module.status) {
      case "COMPLETED":
        if (nextModule.length === 0) {
          router.prefetch(`/${path}/${nextSubCourse[0]._id}`);
          router.push(`/${path}/${nextSubCourse[0]._id}`, { scroll: false });
        } else {
          router.prefetch(`/${path}/${subCourse._id}/${nextModule[0]._id}`);
          router.push(`/${path}/${subCourse._id}/${nextModule[0]._id}`, {
            scroll: false,
          });
        }
        break;

      case "ATTEMPTED":
      case "IN PROGRESS":
        if (mode !== "quiz") {
          router.prefetch(`${pathName}?mode=quiz`);
          router.push(`${pathName}?mode=quiz`, { scroll: false });
        }

        setPopupAlert("You need to pass the quiz first");
        setIsPopup(true);

        setTimeout(() => {
          setIsPopup(false);
        }, 7000);
    }
  };

  const handlePrev = () => {
    if (prevModule.length === 0) {
      router.prefetch(`/${path}/${prevSubCourse[0]._id}`);
      router.push(`/${path}/${prevSubCourse[0]._id}`, { scroll: false });
    } else {
      router.prefetch(`/${path}/${subCourse._id}/${prevModule[0]._id}`);
      router.push(`/${path}/${subCourse._id}/${prevModule[0]._id}`, {
        scroll: false,
      });
    }
  };

  const handleComplete = () => {
    if (mode !== "quiz") {
      router.prefetch(`${pathName}?mode=quiz`);
      router.push(`${pathName}?mode=quiz`, { scroll: false });
    }

    setPopupAlert("You need to pass the quiz first");
    setIsPopup(true);

    setTimeout(() => {
      setIsPopup(false);
    }, 7000);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 sm:gap-9 justify-end mt-8 text-xs md:text-sm lg:text-lg">
        <button
          disabled={module.part === 1 && subCourse.part === 1}
          onClick={handlePrev}
          className="bg-white min-w-fit disabled:bg-white/10 disabled:text-Primary/20 disabled:border-Primary/20 text-Primary rounded-[7px] border border-Primary px-2 py-1 sm:py-2 sm:px-4 font-SofiaProRegular"
        >
          Prev. Section
        </button>

        <button
          disabled={module.status === "COMPLETED"}
          onClick={handleComplete}
          className={clsx(
            "bg-Primary min-w-fit disabled:text-Secondary/70 disabled:bg-Primary/80 rounded-[7px] text-white px-2 border border-Primary sm:px-4 font-SofiaProRegular",
            {
              "py-0.5 sm:py-1.5": module.status === "COMPLETED",
              "py-1 sm:py-2": module.status !== "COMPLETED",
            },
          )}
        >
          {module.status === "COMPLETED" ? (
            <span className="flex items-center justify-center gap-3">
              <p className="mt-1">Completed</p>
              <FaRegCircleCheck
                size={25}
                className="lg:w-[25px] lg:h-[25px] w-3.5 h-3.5 sm:w-5 sm:h-5"
              />
            </span>
          ) : (
            "Mark as Complete"
          )}
        </button>

        <button
          disabled={
            module.part === modules.length &&
            subCourse.part === subCourses.length
          }
          onClick={handleNext}
          className="bg-white min-w-fit disabled:bg-white/10 disabled:text-Primary/20 disabled:border-Primary/20 rounded-[7px] text-Primary px-2 py-1 sm:py-2 border border-Primary sm:px-4 font-SofiaProRegular"
        >
          Next Section
        </button>
      </div>

      <Popup isSeen={isPopup} popupMessage={popupAlert} />
    </>
  );
};

export default ActionButtons;
