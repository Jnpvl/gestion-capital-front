"use client";

import { useEffect, useRef } from "react";

const PREVIEW_SECOND = 1;

interface AboutVideoProps {
  src: string;
}

export function AboutVideo({ src }: AboutVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function showPreviewFrame() {
      const el = videoRef.current;
      if (!el || hasStartedRef.current) return;
      el.pause();
      el.currentTime = PREVIEW_SECOND;
    }

    video.addEventListener("loadedmetadata", showPreviewFrame);

    return () => {
      video.removeEventListener("loadedmetadata", showPreviewFrame);
    };
  }, []);

  function handlePlay() {
    const video = videoRef.current;
    if (!video || hasStartedRef.current) return;

    hasStartedRef.current = true;
    video.pause();
    video.currentTime = 0;
    void video.play();
  }

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover"
      controls
      playsInline
      preload="auto"
      onPlay={handlePlay}
    >
      <source src={src} type="video/mp4" />
      Tu navegador no puede reproducir este video.
    </video>
  );
}
