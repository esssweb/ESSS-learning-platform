import Image from "next/image";
import Link from "next/link";
import React from "react";

const RegisterSection = () => {
  return (
    <section className="relative items-center flex justify-end h-[40vh] md:h-[60vh] min-h-[400px]  lg:min-h-[600px]">
      <div className="absolute z-[-1] w-2/3 h-[140%] left-0 top-[-100px]  lg:top-[-35] flex justify-center items-center">
        <Image
          src="/assets/images/home_page/group_180@2x.png"
          fill
          className="object-contain max-w-4xl"
          alt="logo"
        />
      </div>
      <div className="w-2/5 md:w-1/2 flex justify-center md:text-left flex-col">
        <h1 className="font-AbolitionTestRegular text-center md:text-left font-semibold [font-size:_clamp(45px,10vw,130px)] tracking-widest">
          Explore
        </h1>
        <p className="hidden md:block mt-5 [font-size:_clamp(20px,1.5vw,35px)] leading-9 text-xl">
          Find courses you could be interested in, & start learning right away
        </p>
        <div className="flex  flex-col lg:flex-row max-w-[15rem] lg:max-w-none md:w-full">
          <button className=" text-Secondary lg:mr-11 mt-6 bg-Primary rounded-full px-2.5 py-2 md:px-2 md:py-2 lg:px-5 lg:py-3 hover:bg-Secondary hover:text-Primary lg:text-2xl md:text-xl ">
            <Link href="/register">Get Started</Link>
          </button>
          <button className=" text-Primary lg:mr-11 mt-6 bg-Secondary rounded-full px-2.5 py-2 md:px-4 md:py-2 lg:px-5 lg:py-3 hover:bg-Primary hover:text-Secondary lg:text-2xl md:text-xl ">
            <Link href="/register">Become a Member</Link>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;
