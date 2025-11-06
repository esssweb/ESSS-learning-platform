import clsx from "clsx";

export const SubCourseError = ({ refetch }: { refetch: () => void }) => {
  return (
    <div className="px-2 py-3 xl:py-2 rounded-md col-span-2 lg:col-span-3 min-[1160px]:col-span-4">
      <div className="grid place-items-center gap-7 text-Primary bg-white border-2 border-Primary p-3 rounded-lg">
        <h2 className="sm:text-lg font-SofiaProSemiBold">
          Something went wrong!
        </h2>
        <button
          onClick={() => refetch()}
          className="font-SofiaProBold text-xs sm:text-sm text-Secondary bg-Primary hover:bg-Secondary hover:text-Primary p-2 rounded-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export const ModuleError = ({
  inSidebar,
  isFirst,
  isLast,
  refetch,
}: {
  inSidebar?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  refetch: () => void;
}) => {
  return (
    <div
      className={clsx(
        "bg-Primary flex flex-col justify-center gap-2 items-center",
        {
          "my-3 rounded-lg px-5 py-3": !inSidebar,
          "px-2 py-1": inSidebar,
          "rounded-t-lg mt-3 pt-3": isFirst,
          "rounded-b-lg": isLast,
        },
      )}
    >
      <h4
        className={clsx("text-Secondary font-SofiaProSemiBold  mb-[6px]", {
          "text-lg": inSidebar,
          "text-base": !inSidebar,
        })}
      >
        Something went wrong!
      </h4>
      <button
        onClick={() => refetch()}
        className="font-SofiaProBold text-xs text-Secondary border border-Secondary bg-Primary hover:bg-Secondary hover:text-Primary p-2 rounded-md"
      >
        Try again
      </button>
    </div>
  );
};
