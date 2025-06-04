import Image from "next/image";

import Link from "next/link";

const HeroSection = () => {
  return (
    <section
      className="flex w-full h-[40vh] min-h-[450px] md:min-h-[600px] md:h-[70vh] lg:h-[95vh] bg-Tertiary"
      id="heroSection"
    >
      <div className="relative flex w-full flex-col flex-1 justify-center items-center">
        <Image
          className="absolute w-1/4 bottom-0 translate-y-1/2 left-0 translate-x-1/2"
          src="/assets/images/home_page/group_5.svg"
          width={100}
          height={100}
          alt="hexagon"
        />
        <Image
          className="absolute max-w-[100px] w-1/6 top-0 left-1/2 "
          src="/assets/images/home_page/polygon_1.svg"
          width={100}
          height={100}
          alt="rotatedTriangle"
        />
        <Image
          className="absolute min max-w-[80px] w-2/12 bottom-1/2 translate-y-[400%]  translate-x-1/2 right-0 "
          src="/assets/images/home_page/path_707.svg"
          width={100}
          height={100}
          alt="hexagonFilled"
        />
        <div className="relative w-5/6 md:w-2/3 ml-[-6vw]">
          <Image
            className="hidden md:block absolute w-1/4 top-0 left-0 translate-x-[-60%] translate-y-[-80%] max-w-[100px]"
            src="/assets/images/home_page/group_14.svg"
            width={100}
            height={100}
            alt="triangularPrism"
          />
          <div className="[font-size:_clamp(25px,3vw,100px)] text-[#707070]">
            Welcome to ESSS
          </div>
          <Image
            className="[size:_clamp(25px,3vw,100px)]"
            src="/assets/images/home_page/group_128@2x.png"
            width={1000}
            height={100}
            alt="learning logo"
          />
          <button className=" text-Secondary lg:mr-11 mt-6 bg-Primary rounded-full px-2.5 py-2 md:px-4 md:py-2 lg:px-5 lg:py-3 hover:bg-Secondary hover:text-Primary lg:text-2xl md:text-xl ">
            <Link href="/register">Get Started</Link>
          </button>
        </div>
      </div>
      <div className=" h-full flex items-end justify-center w-full flex-1 ">
        <div className="max-h-full relative bottom-0 max-w-[600px] right-0 w-full aspect-[6/7]  ">
          <Image
            className="absolute max-h-full bottom-0 "
            src="/assets/images/home_page/group_33@2x.png"
            width={1000}
            height={100}
            alt="femaleTeacher"
          />
          <Image
            className="absolute lg:top-10 right-0 translate-x-[-10%] w-2/5 "
            src="/assets/images/home_page/group_19.svg"
            width={100}
            height={100}
            alt="circles"
          />
          <Image
            className="absolute hover:animate-pulse lg:top-10 left-[-10%] w-1/6 "
            src="/assets/images/home_page/group_16.svg"
            width={100}
            height={100}
            alt="cube"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
