import CoursesBar from "@/app/components/courses/CoursesBar";
import Hero from "@/app/components/explore/dynamic-explore/Hero";

const Layout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { level: string };
}) => (
  <>
    <CoursesBar />
    <Hero level={params.level} />
    {children}
  </>
);

export default Layout;
