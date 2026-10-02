"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Medicamento } from "@/lib/catalog";

type Resultado = {
  leitura: { encontrado: boolean; nome: string; principio_ativo: string };
  candidatos: Medicamento[];
};

/** Reduz a foto no aparelho antes de enviar (menos dados e menor custo). */
async function reduzir(arquivo: File, ladoMax = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((ok, falha) =>
    canvas.toBlob((b) => (b ? ok(b) : falha(new Error("reduzir"))), "image/jpeg", 0.85),
  );
}

const CHAVE_CONSENTIMENTO = "bulina:consentimento-foto";

function jaConsentiu(): boolean {
  try {
    return localStorage.getItem(CHAVE_CONSENTIMENTO) === "1";
  } catch {
    return false;
  }
}

export default function Foto() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pedindoConsentimento, setPedindoConsentimento] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function enviar(arquivo: File | undefined) {
    if (!arquivo) return;
    setCarregando(true);
    setErro("");
    setResultado(null);
    try {
      const form = new FormData();
      form.set("foto", await reduzir(arquivo), "caixa.jpg");
      const res = await fetch("/api/identificar", { method: "POST", body: form });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro ?? "Falha ao ler a foto.");
      setResultado(dados);
    } catch (e) {
      setErro((e as Error).message || "Falha ao ler a foto.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="space-y-3">
      <button
        type="button"
        disabled={carregando}
        onClick={() => (jaConsentiu() ? inputRef.current?.click() : setPedindoConsentimento(true))}
        className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-3 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {carregando ? "Lendo a foto..." : "Fotografar a caixa"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          enviar(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {pedindoConsentimento && (
        <div role="dialog" aria-label="Uso da foto" className="space-y-3 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-zinc-800">
          <p>
            Para ler o nome do remédio, a foto é enviada para um serviço de inteligência artificial
            (Anthropic). A Bulina não guarda a foto. Fotografe só a caixa, sem pessoas, documentos
            ou receitas. Detalhes na{" "}
            <Link href="/privacidade" className="underline">
              política de privacidade
            </Link>
            .
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800"
              onClick={() => {
                try {
                  localStorage.setItem(CHAVE_CONSENTIMENTO, "1");
                } catch {}
                setPedindoConsentimento(false);
                inputRef.current?.click();
              }}
            >
              Concordo e continuar
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-4 py-2 hover:bg-white"
              onClick={() => setPedindoConsentimento(false)}
            >
              Agora não
            </button>
          </div>
        </div>
      )}
      <p className="text-xs text-zinc-500">
        A foto é usada só para ler o nome e não é guardada.
      </p>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {resultado && !resultado.leitura.encontrado && (
        <p className="text-sm text-zinc-600">
          Não consegui ler o nome na foto. Tente de novo com mais luz, ou busque pelo nome.
        </p>
      )}

      {resultado?.leitura.encontrado && (
        <div className="space-y-2">
          <p className="text-sm text-zinc-700">
            Li na caixa: <strong>{resultado.leitura.nome}</strong>. Confirme qual é o seu remédio:
          </p>
          {resultado.candidatos.length === 0 && (
            <p className="text-sm text-zinc-500">Não achei esse nome no catálogo da ANVISA.</p>
          )}
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
            {resultado.candidatos.map((m) => (
              <li key={`${m.nome}|${m.principio}`}>
                <Link
                  href={`/medicamento?nome=${encodeURIComponent(m.nome)}&principio=${encodeURIComponent(m.principio)}`}
                  className="block px-4 py-3 hover:bg-zinc-50"
                >
                  <p className="font-medium">{m.nome}</p>
                  <p className="text-sm text-zinc-600">{m.principio || "Princípio ativo não informado"}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
