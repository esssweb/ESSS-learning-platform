import CoursesBar from "./CoursesBar";
import CurrentCourse from "./CurrentCourse";
import CoursesSection from "./CoursesSection";

const CoursesPage = async () => {
  const fetchCoursesData = async (skip = 0) => {
    try {
      const res = await fetch(
        `https://dummyjson.com/products?limit=4&skip=${skip}&select=id,title,description,images`
      );
      return await res.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      return { products: [] };
    }
  };

  const firstBatch = await fetchCoursesData(0);
  const secondBatch = await fetchCoursesData(4);

  return (
    <div className="overflow-hidden">
      <CoursesBar />
      <CurrentCourse />

      <CoursesSection
        title="Most Popular Courses"
        data={firstBatch.products}
        bg="bg-Tertiary"
      />

      <CoursesSection
        title="Explore More Courses"
        data={secondBatch.products}
        bg="bg-white"
      />
    </div>
  );
};

export default CoursesPage;
