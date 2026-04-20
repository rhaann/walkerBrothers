"use client";

import { useTheme } from "@/lib/theme";

export default function ThemeLogo() {
  const { theme } = useTheme();
  return (
    <img
      src={theme === "light" ? "/logoDark.svg" : "/logoLight.svg"}
      alt="actual insight logo"
      className="h-8 w-auto"
    />
  );
}
