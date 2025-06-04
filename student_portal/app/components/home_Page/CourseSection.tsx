import Image from "next/image";
import Link from "next/link";
import styles from "./home_page.module.css";
import { courseData } from "./dummyData";

const CourseSection = () => {
  return (
    <div className={`overflow-x-scroll h-[25rem] flex  items-center ${styles.scrollbar_hide}`}>
      {courseData.map((card, index) => (
        <Link href={card.href} key={index} className="m-3 h-[15rem] min-w-[25rem] shadow-[5px_35px_60px_-15px_rgba(0,0,0,0.8)] rounded-3xl bg-white">
          <figure className="relative p-2 overflow-hidden rounded-t-2xl h-[80%] w-full">
            <Image
              src={card.imageUrl}
              fill
              alt={card.alt}
              className="object-cover hover:scale-125 transition-all"
            />
          </figure>
          <div className="flex justify-center h-[20%] items-center rounded-b-2xl bg-Primary text-Tertiary">
            {card.title}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CourseSection;
