import { COURSES } from "../data/courses";
import type { courseData } from "@/types/dynamic-courses/types";

export type CoursesResponse = { courses: courseData[] };

export async function getCourses(
  limit = 4,
  skip = 0
): Promise<CoursesResponse> {
  const courses = COURSES.slice(skip, skip + limit);
  return { courses };
}
