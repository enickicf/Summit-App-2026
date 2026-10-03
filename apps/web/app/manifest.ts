import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Not Alone Summit",
    short_name: "Not Alone",
    description: "The public website for the Not Alone Summit and Awards.",
    start_url: "/",
    display: "browser",
    background_color: "#fff9f1",
    theme_color: "#8177c9",
    icons: [
      { src: "/icons/challenge-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/challenge-512.png", sizes: "512x512", type: "image/png", purpose: "any" }
    ]
  };
}
