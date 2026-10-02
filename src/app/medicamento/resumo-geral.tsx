"use client";

import { useEffect, useState } from "react";
import type { Resumo } from "@/lib/resumo";

type Estado = { tipo: "carregando" } | { tipo: "erro"; mensagem: string } | { tipo: "pronto"; resumo: Resumo | null };

const BULARIO = "https://consultas.anvisa.gov.br/#/bulario/";

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (itens.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-xl font-extrabold">{titulo}</h3>
      <ul className="list-disc space-y-1 pl-6 marker:text-folha">
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}

export default function ResumoGeral({ principio }: { principio: string }) {
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
    <p className="border-l-8 border-tarja bg-white p-4">
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
      <section aria-live="polite" className="space-y-4">
        {aviso}
        <p className="text-muted">Preparando o resumo. Na primeira consulta isso pode levar até um minuto.</p>
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
    <article className="space-y-6">
      {aviso}
      <section className="space-y-2">
        <h3 className="text-xl font-extrabold">Para que serve</h3>
        <p>{r.para_que_serve}</p>
      </section>
      <section className="space-y-2">
        <h3 className="text-xl font-extrabold">Como age no corpo</h3>
        <p>{r.como_age}</p>
      </section>
      <Lista titulo="Efeitos que podem aparecer" itens={r.efeitos_comuns} />
      <Lista titulo="Procure atendimento médico se houver" itens={r.efeitos_graves} />
      <Lista titulo="Não use sem falar com o médico se" itens={r.nao_use_se} />
      <Lista titulo="Cuidados especiais" itens={r.cuidados_especiais} />
      <Lista titulo="Pode interagir com" itens={r.interacoes} />
    </article>
  );
}
