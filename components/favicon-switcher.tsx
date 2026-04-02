"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const lightIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#e8e8e8"/>
  <g transform="translate(4,4)" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/>
    <path d="m3 7 2 2 4-4"/><path d="m3 17 2 2 4-4"/>
  </g>
</svg>`;

const darkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#1a1a1a"/>
  <g transform="translate(4,4)" fill="none" stroke="#e8e8e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/>
    <path d="m3 7 2 2 4-4"/><path d="m3 17 2 2 4-4"/>
  </g>
</svg>`;

export function FaviconSwitcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const svg = resolvedTheme === "dark" ? darkIcon : lightIcon;
    const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = url;
  }, [resolvedTheme]);

  return null;
}
