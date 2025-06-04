"use client"
import Image from 'next/image';
import React from 'react';
import ProgressBar from '../components/courses/ProgressBar';
import CoursesBar from '../components/courses/CoursesBar';
import Pagination from '../components/explore/dynamic-explore/Pagination';

const Courses = () => {
  return (
    <div>
        <CoursesBar/>
      <div className='ml-[113px] mt-[57px] mb-[26px]'>
        <h1 className='font-SofiaProMedium text-4xl '>Your Courses</h1>
      </div>
      <div className='flex justify-center items-center mb-10'>
        <div className="max-w-[320px] px-3 sm:min-w-[480px] md:min-w-[640px] lg:min-w-[1020px] xl:min-w-[1390px] pt-6 pb-4 border-2 rounded-[50px] shadow-lg">
          <div className="flex px-5 items-center content-center flex-col sm:flex-col md:flex-col lg:flex-row">
            {/*Course Image */}
            <div className="h-[280px] w-[285px] rounded-4xl overflow-hidden sm:w-[400px] md:h-[500px] md:w-[520px] lg:w-[240px] lg:h-[240px] relative">
              <Image
                src="/assets/images/courses/course1.png"
                alt="Description of the image"
                layout="fill"
                objectFit="cover"
                className="rounded-3xl pb-2"
              />
            </div>
            <div className="flex flex-col ml-20 sm:ml-12 flex-grow">
              <h3 className="text-[34px] content-center items-center font-SofiaProMedium mb-2 md:text-6xl">Space Weather</h3>
              <ProgressBar progress={36} />
              <h3 className="text-3xl font-SofiaProMedium mb-4">Your Progress</h3>
              {/* Button */}
              <button className="sm:ml-auto right-0 bg-Primary text-Secondary font-SofiaProSemiBold py-5 px-28 mt-1 rounded-3xl mr-20 transition duration-300 ease-in-out hover:bg-Secondary hover:text-Primary hover:shadow-md ">
                Resume
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='flex justify-center items-center mb-10'>
        <div className="max-w-[320px] px-3 sm:min-w-[480px] md:min-w-[640px] lg:min-w-[1020px] xl:min-w-[1390px] pt-6 pb-4 border-2 rounded-[50px] shadow-lg">
          <div className="flex px-5 items-center content-center flex-col sm:flex-col md:flex-col lg:flex-row">
            <div className="h-[280px] w-[285px] rounded-4xl overflow-hidden sm:w-[400px] md:h-[500px] md:w-[520px] lg:w-[240px] lg:h-[240px] relative">
              {/*Course Image */}
              <Image
                  src="/assets/images/courses/course2.png"
                  alt="Description of the image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-3xl pb-2"
              />
            </div>
            <div className="flex flex-col ml-20 sm:ml-12 flex-grow">
              <h3 className="text-[34px] content-center items-center font-SofiaProMedium mb-2 md:text-6xl">Aerospace Eng.</h3>
              <ProgressBar progress={72} />
              <h3 className="text-3xl font-SofiaProMedium mb-4">Your Progress</h3>
              {/* Button */}
              <button className="sm:ml-auto right-0 bg-Primary text-Secondary font-SofiaProSemiBold py-5 px-28 mt-1 rounded-3xl mr-20 transition duration-300 ease-in-out hover:bg-Secondary hover:text-Primary hover:shadow-md ">
                Resume
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='flex items-center mt-24 mb-60 justify-center'>
        <Pagination totalPages={3}/>
      </div>    
    </div>
  );
}
export default Courses;
