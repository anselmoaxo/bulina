import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bulina - bula resumida",
    short_name: "Bulina",
    description: "Consulte para que serve um remédio e seus efeitos colaterais, em linguagem simples.",
    start_url: "/",
    display: "standalone",
    lang: "pt-BR",
    background_color: "#ffffff",
    theme_color: "#0f766e",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
