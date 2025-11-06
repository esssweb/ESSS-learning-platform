"use client";

import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player/youtube"), {
  ssr: false,
});

const VideoPlayer = ({ vidLink }: { vidLink: string }) => {
  return (
    <ReactPlayer
      url={vidLink}
      controls
      width="100%"
      height="100%"
      className="rounded-3xl overflow-hidden"
    />
  );
};

export default VideoPlayer;
