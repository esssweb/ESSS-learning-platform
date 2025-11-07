import Link from "next/link";
import dynamic from "next/dynamic";

const LottiePlayer = dynamic(() => import("./LottiePlayer"), { ssr: false });

const GetStarted = () => {
  return (
    <section className="flex flex-col bg-Secondary md:flex-row min-h-[300px] h-[30vh]">
      <div className="flex flex-1  h-full justify-center items-center">
        <div className=" flex flex-col items-center w-2/3">
          <div className=" w-1/3 md:w-1/2 rotate-90">
            <LottiePlayer />
          </div>
          <button className="z-[100] text-Secondary mt-4 px-4 py-2 lg:px-5 lg:py-3 lg:text-2xl text-xl bg-Primary rounded-full hover:border-2 hover:border-Primary hover:bg-Secondary hover:text-Primary  ">
            <Link href="/register">Register Now</Link>
          </button>
        </div>
      </div>
      <div className="flex flex-1 h-full  ">
        <div className="flex ml-3 w-full md:w-[80%] justify-center text-center md:text-left flex-col">
          <h1 className="font-AbolitionTestRegular font-bold [font-size:_clamp(45px,6vw,100px)] tracking-wider">
            Become a Member
          </h1>
          <p className="mt-5 [font-size:_clamp(20px,3vw,35px)] leading-9 text-xl">
            And get access to our courses free of charge!
          </p>
        </div>
      </div>
    </section>
  );
};

export default GetStarted;
