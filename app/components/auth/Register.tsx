import Image from "next/image";

const Register = () => {
  return (
    <div className="grid grid-cols-4 min-h-screen min-w-full relative h-screen w-screen">
      <div className="hidden md:col-span-1 bg-Primary md:flex flex-col space-y-4">

        <div className="flex justify-center md:max-w-md">
          <Image
            src={"/assets/images/auth/register.png"}
            alt="learning"
            width={864}
            height={697}
            className="absolute mt-16"
          />
        </div>
        
       
        <div className="flex flex-grow justify-center items-end">
          <Image
            src={"/assets/images/auth/learning.png"}
            alt="logo"
            width={344}
            height={83}
            className=""
          />
        </div>
      </div>

      <div className="md:col-span-3 bg-Tertiary flex flex-col items-center">
        <div className="flex mt-24 lg:mt-36 space-x-2">
          <h1 className="text-Primary font-SofiaProSemiBold text-xl ">
            Register on ESSS
          </h1>
          <Image
            src={"/assets/images/auth/learning-2.png"}
            alt=""
            width={181}
            height={44}
          />
        </div>

        <button className="flex justify-center bg-Primary rounded-full mt-4 w-1/3">
          <h1 className="text-Secondary font-SofiaProSemiBold p-4 text-xs sm:text-base">
            Sign up With Google
          </h1>
        </button>

        <div className="flex justify-center p-2 w-1/4 sm:w-1/3 px-4">
          <div className="flex-grow border-b border-Primary"></div>
          <span className="text-Primary font-SofiaProRegular text-md lg:mt-2">
            or Register with email
          </span>
          <div className="flex-grow border-b border-Primary"></div>
        </div>

        <div className="flex flex-col w-1/3 mt-6 lg:mt-12 space-y-4">
          <label className="text-Primary font-SofiaProSemiBold text-sm">
            Email
          </label>
          <input
            type="text"
            className="border-2 border-gray-300 border-light rounded-md p-2"
          />

          <label className="text-Primary font-SofiaProSemiBold text-sm">
            Password
          </label>
          <input
            type="text"
            className="border-2 border-gray-300 rounded-md p-2"
          />
        </div>

        <button className="flex justify-center bg-Secondary rounded-full mt-8 lg:mt-16 w-1/3">
          <h1 className="text-Primary font-SofiaProSemiBold p-4">Sign In</h1>
        </button>

        <h1 className="text-Primary p-4 font-SofiaProSemiBold text-md">
          Already have an account?
          <span className="font-SofiaProBold"> Sign in !</span>
        </h1>

        <div className="border-b-2 border-light border-gray-300 p-2 mx-8 w-1/2 lg:mt-24"></div>

        <div className="flex flex-col md:w-3/4 items-center ">
          <ul className="font-SofiaProLightItalic text-lg">
            <li className="text-center">Powered By:</li>
            <li className="font-SofiaProUltraLight md:mr-6">
              Ethiopian Space Science Society
            </li>
            <li className="text-center">ⓒ 2023 | ፳፻፲፮</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
