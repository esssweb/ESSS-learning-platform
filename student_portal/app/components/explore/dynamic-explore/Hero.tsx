import Image from "next/image";

const Hero = ({ level }: { level: string }) => {
  const imageUrl = `/assets/images/explore/level/${level}.png`;

  return (
    <section className="relative">
      <div
        className={`bg-[url("/assets/images/explore/level/hero_background.png")] relative overflow-hidden bg-cover bg-center`}
      >
        <Image
          src={imageUrl}
          alt={`Image for ${level}`}
          width={1932}
          height={489}
        />

        <div className="absolute bottom-0 right-0 pr-4 md:pr-16">
          <h2 className="font-SofiaProSemiBold text-Secondary text-2xl md:text-[10vw] min-[500px]:text-5xl sm:text-6xl text-left pt-16 md:pt-24">
            {level}
          </h2>
          <h3 className="font-SofiaProMedium text-Secondary text-base md:text-[4vw] min-[500px]:text-2xl sm:text-3xl text-left pb-3 md:pb-9 md:mt-5">
            Explore our {level} courses
          </h3>
        </div>
      </div>
    </section>
  );
};

export default Hero;
