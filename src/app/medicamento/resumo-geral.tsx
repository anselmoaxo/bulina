"use client";

import { useEffect, useState } from "react";
import { salvarPdf } from "@/lib/imprimir";
import Aguarde from "../aguarde";
import Ouvir from "../ouvir";
import type { Resumo } from "@/lib/resumo";

type Estado = { tipo: "carregando" } | { tipo: "erro"; mensagem: string } | { tipo: "pronto"; resumo: Resumo | null };

const BULARIO = "https://consultas.anvisa.gov.br/#/bulario/";

const CARTAO = "space-y-2 rounded-2xl bg-white p-5 shadow-[0_6px_24px_-14px_rgba(18,20,26,0.35)] print:break-inside-avoid print:shadow-none print:border print:border-linha";

function Lista({ titulo, itens, alerta = false }: { titulo: string; itens: string[]; alerta?: boolean }) {
  if (itens.length === 0) return null;
  return (
    <section className={`${CARTAO} ${alerta ? "border-l-8 border-tarja print:border-l-tarja" : ""}`}>
      <h3 className="text-xl font-extrabold">{titulo}</h3>
      <ul className="list-disc space-y-1 pl-6 marker:text-marca">
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}

function textoParaOuvir(r: Resumo, nome: string): string[] {
  const lista = (titulo: string, itens: string[]) => (itens.length ? [`${titulo}.`, ...itens.map((i) => i.replace(/[.;]?$/, "."))] : []);
  return [
    `Resumo de ${nome}.`,
    "Atenção. Este é um resumo geral, feito por inteligência artificial. Não é a bula do seu medicamento, e pode ter erros. Confirme com o médico ou o farmacêutico.",
    "Para que serve.",
    r.para_que_serve,
    "Como age no corpo.",
    r.como_age,
    ...lista("Efeitos que podem aparecer", r.efeitos_comuns),
    ...lista("Procure atendimento médico se houver", r.efeitos_graves),
    ...lista("Não use sem falar com o médico se", r.nao_use_se),
    ...lista("Cuidados especiais", r.cuidados_especiais),
    ...lista("Pode interagir com", r.interacoes),
  ];
}

export default function ResumoGeral({ principio, nome }: { principio: string; nome: string }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });

  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const res = await fetch(`/api/resumo?principio=${encodeURIComponent(principio)}`);
        const dados = await res.json();
        if (!res.ok) throw new Error(dados.erro ?? "Não foi possível carregar o resumo.");
        if (ativo) setEstado({ tipo: "pronto", resumo: dados.resumo });
      } catch (e) {
        const mensagem = (e as Error).message || "Não foi possível carregar o resumo.";
        if (ativo) setEstado({ tipo: "erro", mensagem });
      }
    })();
    return () => {
      ativo = false;
    };
  }, [principio, tentativa]);

  const aviso = (
    <p className="rounded-2xl border-l-8 border-tarja bg-white p-5 print:break-inside-avoid">
      <strong>Resumo geral feito por inteligência artificial. Não é a bula do seu medicamento.</strong>{" "}
      Pode ter erros. Confirme com o médico ou o farmacêutico e leia a bula da caixa ou no{" "}
      <a className="font-bold underline" href={BULARIO} target="_blank" rel="noopener noreferrer">
        Bulário Eletrônico da ANVISA
      </a>
      .
    </p>
  );

  if (estado.tipo === "carregando") {
    return (
      <section className="space-y-5">
        {aviso}
        <Aguarde
          titulo="Preparando o resumo"
          etapas={["Consultando as informações da substância…", "Organizando em linguagem simples…", "Revisando os avisos de segurança…", "Quase pronto…"]}
          esqueleto
        />
      </section>
    );
  }

  if (estado.tipo === "erro") {
    return (
      <section className="space-y-4">
        {aviso}
        <p role="alert">{estado.mensagem}</p>
        <button
          type="button"
          onClick={() => {
            setEstado({ tipo: "carregando" });
            setTentativa((n) => n + 1);
          }}
          className="rounded-full border-2 border-ink px-6 py-3 font-bold hover:bg-white"
        >
          Tentar de novo
        </button>
      </section>
    );
  }

  const r = estado.resumo;
  if (!r) {
    return (
      <section className="space-y-4">
        {aviso}
        <p>Não foi possível montar o resumo deste medicamento. Leia a bula oficial no Bulário.</p>
      </section>
    );
  }

  return (
    <article className="space-y-5 print:space-y-3">
      {aviso}
      <div className="space-y-4 print:hidden">
        <Ouvir textos={textoParaOuvir(r, nome)} />
      <button
        type="button"
        onClick={() => salvarPdf(`Bulinha - ${nome}`)}
        className="flex items-center gap-2 rounded-full bg-marca px-6 py-3 text-lg font-extrabold text-white hover:bg-marca-escura print:hidden"
      >
        <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
        </svg>
        Salvar em PDF
      </button>
      </div>
      <section className={CARTAO}>
        <h3 className="text-xl font-extrabold">Para que serve</h3>
        <p>{r.para_que_serve}</p>
      </section>
      <section className={CARTAO}>
        <h3 className="text-xl font-extrabold">Como age no corpo</h3>
        <p>{r.como_age}</p>
      </section>
      <Lista titulo="Efeitos que podem aparecer" itens={r.efeitos_comuns} />
      <Lista titulo="Procure atendimento médico se houver" itens={r.efeitos_graves} alerta />
      <Lista titulo="Não use sem falar com o médico se" itens={r.nao_use_se} />
      <Lista titulo="Cuidados especiais" itens={r.cuidados_especiais} />
      <Lista titulo="Pode interagir com" itens={r.interacoes} />
    </article>
  );
}
