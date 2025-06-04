import Image from "next/image";

const GetCertified = () => {
  return (
    <section className="flex mt-5 justify-center item-center h-[50vh] lg:min-h-[500px] md:h-[60vh]">
      <div className="bg-Primary rounded-xl h-[90%] w-[90%] flex flex-col md:flex-row">
        <div className="flex  h-1/4 md:h-full b md:w-1/2  items-center justify-center flex-1">
          <div className="uppercase  text-Secondary gap-2 md:gap-0 flex justify-center md:justify-start md:items-start md:flex-col tracking-widest md:tracking-wider font-AbolitionTestRegular leading-none [font-size:_clamp(45px,6vw,100px)] w-2/3">
            <h1>Get</h1>
            <h1>Certified</h1>
            <span className="font-SofiaProLightItalic text-lg lg:text-2xl my-5 normal-case tracking-normal hidden md:block">
              Take our comprehensive courses and get certified upon completion.
            </span>
          </div>
        </div>
        <div className="relative  md:w-1/2 h-3/4 md:h-full flex justify-center items-center">
          <Image
            src="/assets/images/home_page/group_108@2x.png"
            fill
            className="object-contain"
            alt="logo"
          />
        </div>
      </div>
    </section>
  );
};

export default GetCertified;
