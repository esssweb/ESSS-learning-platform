import Link from "next/link";
import styles from "./courses.module.css";
import CourseCard from "./CourseCard";

const CurrentCourse = () => {
  // temp data; replace with backend later
  const current = {
    title: "Space Weather",
    imageSrc: "/assets/images/img.jpg",
    progress: 36,
  };

  return (
    <div className="flex flex-col w-full pb-5">
      <p className="ml-[20px] md:ml-[40px] lg:ml-[80px] xl:ml-[123px] mt-[30px] mb-[10px] text-Primary text-xl font-semibold font-SofiaProBold">
        Resume what you Started...
      </p>
      <div
        className="
          w-[360px] sm:w-[600px] md:w-[700px] lg:w-[900px] xl:w-[1100px] 2xl:w-[1300px]
          mx-auto
        "
      >
        <div className="flex justify-end mb-2 pr-1">
          <Link
            href="/courses/progress_bar"
            className="
              font-SofiaProMedium text-Primary underline underline-offset-2
              text-[12px] min-[360px]:text-[13px] min-[414px]:text-[14px] sm:text-[15px] md:text-[20px]
              hover:opacity-80
            "
          >
            See more
          </Link>
        </div>

        <CourseCard
          title={current.title}
          imageSrc={current.imageSrc}
          progress={current.progress}
          resumeText="Resume"
        />
      </div>

      {/* keep your radio dots */}
      <div className="current-course-radio-btns flex self-center mt-6">
        <div
          className={`${styles.current_course_radio} mx-[6px] rounded-full bg-transparent w-5 h-5 relative shadow-[0px_3px_6px_#00000029]`}
        >
          <input
            type="radio"
            id="radio_1"
            defaultChecked
            name="current-course"
            className={`absolute top-0 w-5 h-5 radio-input ${styles.radio_input}`}
          />
          <div className={styles.radio_div}></div>
        </div>
        <div
          className={`${styles.current_course_radio} mx-[6px] rounded-full bg-transparent w-5 h-5 relative shadow-[0px_3px_6px_#00000029]`}
        >
          <input
            type="radio"
            id="radio_2"
            name="current-course"
            className={`absolute top-0 w-5 h-5 radio-input ${styles.radio_input}`}
          />
          <div className={styles.radio_div}></div>
        </div>
        <div
          className={`${styles.current_course_radio} mx-[6px] rounded-full bg-transparent w-5 h-5 relative shadow-[0px_3px_6px_#00000029]`}
        >
          <input
            type="radio"
            id="radio_3"
            name="current-course"
            className={`absolute top-0 w-5 h-5 radio-input ${styles.radio_input}`}
          />
          <div className={styles.radio_div}></div>
        </div>
      </div>
    </div>
  );
};

export default CurrentCourse;
