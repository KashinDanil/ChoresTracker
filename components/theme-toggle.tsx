"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const themes = ["system", "light", "dark"] as const;

const icons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycle = () => {
    const currentIdx = themes.indexOf(theme as (typeof themes)[number]);
    const next = themes[(currentIdx + 1) % themes.length];
    setTheme(next);
  };

  const Icon = mounted ? icons[(theme as keyof typeof icons) ?? "system"] : Monitor;

  return (
    <Button variant="ghost" size="icon" onClick={cycle} aria-label="Toggle theme">
      <Icon className="size-4" />
    </Button>
  );
}
