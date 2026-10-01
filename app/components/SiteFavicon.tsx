"use client";

import { useEffect } from "react";

type Settings = {
  logo?: string;
  favicon?: string;
};

export default function SiteFavicon() {
  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/site-settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return await response.json() as { settings?: Settings };
      })
      .then((data) => {
        if (cancelled) return;

        const url = data?.settings?.favicon || data?.settings?.logo;
        if (!url) return;

        document
          .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
          .forEach((element) => element.remove());

        const icon = document.createElement("link");
        icon.rel = "icon";
        icon.href = url;
        document.head.appendChild(icon);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
