import VideoPlayer from "@/app/components/dynamic-course/VideoPlayer";

const SubCourseContent = ({
  params,
}: {
  params: { courseId: string; contentId: string };
}) => {
  const currentPage = parseInt(params.contentId) - 1;
  const videos = [
    "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    "https://www.youtube.com/watch?v=9RhWXPcKBI8",
    "https://www.youtube.com/watch?v=PA9iymey_lM",
    "https://www.youtube.com/watch?v=14jlIxVrcvo",
  ];

  return (
    <div className="px-4 py-6 w-full xl:border-l-2">
      <div className="aspect-video max-w-6xl xl:max-w-4xl 2xl:max-w-6xl mx-auto rounded-3xl">
        <VideoPlayer vidLink={videos[currentPage]} />
      </div>
    </div>
  );
};

export default SubCourseContent;
