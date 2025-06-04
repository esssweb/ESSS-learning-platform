"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { moduleData, subCoursesData } from "@/types/dynamic-courses/types";
import SubCoursesCard from "./SubCoursesCard";
import { RootState } from "@/store/store";
import Heading from "./Heading";
import ModuleListCard from "./ModuleListCard";
import {
  useGetModulesBySubcourseIdQuery,
  useGetSubcoursesByCourseIdQuery,
} from "@/store/api";
import { ModuleListSkeleton, SideBarSubCourseSkeleton } from "../Skeletons";
import { ModuleError, SubCourseError } from "./SideBarErrors";

const SideBar = () => {
  const pathName = usePathname();
  const isSidebar = useSelector((state: RootState) => state.isSidebar.value);
  const params = useParams();

  const {
    data: subCourses,
    isFetching,
    isLoading,
    isError,
    refetch,
  } = useGetSubcoursesByCourseIdQuery(params.courseId, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: modules,
    isFetching: moduleIsFetching,
    isLoading: moduleIsLoading,
    isError: moduleIsError,
    refetch: moduleRefetch,
  } = useGetModulesBySubcourseIdQuery(params.contentId, {
    refetchOnMountOrArgChange: true,
  });

  const curSubCourse: subCoursesData[] = subCourses?.filter(
    (s: subCoursesData) => s._id === params.contentId,
  );

  return (
    <div
      className={clsx("xl:self-start h-auto overflow-y-auto", {
        "xl:sticky xl:top-0 xl:max-h-screen xl:w-1/3 xl:max-w-lg": isSidebar,
        hidden: !isSidebar,
      })}
    >
      <Heading />

      <div className="xl:max-w-md items-stretch grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-[1160px]:grid-cols-4 xl:flex xl:flex-col gap-3 mx-6 pt-5">
        {isError ? (
          <SubCourseError refetch={refetch} />
        ) : isLoading || isFetching ? (
          <>
            <SideBarSubCourseSkeleton />
            <SideBarSubCourseSkeleton />
            <SideBarSubCourseSkeleton />
            <SideBarSubCourseSkeleton />
            <SideBarSubCourseSkeleton />
            <SideBarSubCourseSkeleton />
            <SideBarSubCourseSkeleton />
          </>
        ) : (
          subCourses?.map((subCourse: subCoursesData) => (
            <div
              key={subCourse._id}
              className={clsx("group", {
                "col-span-1 sm:col-span-2 lg:col-span-3 min-[1160px]:col-span-4":
                  !!params.moduleId &&
                  (pathName.includes(
                    `/courses/${params.courseId}/${subCourse._id}/${params.moduleId}`,
                  ) ||
                    subCourse.part < curSubCourse[0].part),
              })}
            >
              <div
                className={`rounded-lg
                ${
                  pathName === `/courses/${params.courseId}/${subCourse._id}` ||
                  (!!params.moduleId &&
                    pathName.includes(
                      `/courses/${params.courseId}/${subCourse._id}/${params.moduleId}`,
                    ))
                    ? "bg-Secondary"
                    : "hover:bg-Secondary bg-white"
                }
              `}
              >
                <Link href={`/courses/${params.courseId}/${subCourse._id}`}>
                  <SubCoursesCard
                    isLoading={isLoading || isFetching}
                    key={subCourse._id}
                    title={subCourse.title}
                    part={subCourse.part}
                  />
                </Link>
              </div>

              {!!params.moduleId &&
                pathName.includes(
                  `/courses/${params.courseId}/${subCourse._id}/${params.moduleId}`,
                ) &&
                (moduleIsError ? (
                  <ModuleError refetch={moduleRefetch} />
                ) : moduleIsLoading || moduleIsFetching ? (
                  <>
                    <ModuleListSkeleton />
                    <ModuleListSkeleton />
                    <ModuleListSkeleton />
                  </>
                ) : (
                  modules.map((module: moduleData, index: number) => (
                    <ModuleListCard
                      key={module._id}
                      id={module._id}
                      title={module.title}
                      inSidebar={true}
                      isFirst={index === 0}
                      isLast={modules && index === modules.length - 1}
                    />
                  ))
                ))}
            </div>
          ))
        )}
      </div>

      <hr className="my-5 mx-6 text-Quinary" />
    </div>
  );
};

export default SideBar;
