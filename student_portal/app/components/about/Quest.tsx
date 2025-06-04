import Image from "next/image";
import Link from "next/link";
import styles from "./About.module.css";

export default function Quest() {
  return (
    <div className="flex flex-col md:flex-row px-5">
      <div className="items-center md:items-start">
        <Image
          src="/assets/images/about/combined.png"
          alt="picture"
          width={900}
          height={900}
        />
      </div>

      <div
        className={`flex flex-col justify-center md:w-1/2 ${styles.lineHeight} text-Primary text-2xl lg:text-3xl xl:text-4xl`}
      >
        <div className="items-center text-center font-AbolitionTestRegular">
          <p className={styles.questFont}>TAKING</p>
          <p className={styles.questFont}>YOU ON</p>
          <p className={styles.questFont}>A</p>
        </div>

        <div className="flex justify-center">
          <Image
            src="/assets/images/about/quest.png"
            alt="picture"
            width={400}
            height={350}
            className="mx-auto md:mx-0 w-80"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center font-sofia-pro-normal">
          <Link
            href="/"
            className="bg-Primary text-Secondary py-3 px-5 m-2 rounded-full font-medium hover:bg-Secondary hover:text-Primary w-96 md:min-w-fit md:w-fit md:text-2xl text-center transition-colors"
          >
            Get Started
          </Link>

          <Link
            href="/"
            className="bg-Secondary text-Primary py-3 px-5 m-2 rounded-full font-medium hover:bg-Primary hover:text-Secondary w-96 md:min-w-fit md:w-fit md:text-2xl text-center transition-colors"
          >
            Become A Member
          </Link>
        </div>
      </div>
    </div>
  );
}
