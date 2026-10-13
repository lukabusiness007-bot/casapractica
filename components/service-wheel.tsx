"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import type { Service } from "@/lib/catalog";
import { useLocale, useTranslation } from "./locale-provider";
import Link from "./localized-link";

export function ServiceWheel({ services }: { services: Service[] }) {
  const t = useTranslation();
  const locale = useLocale();
  const windowRef = useRef<HTMLDivElement>(null);
  const manuallyPaused = useRef(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const viewport = windowRef.current;
    if (!viewport || paused || reducedMotion) return;
    let frame = 0;
    let previous = 0;
    let direction = 1;
    let position = viewport.scrollTop;
    const animate = (now: number) => {
      // Stop before the browser applies a wheel/touch scroll, without waiting
      // for React's effect cleanup to prevent one last frame overwriting it.
      if (manuallyPaused.current) return;
      const max = viewport.scrollHeight - viewport.clientHeight;
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      position = Math.max(
        0,
        Math.min(max, position + direction * elapsed * 0.022),
      );
      viewport.scrollTop = position;
      if (position >= max) direction = -1;
      else if (position <= 0) direction = 1;
      frame = requestAnimationFrame(animate);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (entry.isIntersecting) frame = requestAnimationFrame(animate);
    });
    visibility.observe(viewport);
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
    };
  }, [paused, reducedMotion, services.length]);

  function pause() {
    manuallyPaused.current = true;
    setPaused(true);
  }

  function toggleMotion() {
    manuallyPaused.current = !paused;
    setPaused(!paused);
  }

  if (!services.length) return null;
  return (
    <div className="task-wheel">
      <span>{t("Možete li da rešite")}</span>
      <div className="task-wheel-controls">
        <div
          ref={windowRef}
          className="task-wheel-window"
          data-lenis-prevent
          role="region"
          aria-label={t("Naše usluge")}
          tabIndex={0}
          onWheel={pause}
          onTouchStart={pause}
          onPointerDown={pause}
          onFocusCapture={pause}
        >
          <div className="task-wheel-list">
            {services.map((service) => (
              <Link href={`/usluge/${service.slug}`} key={service.id}>
                {t(service.name).toLocaleLowerCase(locale)}
                <ArrowUpRight size={26} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
        <small className="task-wheel-hint">{t("Listajte gore ili dole")}</small>
        {!reducedMotion && (
          <button
            className="task-wheel-toggle"
            onClick={toggleMotion}
            aria-label={
              paused
                ? t("Pokrenite listu usluga")
                : t("Zaustavite listu usluga")
            }
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            {paused
              ? t("Pokrenite listu usluga")
              : t("Zaustavite listu usluga")}
          </button>
        )}
      </div>
    </div>
  );
}
