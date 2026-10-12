"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useTranslation } from "./locale-provider";

export function HeroVideo() {
  const t = useTranslation();
  const video = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return (
    <>
      {enabled && (
        <video
          ref={video}
          className="casa-hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero.jpg"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-hidden="true"
        >
          <source
            src="https://frontdoor-assets.r2.getcasa.com/home-hero/casa-hero-web-hevc-7mbps.mp4"
            type={'video/mp4; codecs="hvc1"'}
          />
          <source
            src="https://frontdoor-assets.r2.getcasa.com/home-hero/casa-hero-web-h264-12mbps.mp4"
            type="video/mp4"
          />
        </video>
      )}
      {enabled && (
        <button
          className="video-toggle"
          aria-label={playing ? t("Pauziraj video") : t("Pusti video")}
          onClick={() => {
            if (video.current?.paused)
              video.current.play().catch(() => setPlaying(false));
            else video.current?.pause();
          }}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
      )}
    </>
  );
}
