export type courseData = {
  id: number;
  title: string;
  description: string;
  images: string[];
  category?: string[];
  level?: "Beginner" | "Intermediate" | "Advanced";
};
