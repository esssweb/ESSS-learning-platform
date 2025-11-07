import Image from "next/image";

const Card = ({
  image,
  title,
  description,
}: {
  image: string;
  title: string;
  description: string;
}) => {
  const cardimageUrl = "/assets/images/explore/level/card.jpg";

  return (
    <div
      className="
        bg-white shadow-lg rounded-2xl border border-black/5 overflow-hidden

        /* width ladder (smaller → larger) */
        max-w-[220px]
        min-[320px]:max-w-[240px]
        min-[360px]:max-w-[260px]
        min-[414px]:max-w-[280px]
        min-[480px]:max-w-[320px]
        sm:max-w-[380px]
        md:max-w-[420px]
        lg:max-w-[460px]
        xl:max-w-[500px]
        2xl:max-w-[540px]

        /* height ladder (smaller → larger) */
        min-h-[300px]
        min-[320px]:min-h-[320px]
        min-[360px]:min-h-[340px]
        min-[414px]:min-h-[360px]
        min-[480px]:min-h-[380px]
        sm:min-h-[400px]
        md:min-h-[420px]
        lg:min-h-[440px]
        xl:min-h-[460px]
        2xl:min-h-[480px]
      "
    >
      <Image
        className="rounded-2xl w-full h-auto"
        src={cardimageUrl}
        width={580}
        height={437}
        alt={`${title} card image`}
        priority={false}
      />

      <div className="px-3 min-[360px]:px-4 md:px-5 py-3 min-[360px]:py-4 md:py-5">
        <h2
          className="
            font-SofiaProMedium text-Primary mb-1
            text-[18px]
            min-[320px]:text-[19px]
            min-[360px]:text-[20px]
            min-[414px]:text-[22px]
            min-[480px]:text-[24px]
            sm:text-[26px]
            md:text-[28px]
            lg:text-[30px]
            xl:text-[32px]
            2xl:text-[34px]
          "
        >
          {title}
        </h2>

        <p
          className="
            font-SofiaProLight text-Quinary mb-6 pr-1 leading-snug sm:leading-normal
            text-[12px]
            min-[320px]:text-[13px]
            min-[360px]:text-[14px]
            min-[414px]:text-[14.5px]
            min-[480px]:text-[15px]
            sm:text-[16px]
          "
        >
          {description}
        </p>

        <button
          className="
            font-SofiaProMedium bg-Secondary text-Primary
            border border-Primary rounded-lg
            text-[13px]
            min-[360px]:text-[14px]
            min-[414px]:text-[15px]
            min-[480px]:text-[16px]
            sm:text-[18px]
            py-[7px] px-[10px]
            min-[360px]:py-[8px] min-[360px]:px-[12px]
            min-[414px]:py-[9px] min-[414px]:px-[14px]
            sm:py-[10px] sm:px-[16px]
          "
        >
          Enroll for Free
        </button>
      </div>
    </div>
  );
};

export default Card;
