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
    <div className=" space-x-4 shadow-lg rounded-2xl max-w-[580px] min-h-[500px] ">
      <Image
        className="rounded-2xl"
        src={cardimageUrl}
        width={580}
        height={437}
        alt="card image"
      />
      <div className="py-5">
        <h2 className=" font-SofiaProMedium text-Primary text-5xl mb-1 ">
          {title}
        </h2>

        <p className="font-SofiaProLight text-xl text-Quinary mb-7 pr-1">
          {description}
        </p>
        <button className="font-SofiaProMedium bg-Secondary text-2xl font text-center text-Primary py-[10px] px-[15px] border-solid border-[1px] border-Primary rounded-lg">
          Enroll for Free
        </button>
      </div>
    </div>
  );
};

export default Card;
