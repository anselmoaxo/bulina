import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bulinha - bula resumida",
    short_name: "Bulinha",
    description: "Consulte para que serve um remédio e seus efeitos colaterais, em linguagem simples.",
    start_url: "/",
    display: "standalone",
    lang: "pt-BR",
    background_color: "#f4f5f7",
    theme_color: "#2b3fe0",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
