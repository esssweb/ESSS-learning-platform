import Image from "next/image";

const Hero = ({ level }: { level: string }) => {
  const imageUrl = `/assets/images/explore/level/${level}.png`;

  return (
    <section className="relative">
      {" "}
      {/* no mt-* here = no white gap */}
      <div className='bg-[url("/assets/images/explore/level/hero_background.png")] relative overflow-hidden bg-cover bg-center'>
        {/* Hero image */}
        <Image
          src={imageUrl}
          alt={`Image for ${level}`}
          width={1932}
          height={489}
          className="w-full h-auto block" /* block prevents inline-image whitespace */
          priority
        />

        {/* Overlay: reserve space at the top equal to navbar height so text never goes under it */}
        <div className="absolute inset-0 z-10">
          <div
            className="
              h-full flex items-end justify-end
              pr-4 md:pr-16
              pb-3 md:pb-9
              pt-[64px]           /* base nav height ~64px */
              min-[360px]:pt-[68px]
              sm:pt-[72px]
              md:pt-[80px]
            "
          >
            <div className="text-left">
              <h2
                className="
                  font-SofiaProSemiBold text-Secondary
                  pt-0 md:pt-0
                  text-[26px]
                  min-[360px]:text-[30px]
                  min-[414px]:text-[34px]
                  min-[480px]:text-[38px]
                  sm:text-[48px]
                  md:text-[64px]
                  lg:text-[72px]
                  xl:text-[84px]
                  2xl:text-[96px]
                "
              >
                {level}
              </h2>

              <h3
                className="
                  font-SofiaProMedium text-Secondary
                  text-[14px]
                  min-[360px]:text-[16px]
                  min-[414px]:text-[18px]
                  min-[480px]:text-[20px]
                  sm:text-[22px]
                  md:text-[28px]
                  lg:text-[30px]
                  xl:text-[32px]
                "
              >
                Explore our {level} courses
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
