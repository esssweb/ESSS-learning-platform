import Image from "next/image";

export default function MissionVisionValues() {
  return (
    <div className="relative flex flex-col text-2xl font-SofiaProSemiBold text-Primary bg-Tertiary pb-5">
      {/* Mission Section */}
      <div className="hidden lg:flex flex-row lg:items-center">
        {/* Large screen */}
        <Image
          src="/assets/images/about/mission.svg"
          width={450}
          height={450}
          alt="mission"
          className="md:ml-20 mx-auto"
        />
        <div className="mission-text w-full md:w-1/2">
          <p className="text-center px-10 max-w-4xl mx-auto md:text-left md:mx-0">
            Democratizing space science and technology education. We are committed
            to making the wonders of the cosmos accessible to all, inspiring the
            next generation of astronomers, astrophysicists, and space
            enthusiasts. We strive to provide high-quality educational resources,
            foster inclusivity, and ignite curiosity about the universe.
          </p>
        </div>
      </div>
      {/* Small screen */}
      <div className="mission flex flex-col lg:flex-row lg:items-center lg:hidden">
        <div className="mission-image relative order-first lg:order-none mb-10 lg:mb-0 self-center">
          <Image
            src="/assets/images/about/mission.svg"
            alt="mission"
            // layout="responsive"
            width={350}
            height={350}
          />
        </div>
        <div className="mission-text w-full lg:w-1/2">
          <p className="text-center px-10 max-w-4xl">
            Democratizing space science and technology education. We are committed
            to making the wonders of the cosmos accessible to all, inspiring the
            next generation of astronomers, astrophysicists, and space
            enthusiasts. We strive to provide high-quality educational resources,
            foster inclusivity, and ignite curiosity about the universe.
          </p>
        </div>
      </div>

      {/* Vision Section */}
      <div className="vision flex flex-col lg:flex-row lg:items-start">
        {/* Large screen */}
        <p className="hidden lg:block min-w-2xl max-w-4xl text-center mt-36 pl-20 lg:mt-0 lg:ml-10 lg:text-left lg:mr-18">
          A world where space science is a source of inspiration and knowledge for
          everyone, regardless of their background. We envision 'Learning' as a
          global hub for space science education, where learners of all ages can
          explore the universe, share their discoveries, and become part of a
          thriving space science community.
        </p>
        <Image
          src="assets/images/about/vision.svg"
          width={450}
          height={450}
          alt="vision"
          className="hidden lg:block mr-20 mx-auto"
        />
        {/* Small screen */}
        <div className="vision-image lg:hidden self-center">
          <Image
            src="/assets/images/about/vision.svg"
            alt="vision"
            // layout="responsive"
            width={350}
            height={350}
          />
        </div>
        <div className="vision-text w-full lg:hidden">
          <p className="text-center px-10 max-w-4xl mx-auto">
            A world where space science is a source of inspiration and knowledge
            for everyone, regardless of their background. We envision 'Learning' as
            a global hub for space science education, where learners of all ages
            can explore the universe, share their discoveries, and become part of
            a thriving space science community.
          </p>
        </div>
      </div>

      {/* Values Section */}
      {/* Large screen */}
      <div className="hidden lg:flex flex-col mt-60">
        <div className="flex justify-center space-x-32 mb-14">
          <p className="max-w-lg text-center rotate-1">
            <span className="bg-Primary rounded-full px-2 text-Secondary">
              Quality:
            </span>{" "}
            We are dedicated to providing top-quality education content and
            resources, supported by experts in the field.
          </p>
          <Image
            src="/assets/images/about/values.svg"
            width={450}
            height={450}
            className="absolute left-1/3 bottom-56 -translate-x-1/2"
            alt="values"
          />
          <p className="max-w-xl text-center">
            <span className="bg-Primary rounded-full px-2 text-Secondary">
              Accessibility:
            </span>{" "}
            We believe in breaking down barriers to space science education,
            ensuring that no one is left behind in the quest for knowledge.
          </p>
        </div>
        <div className="flex justify-center">
          <p className="max-w-2xl text-center -rotate-1">
            <span className="bg-Primary rounded-full px-2 text-Secondary">
              Collaboration:
            </span>{" "}
            We believe in the power of collaboration, partnering with
            like-minded organizations and experts to expand the reach and impact
            of space science education.
          </p>
          <p className="max-w-lg text-center pl-10 pt-5 rotate-1">
            <span className="bg-Primary rounded-full px-2 text-Secondary">
              Integrity:
            </span>{" "}
            We uphold the highest standards of integrity, ensuring that our
            content is accurate, reliable, and aligns with scientific principles.
          </p>
        </div>
      </div>
      {/* Small screen */}
      <div className="values flex flex-col lg:hidden">
        {/* Each value item */}
        <div className="value flex flex-col items-center text-center mb-10">
          <div className="value-image mb-4">
            <Image
              src="/assets/images/about/values.svg"
              alt="values"
              width={350}
              height={350}
            />
          </div>
          <p className="text-center max-w-lg">
            <span className="bg-Primary rounded-full px-2 text-Secondary">
              Quality:
            </span>{" "}
            We are dedicated to providing top-quality education content and
            resources, supported by experts in the field.
          </p>
        </div>
        <div className="value flex flex-col items-center text-center mb-10">
          <p className="text-center max-w-xl">
            <span className="bg-Primary rounded-full px-2 text-Secondary">
              Accessibility:
            </span>{" "}
            We believe in breaking down barriers to space science education,
            ensuring that no one is left behind in the quest for knowledge.
          </p>
        </div>
        <div className="value flex flex-col items-center text-center mb-10">
          <p className="text-center max-w-2xl">
            <span className="bg-Primary rounded-full px-2 text-Secondary">
              Collaboration:
            </span>{" "}
            We believe in the power of collaboration, partnering with
            like-minded organizations and experts to expand the reach and impact
            of space science education.
          </p>
        </div>
        <div className="value flex flex-col items-center text-center">
          <p className="text-center max-w-2xl">
            <span className="bg-Primary rounded-full px-2 text-Secondary">
              Integrity:
            </span>{" "}
            We uphold the highest standards of integrity, ensuring that our
            content is accurate, reliable, and aligns with scientific principles.
          </p>
        </div>
      </div>
    </div>
  );
}