import MentorCard from "./MentorCard";
import { mentors } from "./dummyData";
import styles from "./home_page.module.css";

const MentorSection = () => {
  return (
    <div className="flex flex-col justify-end h-[80vh] min-h-[700px]">
      <h1 className="font-AbolitionTestRegular text-center underline [font-size:_clamp(45px,5vw,100px)] tracking-wider">
        Meet Your Mentors
      </h1>
      <div
        className={`overflow-x-auto h-[70%] mt-5 grid grid-flow-col items-center ${styles.scrollbar_hide}`}
      >
        {mentors.map((card, index) => (
          <MentorCard
            key={index}
            title={card.title}
            imageUrl={card.imageUrl}
            background={card.background_color}
          />
        ))}
      </div>
    </div>
  );
};

export default MentorSection;
