import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [key, setKey] = useState(location.pathname);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setKey(location.pathname);
  }, [location.pathname]);

  return (
    <div
      key={key}
      className={
        reducedMotion
          ? "animate-in fade-in duration-150"
          : "animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
      }
    >
      {children}
    </div>
  );
}
