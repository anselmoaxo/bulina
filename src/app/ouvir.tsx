"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const semAssinatura = () => () => {};

/** Quebra o texto em trechos curtos: alguns navegadores cortam falas longas. */
function dividir(textos: string[], maximo = 180): string[] {
  const partes: string[] = [];
  for (const texto of textos) {
    let atual = "";
    for (const frase of texto.split(/(?<=[.!?:;])\s+/)) {
      if (atual && atual.length + frase.length + 1 > maximo) {
        partes.push(atual);
        atual = frase;
      } else {
        atual = atual ? `${atual} ${frase}` : frase;
      }
    }
    if (atual) partes.push(atual);
  }
  return partes;
}

function escolherVoz(): SpeechSynthesisVoice | undefined {
  const vozes = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("pt"));
  return (
    vozes.find((v) => v.lang.toLowerCase() === "pt-br" && /google|luciana|francisca|microsoft|natural/i.test(v.name)) ??
    vozes.find((v) => v.lang.toLowerCase() === "pt-br") ??
    vozes[0]
  );
}

/** Lê o texto em voz alta com a voz do próprio aparelho (nada é enviado para fora). */
export default function Ouvir({ textos }: { textos: string[] }) {
  const suportado = useSyncExternalStore(
    semAssinatura,
    () => "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
    () => false,
  );
  const [falando, setFalando] = useState(false);
  const [devagar, setDevagar] = useState(false);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!suportado) return null;

  function parar() {
    window.speechSynthesis.cancel();
    setFalando(false);
  }

  function falar() {
    const sintese = window.speechSynthesis;
    sintese.cancel();
    const partes = dividir(textos);
    const voz = escolherVoz();
    partes.forEach((texto, i) => {
      const fala = new SpeechSynthesisUtterance(texto);
      fala.lang = "pt-BR";
      if (voz) fala.voice = voz;
      fala.rate = devagar ? 0.8 : 1;
      if (i === partes.length - 1) fala.onend = () => setFalando(false);
      fala.onerror = () => setFalando(false);
      sintese.speak(fala);
    });
    setFalando(true);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <button
        type="button"
        onClick={falando ? parar : falar}
        aria-pressed={falando}
        className="flex items-center gap-2 rounded-full border-2 border-marca px-6 py-3 text-lg font-extrabold text-marca hover:bg-bruma"
      >
        <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {falando ? (
            <rect x="6" y="6" width="12" height="12" rx="2" />
          ) : (
            <>
              <path d="M11 5L6 9H3v6h3l5 4z" />
              <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
            </>
          )}
        </svg>
        {falando ? "Parar" : "Ouvir"}
      </button>
      <label className="flex cursor-pointer items-center gap-2 text-muted">
        <input type="checkbox" checked={devagar} onChange={(e) => setDevagar(e.target.checked)} className="size-5 accent-marca" />
        Falar mais devagar
      </label>
    </div>
  );
}
