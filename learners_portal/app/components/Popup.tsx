import { FaCircleExclamation } from "react-icons/fa6";
import clsx from "clsx";

const Popup = ({
  isSeen,
  popupMessage,
}: {
  isSeen: boolean;
  popupMessage: string;
}) => {
  return (
    <div
      className={clsx(
        "fixed top-3 -right-96 flex items-center justify-center gap-3 text-Secondary bg-Primary rounded-[7px] py-2 border border-Primary px-4 font-SofiaProRegular",
        {
          hidden: !isSeen,
          "animate-[popupin_1s_ease-in-out_forwards]": isSeen,
        },
      )}
    >
      <FaCircleExclamation size={25} />
      <p>{popupMessage}</p>
    </div>
  );
};

export default Popup;
