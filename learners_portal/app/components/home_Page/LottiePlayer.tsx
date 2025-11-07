"use client";
import Lottie from "lottie-react";
import animatedArrow from "@/public/assets/animations/home_Page/arrow.json";

const LottiePlayer = () => {
  return (
    <>
      <Lottie animationData={animatedArrow} loop={true} />
    </>
  );
};

export default LottiePlayer;
