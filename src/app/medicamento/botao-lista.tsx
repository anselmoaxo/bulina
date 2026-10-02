"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_LISTA, adicionarRemedio, mesmoItem, removerRemedio, useMeusRemedios } from "@/lib/meus-remedios";

export default function BotaoLista({ nome, principio }: { nome: string; principio: string }) {
  const lista = useMeusRemedios();
  const [cheia, setCheia] = useState(false);
  const item = { nome, principio };
  const naLista = lista.some((i) => mesmoItem(i, item));

  return (
    <div className="space-y-2 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={naLista}
          onClick={() => (naLista ? removerRemedio(item) : setCheia(!adicionarRemedio(item)))}
          className={`flex items-center gap-2 rounded-full px-6 py-3 text-lg font-extrabold ${
            naLista ? "border-2 border-marca text-marca hover:bg-bruma" : "bg-marca text-white hover:bg-marca-escura"
          }`}
        >
          <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            {naLista ? <path d="M5 12l5 5 9-10" /> : <path d="M12 5v14M5 12h14" />}
          </svg>
          {naLista ? "Na minha lista" : "Adicionar aos meus remédios"}
        </button>
        {lista.length > 0 && (
          <Link href="/meus-remedios" className="font-bold text-marca underline">
            Ver minha lista ({lista.length})
          </Link>
        )}
      </div>
      {cheia && <p role="alert">Sua lista já tem {MAX_LISTA} remédios. Remova algum para adicionar outro.</p>}
    </div>
  );
}
