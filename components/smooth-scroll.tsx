"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose: (() => void) | undefined;

    function setup() {
      dispose?.();
      dispose = undefined;
      if (motion.matches) return;

      const lenis = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        lerp: 0.12,
        syncTouch: false,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        prevent: (node) =>
          node.tagName === "DIALOG" ||
          node.tagName === "TEXTAREA" ||
          node.tagName === "SELECT" ||
          node.isContentEditable,
      });
      const pendingFrames = new Set<number>();

      function syncLock() {
        const locked =
          Boolean(document.querySelector("dialog[open]")) ||
          ["hidden", "clip"].includes(
            getComputedStyle(document.body).overflowY,
          );
        if (locked && !lenis.isStopped) lenis.stop();
        else if (!locked && lenis.isStopped) lenis.start();
      }

      // Club and navigation dialogs must keep native scrolling inside the modal.
      const observer = new MutationObserver(syncLock);
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["open", "style"],
      });
      syncLock();

      function scrollToAnchor(event: MouseEvent) {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const anchor =
          event.target instanceof Element
            ? event.target.closest<HTMLAnchorElement>("a[href]")
            : null;
        if (
          !anchor ||
          anchor.hasAttribute("download") ||
          (anchor.target && anchor.target !== "_self")
        )
          return;

        const url = new URL(anchor.href);
        if (
          url.origin !== location.origin ||
          url.pathname !== location.pathname ||
          url.search !== location.search ||
          !url.hash
        )
          return;
        let id: string;
        try {
          id = decodeURIComponent(url.hash.slice(1));
        } catch {
          return;
        }
        const target = document.getElementById(id);
        if (!target || target.closest("dialog")) return;

        // Prevent the native/Next scroll from competing with this animation,
        // while allowing React click handlers (including menu close) to run.
        event.preventDefault();
        if (location.hash !== url.hash) history.pushState(null, "", url.hash);
        const frame = requestAnimationFrame(() => {
          pendingFrames.delete(frame);
          syncLock();
          lenis.scrollTo(target, {
            lerp: 0,
            duration: 0.85,
            onComplete: () => {
              if (!target.isConnected) return;
              const hadTabIndex = target.hasAttribute("tabindex");
              if (!hadTabIndex) target.setAttribute("tabindex", "-1");
              target.focus({ preventScroll: true });
              if (!hadTabIndex)
                target.addEventListener(
                  "blur",
                  () => target.removeAttribute("tabindex"),
                  { once: true },
                );
            },
          });
        });
        pendingFrames.add(frame);
      }

      document.addEventListener("click", scrollToAnchor, true);
      // Let browser history restore its position without an old animation
      // pulling the page back to the previous anchor.
      const stopInertia = () => lenis.scrollTo(window.scrollY, { immediate: true });
      window.addEventListener("popstate", stopInertia);
      dispose = () => {
        document.removeEventListener("click", scrollToAnchor, true);
        window.removeEventListener("popstate", stopInertia);
        observer.disconnect();
        pendingFrames.forEach(cancelAnimationFrame);
        lenis.destroy();
      };
    }

    setup();
    motion.addEventListener("change", setup);
    return () => {
      motion.removeEventListener("change", setup);
      dispose?.();
    };
  }, [pathname]);

  return null;
}
