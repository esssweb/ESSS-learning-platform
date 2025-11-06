import Link from "next/link";

const NotFound = () => {
  return (
    <div className="bg-[url('/assets/images/not-found-bg.jpg')] bg-no-repeat bg-cover text-white w-full min-h-screen">
      <div className="w-full h-screen flex flex-col justify-center items-center gap-7 backdrop-blur-[1px]">
        <h1 className="text-9xl">404</h1>

        <p className="text-3xl">Oops! you're lost in space</p>

        <Link
          href="/"
          className="p-2 rounded-lg hover:bg-Primary font-SofiaProSemiBold hover:text-Secondary bg-Secondary text-Primary"
        >
          Go To Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
