"use client";

import { useEffect, useState } from "react";
import type { Medicamento } from "@/lib/catalog";

export default function Busca() {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<Medicamento[]>([]);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medicamentos?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error();
        setResultados((await res.json()).resultados);
        setErro(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setErro(true);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const lista = q.trim().length >= 2 ? resultados : [];

  return (
    <section className="space-y-3">
      <label htmlFor="busca" className="block text-sm font-medium text-zinc-700">
        Nome do remédio ou princípio ativo
      </label>
      <input
        id="busca"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ex.: dipirona, Buscofem"
        autoComplete="off"
        className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
      />
      {erro && <p className="text-sm text-red-600">Não foi possível buscar agora. Tente de novo.</p>}
      {q.trim().length >= 2 && !erro && lista.length === 0 && (
        <p className="text-sm text-zinc-500">Nenhum medicamento ativo encontrado com esse nome.</p>
      )}
      <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {lista.map((m) => (
          <li key={`${m.nome}|${m.principio}`} className="px-4 py-3">
            <p className="font-medium">{m.nome}</p>
            <p className="text-sm text-zinc-600">
              {m.principio || "Princípio ativo não informado"}
              {m.categoria && ` · ${m.categoria}`}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
