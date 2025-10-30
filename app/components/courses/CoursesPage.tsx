import CoursesBar from "./CoursesBar";
import CurrentCourse from "./CurrentCourse";
import CoursesSection from "./CoursesSection";
import { getCourses } from "../../lib/courses";

export default async function CoursesPage(): Promise<JSX.Element> {
  const [firstBatch, secondBatch] = await Promise.all([
    getCourses(4, 0),
    getCourses(4, 4),
  ]);

  return (
    <div className="overflow-hidden">
      <CoursesBar />
      <CurrentCourse />

      <CoursesSection
        title="Most Popular Courses"
        data={firstBatch.courses}
        bg="bg-Tertiary"
      />

      <CoursesSection
        title="Explore More Courses"
        data={secondBatch.courses}
        bg="bg-white"
      />
    </div>
  );
}
