"use client";

import Image from "next/image";
import { useState } from "react";
import { useRegisterUserMutation } from "@/store/api/auth";
import { registerRequest } from "@/types/auth/type";
import { Input } from "@/components/ui/input";

const Register = () => {
  const [formData, setFormData] = useState<registerRequest>({
    email: "",
    password: "",
  });
  const [registerUser, { data, error, isLoading }] = useRegisterUserMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const register = await registerUser(formData).unwrap();
      console.log("Registeration sucessful", register);
    } catch (error) {
      console.log("Registeration failed", error);
    }
  };

  return (
    <div className="grid grid-cols md:grid-cols-4 min-h-screen min-w-full relative h-screen w-screen">
      <div className="hidden md:col-span-1 bg-Primary md:flex flex-col space-y-4">
        <div className="flex justify-center md:max-w-md">
          <Image
            src={"/assets/images/auth/register.png"}
            alt="learning"
            width={764}
            height={697}
            className="absolute mt-6"
          />
        </div>

        <div className="flex flex-grow justify-center items-end p-2">
          <Image
            src={"/assets/images/auth/learning.png"}
            alt="logo"
            width={300}
            height={83}
            className=""
          />
        </div>
      </div>

      <div className="md:col-span-3 bg-Tertiary flex flex-col items-center">
        <div className="flex mt-16 lg:mt-28 space-x-2">
          <h1 className="text-Primary font-SofiaProSemiBold text-xl mt-2">
            Register on ESSS
          </h1>
          <Image
            src={"/assets/images/auth/learning-2.png"}
            alt=""
            width={181}
            height={44}
          />
        </div>

        <button className="flex justify-center bg-Primary rounded-full mt-4 w-1/2 md:w-1/3">
          <h1 className="text-Secondary font-SofiaProSemiBold p-4 text-xs sm:text-base">
            Sign up With Google
          </h1>
        </button>

        <div className="flex items-center justify-center p-2 w-1/2 sm:w-1/3 px-4 mt-2">
          <div className="flex-grow border-b border-Primary"></div>
          <span className="text-Primary font-SofiaProRegular text-md mx-4 whitespace-nowrap">
            or Register with email
          </span>
          <div className="flex-grow border-b border-Primary"></div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full md:w-1/3 mt-6 px-6 md:px-0"
        >
          <label className="text-Primary font-SofiaProSemiBold text-sm">
            Email
          </label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border-2 border-gray-300 rounded-md p-2 my-2"
          />

          <label className="text-Primary font-SofiaProSemiBold text-sm">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border-2 border-gray-300 rounded-md my-2 p-2"
          />

          <button
            type="submit"
            className="flex justify-center bg-Secondary rounded-full w-1/2 md:w-full mt-12"
            disabled={isLoading}
          >
            <h1 className="text-Primary font-SofiaProSemiBold p-4">
              {isLoading ? "Signing In..." : "Sign up"}
            </h1>
          </button>
        </form>

        <h1 className="text-Primary p-4 font-SofiaProSemiBold text-md">
          Already have an account?
          <span className="font-SofiaProBold"> Sign in !</span>
        </h1>

        <div className="border-b-2 border-light border-gray-300 p-2 mx-8 w-1/2 mt-16 lg:mt-16"></div>

        <div className="flex flex-col md:w-3/4 items-center mt-2">
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
