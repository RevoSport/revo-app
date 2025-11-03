import { useEffect, useState } from "react";

const detectDeviceMode = () => {
  const override = localStorage.getItem("forceMode");
  if (override === "mobile" || override === "desktop") return override;

  const narrow = window.matchMedia("(max-width: 820px)").matches;
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return narrow && touch ? "mobile" : "desktop";
};

export function useDeviceMode() {
  const [mode, setMode] = useState(detectDeviceMode());

  useEffect(() => {
    const handler = () => setMode(detectDeviceMode());
    const mq = window.matchMedia("(max-width: 820px)");
    mq.addEventListener?.("change", handler);
    window.addEventListener("resize", handler);
    return () => {
      mq.removeEventListener?.("change", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  return {
    mode,
    setMode: (m) => {
      localStorage.setItem("forceMode", m);
      setMode(m);
    },
  };
}
