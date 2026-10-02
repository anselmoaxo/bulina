"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Medicamento } from "@/lib/catalog";
import { formatarNome } from "@/lib/formatar";
import Aguarde from "./aguarde";

type LeituraFoto = {
  leitura: { encontrado: boolean; nome: string; principio_ativo: string };
  candidatos: Medicamento[];
};

const CHAVE_CONSENTIMENTO = "bulinha:consentimento-foto";

function jaConsentiu(): boolean {
  try {
    return localStorage.getItem(CHAVE_CONSENTIMENTO) === "1";
  } catch {
    return false;
  }
}

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

function linkDetalhe(m: Medicamento) {
  return `/medicamento?nome=${encodeURIComponent(m.nome)}&principio=${encodeURIComponent(m.principio)}`;
}

function Lista({ itens }: { itens: Medicamento[] }) {
  return (
    <ul className="border-t border-linha">
      {itens.map((m) => (
        <li key={`${m.nome}|${m.principio}`} className="border-b border-linha">
          <Link href={linkDetalhe(m)} className="block py-4 hover:bg-bula">
            <span className="block text-lg font-bold leading-snug">{formatarNome(m.nome)}</span>
            <span className="block text-muted">
              {m.principio ? formatarNome(m.principio) : "Princípio ativo não informado"}
              {m.categoria && `, ${m.categoria.toLowerCase()}`}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Consulta() {
  const inputFoto = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<Medicamento[]>([]);
  const [erroBusca, setErroBusca] = useState(false);
  const [consentimento, setConsentimento] = useState(false);
  const [lendo, setLendo] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const [foto, setFoto] = useState<LeituraFoto | null>(null);

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
        setErroBusca(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setErroBusca(true);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  async function enviarFoto(arquivo: File | undefined) {
    if (!arquivo) return;
    setLendo(true);
    setErroFoto("");
    setFoto(null);
    try {
      const form = new FormData();
      form.set("foto", await reduzir(arquivo), "caixa.jpg");
      const res = await fetch("/api/identificar", { method: "POST", body: form });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro ?? "Não foi possível ler a foto.");
      setFoto(dados);
    } catch (e) {
      setErroFoto((e as Error).message || "Não foi possível ler a foto.");
    } finally {
      setLendo(false);
    }
  }

  const lista = q.trim().length >= 2 ? resultados : [];

  const temPainel =
    consentimento || lendo || !!erroFoto || !!foto || erroBusca || q.trim().length >= 2;

  return (
    <section className="space-y-4">
      {/* Cápsula: campo de texto à esquerda, foto à direita. */}
      <div className="flex h-[4.5rem] overflow-hidden rounded-full bg-white text-ink shadow-[0_16px_40px_-10px_rgba(0,0,0,0.55)] focus-within:outline-4 focus-within:outline-offset-4 focus-within:outline-menta">
        <label htmlFor="busca" className="sr-only">
          Nome do remédio ou princípio ativo
        </label>
        <input
          id="busca"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nome do remédio"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent pl-7 pr-2 text-xl outline-none placeholder:text-muted"
        />
        <button
          type="button"
          disabled={lendo}
          onClick={() => (jaConsentiu() ? inputFoto.current?.click() : setConsentimento(true))}
          className="flex shrink-0 items-center gap-2 bg-menta pl-5 pr-7 text-lg font-extrabold text-ink hover:bg-white disabled:opacity-70"
        >
          <svg aria-hidden width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          <span aria-label={lendo ? "Lendo a foto" : "Fotografar a caixa"}>
            {lendo ? "Lendo…" : "Foto"}
            {!lendo && <span className="hidden sm:inline"> da caixa</span>}
          </span>
        </button>
        <input
          ref={inputFoto}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            enviarFoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {temPainel && (
        <div className="space-y-4 rounded-3xl bg-white p-4 text-ink shadow-[0_16px_40px_-10px_rgba(0,0,0,0.45)]">
      {lendo && (
        <Aguarde
          titulo="Lendo a caixa"
          etapas={["Enviando a foto…", "Procurando o nome do remédio…", "Quase pronto…"]}
        />
      )}

      {consentimento && (
        <div role="dialog" aria-label="Uso da foto" className="space-y-4 border-l-8 border-folha bg-bula p-4">
          <p>
            Para ler o nome do remédio, a foto é enviada a um serviço de inteligência artificial
            (Anthropic). O Bulinha não guarda a foto. Fotografe só a caixa, sem pessoas, documentos
            ou receitas.{" "}
            <Link href="/privacidade" className="font-bold underline">
              Ler a política de privacidade
            </Link>
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-folha px-6 py-3 font-bold text-white hover:bg-folha-escura"
              onClick={() => {
                try {
                  localStorage.setItem(CHAVE_CONSENTIMENTO, "1");
                } catch {}
                setConsentimento(false);
                inputFoto.current?.click();
              }}
            >
              Concordo e fotografar
            </button>
            <button
              type="button"
              className="rounded-full border-2 border-ink px-6 py-3 font-bold hover:bg-white"
              onClick={() => setConsentimento(false)}
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {erroFoto && (
        <p role="alert" className="border-l-8 border-tarja bg-white p-4">
          {erroFoto}
        </p>
      )}

      {foto && !foto.leitura.encontrado && (
        <p className="border-l-8 border-tarja bg-white p-4">
          Não consegui ler o nome na foto. Tente de novo com mais luz e a caixa de frente, ou digite
          o nome.
        </p>
      )}

      {foto?.leitura.encontrado && (
        <div className="space-y-3">
          <p>
            Li na caixa <strong>{formatarNome(foto.leitura.nome)}</strong>. Toque no seu remédio para
            confirmar:
          </p>
          {foto.candidatos.length === 0 ? (
            <p className="text-muted">Não achei esse nome no catálogo da ANVISA.</p>
          ) : (
            <Lista itens={foto.candidatos} />
          )}
        </div>
      )}

      {erroBusca && (
        <p role="alert" className="border-l-8 border-tarja bg-white p-4">
          Não foi possível buscar agora. Tente de novo.
        </p>
      )}
      {q.trim().length >= 2 && !erroBusca && lista.length === 0 && (
        <p className="text-muted">Nenhum medicamento ativo encontrado com esse nome.</p>
      )}
      {lista.length > 0 && <Lista itens={lista} />}
      </div>
      )}
    </section>
  );
}
