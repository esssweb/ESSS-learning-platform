"use client";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <div className="mx-auto h-full grid place-items-center ax-w-6xl xl:max-w-4xl 2xl:max-w-6xl rounded-3xl text-Primary px-5 py-2">
      <div className="grid place-items-center gap-7 bg-white border-2 border-Primary p-3 rounded-lg">
        <h2 className="text-xl sm:text-5xl font-SofiaProBold">
          Something went wrong!
        </h2>
        <p className="text-base sm:text-2xl font-SofiaProLight">
          We can't get you the sub-course you're looking for
        </p>
        <button
          onClick={() => reset()}
          className="font-SofiaProBold text-xs sm:text-base text-Secondary bg-Primary hover:bg-Secondary hover:text-Primary p-2 rounded-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default Error;
