import Image from "next/image";
import styles from "./home_page.module.css";
import Link from "next/link";

const BackToTopSection = () => {
  return (
    <div
      className={`max-w-fit sticky bottom-4 right-8 ml-auto hover:translate-y-[-0.2rem] ${styles.back_to_top}`}
    >
      <Link
        href="#"
        className={`flex items-center justify-center rounded-2xl px-3 py-2`}
      >
        Back to Top
        <Image
          className=" ml-4 w-7"
          src="/assets/images/home_page/union.svg"
          width={100}
          height={100}
          alt="hexagon"
        />
      </Link>
    </div>
  );
};

export default BackToTopSection;
