import Image from "next/image";

interface CardProps {
  background: string;
  imageUrl: string;
  title: string;
}

const MentorCard = ({ title, background, imageUrl }: CardProps) => {
  return (
    <div
      className="relative flex justify-end min-w-[8rem] bg-Primary h-full hover:w-[35rem] mx-4 transition-all rounded-3xl"
      style={{ backgroundColor: `(${background})` }}
    >
      <div className="flex  h-full">
        <Image
          src={imageUrl}
          width={600}
          height={600}
          className="h-full object-cover  "
          alt="logo"
        />
      </div>
    </div>
  );
};

export default MentorCard;
