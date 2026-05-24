import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [key, setKey] = useState(location.pathname);

  useEffect(() => {
    setKey(location.pathname);
  }, [location.pathname]);

  return (
    <div
      key={key}
      className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
    >
      {children}
    </div>
  );
}
