export type cardData = {
  key: string;
  part: number;
  title: string;
  modules?: moduleType[];
  isLoading?: boolean;
};

export type moduleCard = {
  key: string;
  title: string;
  description: string;
};

export type moduleType = {
  key: string;
  part: string;
  title: string;
  description: string;
};

export type subCourseType = {
  key: string;
  part: string;
  title: string;
  modules: moduleType[];
};

export type subCourseTypeNoPart = {
  key: string;
  part: string;
  title: string;
  modules: moduleCard[];
};

export type choisesType = {
  key: string;
  choice: string;
};

export type questionsType = {
  key: string;
  question: string;
  choices: choisesType[];
};

export type actionButtonsData = {
  subCourse: subCoursesData;
  subCourses: subCoursesData[];
  module: moduleData;
  modules: moduleData[];
};

export type courseData = {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  category: string[];
  level: string;
  price: number;
  rating: number;
  thumbnail: string;
  listOfStudents: string[];
  listOfSubCourses: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type subCoursesData = {
  _id: string;
  title: string;
  courseID: string;
  description: string;
  rating: number;
  thumbnail: string;
  listOfModules: string[];
  createdAt: string;
  updatedAt: string;
  part: number;
  __v: number;
};

type moduleStatus =
  | "COMPLETED"
  | "IN PROGRESS"
  | "LOCKED"
  | "NOT STARTED"
  | "ATTEMPTED";

export type moduleData = {
  _id: string;
  title: string;
  description: string;
  status: moduleStatus;
  videoUrl: string;
  listOfQuiz: string[];
  createdAt: string;
  updatedAt: string;
  subCourseId: string;
  part: number;
  __v: number;
};
