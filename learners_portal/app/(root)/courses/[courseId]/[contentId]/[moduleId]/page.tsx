import ActionButtons from "@/app/components/dynamic-course/ActionButtons";
import Quiz from "@/app/components/dynamic-course/Quiz";
import Reader from "@/app/components/dynamic-course/Reader";
import VideoPlayer from "@/app/components/dynamic-course/VideoPlayer";
import {
  courseData,
  moduleData,
  questionsType,
  subCoursesData,
} from "@/types/dynamic-courses/types";
import {
  getCourseById,
  getModuleById,
  getModulesBySubCoureseId,
  getSubCourseById,
  getSubCoursesByCourseId,
} from "@/utils/fetchItem";
import { BsDot } from "react-icons/bs";
import { TiHome } from "react-icons/ti";

const modulePage = async ({
  params,
  searchParams,
}: {
  params: { courseId: string; contentId: string; moduleId: string };
  searchParams?: { mode?: string };
}) => {
  const mode = searchParams?.mode;
  const course: courseData = await getCourseById(params.courseId);
  const subCourse: subCoursesData = await getSubCourseById(params.contentId);
  const subCourses: subCoursesData[] = await getSubCoursesByCourseId(
    params.courseId,
  );
  const module: moduleData = await getModuleById(params.moduleId);
  const modules: moduleData[] = await getModulesBySubCoureseId(
    params.contentId,
  );

  const questions: questionsType[] = [
    {
      key: "1",
      question: "What is the main focus of the section 'A Deep-Rooted Drive'?",
      choices: [
        {
          key: "1",
          choice: "The history of space travel technology",
        },
        {
          key: "2",
          choice: "Humanity's natural curiosity about the universe",
        },
        {
          key: "3",
          choice: "The benefits of space exploration for society",
        },
        {
          key: "4",
          choice: "The challenges of space travel",
        },
      ],
    },
    {
      key: "2",
      question:
        "According to the passage, what has sparked human interest in the universe for centuries",
      choices: [
        {
          key: "1",
          choice: "Advanced telescopes and scientific instruments",
        },
        {
          key: "2",
          choice: "The need for resources from other planets",
        },
        {
          key: "3",
          choice: "Observing the stars and celestial movements",
        },
        {
          key: "4",
          choice: "Ancient myths about aliens and spaceships",
        },
      ],
    },
    {
      key: "3",
      question:
        "How does the section suggest that ancient myths and legends are connected to space exploration",
      choices: [
        {
          key: "1",
          choice: "They provide scientific data for astronomers",
        },
        {
          key: "2",
          choice:
            "They reflect humanity's long-standing fascination with the cosmos",
        },
        {
          key: "3",
          choice: "They offfer instuctions on how to build spaceships",
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl xl:max-w-4xl 2xl:max-w-6xl px-4 py-3 w-full text-Primary mb-3">
      <div className="flex flex-wrap sm:gap-3 items-center mb-8">
        <TiHome size={40} className="sm:w-10 sm:h-10 w-8 h-8" />

        <BsDot size={30} className="pt-2" />

        <p className="pt-3 font-SofiaProMedium text-base sm:text-xl text-Primary">
          {course.level}
        </p>

        <BsDot size={30} className="pt-2" />

        <p className="pt-3 font-SofiaProMedium text-base sm:text-xl text-Primary">
          {course.title}
        </p>
      </div>

      <h2 className="font-SofiaProSemiBold text-2xl sm:text-3xl my-6">
        {`Sub-Course ${subCourse.part}: ${subCourse.title}`}
      </h2>

      {/* render page on different modes */}
      <div>
        {(!mode || mode === "video") && (
          <div className="aspect-video max-w-6xl mx-auto rounded-3xl">
            <VideoPlayer vidLink={module.videoUrl} />
          </div>
        )}

        {!!mode && mode === "reading" && (
          <div className="max-w-6xl mx-auto rounded-3xl">
            <Reader />
          </div>
        )}

        {!!mode && mode === "quiz" && (
          <div className="max-w-6xl mx-auto rounded-3xl">
            <Quiz questions={questions} title={subCourse.title} />
          </div>
        )}
      </div>

      <ActionButtons
        subCourse={subCourse}
        subCourses={subCourses}
        module={module}
        modules={modules}
      />
    </div>
  );
};

export default modulePage;
