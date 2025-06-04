import Image from "next/image";
import Link from "next/link";

import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaTelegram,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="text-Secondary bg-Primary py-4">
      <div className=" mx-auto px-4 lg:px-0">
        <div className="flex flex-col md:flex-row justify-between">
          {/* About ESSS */}
          <div className="w-full md:mb-0">
            <Image
              src="/assets/images/footer/esss-learning.png"
              alt="Logo"
              width={290}
              height={190}
              className="flex items-center md:items-start xl:justify-between p-2 xl:mr-48 2xl:mr-80"
            />

            <div className="hidden text-sm items-left font-SofiaProExtraLight p-2 sm:flex md:text-sm lg:text-base lg:mx-4 xl:text-lg xl:p-4 2xl:text-xl 3xl:text-2xl max-w-[800px] 2xl:ml-40 3xl:ml-90">
              <p>
                Learning a new initiative by the Ethiopian Space Science Society
                (ESSS), dedicated to making space science and technology
                education accessible to everyone. At ESSS, we're passionate
                about exploring the mysteries of the cosmos and sharing that
                knowledge with the world.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-row px-2 justify-center md:justify-center gap-4 font-SofiaProRegular lg:ml-24 md:mr-6 xl:mr-6 xl:p-4 xl:text-xl 2xl:text-2xl 3xl:text-4xl 2xl:mr-48 3xl:mr-90">
            <div className="flex flex-col items-center sm:px-2 justify-center md:px-4 text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl">
              <ul>
                <li className="py-2 whitespace-nowrap">Home</li>
                <li className="py-2 whitespace-nowrap">Courses</li>
                <li className="py-2 whitespace-nowrap">About</li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center sm:px-4 md:px-4 text-xs md:text-sm lg:text-base">
              <ul>
                <li className="py-2 whitespace-nowrap">ESSS Main Page</li>
                <li className="py-2 whitespace-nowrap">About ESSS</li>
                <li className="py-2 whitespace-nowrap">Membership</li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center sm:px-4 md:px-4 text-xs md:text-sm lg:text-base">
              <ul>
                <li className="py-2 whitespace-nowrap">ESSS Science</li>
                <li className="py-2 whitespace-nowrap">Working Groups</li>
                <li className="py-2 whitespace-nowrap">ESSS Branches</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-light border-Secondary p-2 mx-8"></div>

        <div className="flex flex-col md:flex-row ">
          <div className="flex flex-col md:w-3/4 justify-between items-center md:items-end md:mr-48 2xl:mr-80 text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl 3xl:text-2xl">
            <ul className="font-SofiaProLightItalic text-lg">
              <li className="text-center">Powered By:</li>
              <li className="font-SofiaProUltraLight md:mr-6">
                Ethiopian Space Science Society
              </li>
              <li className="text-center">ⓒ 2023 | ፳፻፲፮</li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="flex flex-col md:w-1/4 md:items-end items-center md:mt-6">
            <div className="flex items-end justify-ceneter SofiaProRegular md:mr-6">
              @officialess
            </div>
            <div className="flex gap-1 md:px-6  justy-between items-center">
              <Link href="https://www.facebook.com/officialesss">
                <FaFacebook size={15} />
              </Link>
              <Link href="https://www.instagram.com/officialesss/">
                <FaInstagram size={15} />
              </Link>
              <Link href="https://www.youtube.com/c/EthiopianSpaceScienceSociety">
                <FaYoutube size={15} />
              </Link>
              <Link href="https://t.me/officialesss">
                <FaTelegram size={15} />
              </Link>
              <Link href="https://twitter.com/officialesss">
                <FaXTwitter size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
