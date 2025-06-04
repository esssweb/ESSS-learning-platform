import BackToTopSection from "./components/home_Page/BackToTopSection";
import CourseSection from "./components/home_Page/CourseSection";
import ExploreSection from "./components/home_Page/ExploreSection";
import FeaturedCourse from "./components/home_Page/FeaturedCourse";
import GetCertified from "./components/home_Page/GetCertified";
import GetStarted from "./components/home_Page/GetStarted";
import HeroSection from "./components/home_Page/HeroSection";
import MentorSection from "./components/home_Page/MentorSection";
import RegisterSection from "./components/home_Page/RegisterSection";

export default function Home() {
  return (
    <main className="relative pb-3">
      <HeroSection />
      <GetStarted />
      <ExploreSection />
      <GetCertified />
      <CourseSection />
      <FeaturedCourse />
      <RegisterSection />
      {/* <MentorSection/> */}
      <BackToTopSection />
    </main>
  );
}
