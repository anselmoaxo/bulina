"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Medicamento } from "@/lib/catalog";
import { formatarNome } from "@/lib/formatar";
import { salvarPdf } from "@/lib/imprimir";
import type { Interacoes } from "@/lib/interacoes";
import { MAX_LISTA, adicionarRemedio, removerRemedio, useMeusRemedios } from "@/lib/meus-remedios";
import Aguarde from "../aguarde";
import Ouvir from "../ouvir";

type Estado =
  | { tipo: "parado" }
  | { tipo: "carregando"; chave: string }
  | { tipo: "erro"; chave: string; mensagem: string }
  | { tipo: "pronto"; chave: string; dados: Interacoes | null };

const CARTAO = "rounded-2xl bg-white p-5 shadow-[0_6px_24px_-14px_rgba(18,20,26,0.35)] print:break-inside-avoid print:border print:border-linha print:shadow-none";
const ROTULO = {
  grave: { texto: "Grave", cor: "bg-[#b3261e] text-white" },
  moderada: { texto: "Moderada", cor: "bg-tarja text-ink" },
  leve: { texto: "Leve", cor: "bg-bruma text-marca-escura" },
} as const;
const ORDEM = { grave: 0, moderada: 1, leve: 2 } as const;

function Adicionar() {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<Medicamento[]>([]);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (q.trim().length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medicamentos?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) setResultados((await res.json()).resultados.slice(0, 8));
      } catch {}
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const lista = q.trim().length >= 2 ? resultados : [];

  return (
    <section className="space-y-3 print:hidden">
      <label htmlFor="adicionar" className="text-xl font-extrabold">
        Adicionar um remédio
      </label>
      <input
        id="adicionar"
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setAviso("");
        }}
        placeholder="Nome do remédio"
        autoComplete="off"
        className="h-14 w-full rounded-full border-2 border-ink bg-white px-6 text-lg outline-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-marca"
      />
      {aviso && <p role="alert">{aviso}</p>}
      {lista.length > 0 && (
        <ul className="border-t border-linha">
          {lista.map((m) => (
            <li key={`${m.nome}|${m.principio}`} className="flex items-center justify-between gap-3 border-b border-linha py-3">
              <span className="min-w-0">
                <span className="block font-bold">{formatarNome(m.nome)}</span>
                <span className="block text-muted">{m.principio ? formatarNome(m.principio) : "Princípio ativo não informado"}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (adicionarRemedio({ nome: m.nome, principio: m.principio })) {
                    setQ("");
                    setResultados([]);
                  } else {
                    setAviso(`Sua lista já tem ${MAX_LISTA} remédios. Remova algum para adicionar outro.`);
                  }
                }}
                className="shrink-0 rounded-full bg-marca px-5 py-2 font-extrabold text-white hover:bg-marca-escura"
              >
                Adicionar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function textoParaOuvir(d: Interacoes): string[] {
  return [
    "Possíveis interações entre os seus remédios.",
    "Atenção. Este é um resumo geral, feito por inteligência artificial. Pode ter erros. Converse com o médico ou o farmacêutico antes de mudar qualquer coisa.",
    ...d.substancias_repetidas.flatMap((s) => [`Substância repetida: ${s.substancia}.`, s.explicacao]),
    ...[...d.pares]
      .sort((x, y) => ORDEM[x.gravidade] - ORDEM[y.gravidade])
      .flatMap((p) => [`Interação ${ROTULO[p.gravidade].texto.toLowerCase()} entre ${p.a} e ${p.b}.`, p.explicacao, p.o_que_fazer]),
    d.observacao_geral,
  ];
}

export default function MeusRemedios() {
  const lista = useMeusRemedios();
  const [estado, setEstado] = useState<Estado>({ tipo: "parado" });

  const principios = [...new Set(lista.map((i) => i.principio).filter(Boolean))].sort();
  const chave = principios.join("|");
  const semPrincipio = lista.filter((i) => !i.principio);

  // Itens diferentes com exatamente o mesmo princípio ativo: aviso imediato, sem IA.
  const repetidos = principios
    .map((p) => ({ principio: p, itens: lista.filter((i) => i.principio === p) }))
    .filter((g) => g.itens.length > 1);

  async function verificar() {
    const minha = chave;
    setEstado({ tipo: "carregando", chave: minha });
    try {
      const url = `/api/interacoes?${principios.map((p) => `p=${encodeURIComponent(p)}`).join("&")}`;
      const res = await fetch(url);
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro ?? "Não foi possível checar agora.");
      setEstado({ tipo: "pronto", chave: minha, dados: dados.interacoes });
    } catch (e) {
      setEstado({ tipo: "erro", chave: minha, mensagem: (e as Error).message || "Não foi possível checar agora." });
    }
  }

  const atual = estado.tipo !== "parado" && estado.chave === chave ? estado : null;

  return (
    <>
      <Adicionar />

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold">Na sua lista ({lista.length})</h2>
        {lista.length === 0 ? (
          <p className="text-muted">
            Sua lista está vazia. Pesquise um remédio acima, ou abra a página de um remédio e toque em &quot;Adicionar aos meus remédios&quot;.
          </p>
        ) : (
          <ul className="border-t border-linha">
            {lista.map((i) => (
              <li key={`${i.nome}|${i.principio}`} className="flex items-center justify-between gap-3 border-b border-linha py-3">
                <Link
                  href={`/medicamento?nome=${encodeURIComponent(i.nome)}&principio=${encodeURIComponent(i.principio)}`}
                  className="min-w-0 print:pointer-events-none"
                >
                  <span className="block text-lg font-bold">{formatarNome(i.nome)}</span>
                  <span className="block text-muted">{i.principio ? formatarNome(i.principio) : "Princípio ativo não informado"}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => removerRemedio(i)}
                  aria-label={`Remover ${formatarNome(i.nome)} da lista`}
                  className="shrink-0 rounded-full border-2 border-linha px-4 py-2 font-bold hover:bg-bruma print:hidden"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
        {semPrincipio.length > 0 && (
          <p className="text-muted">
            Itens sem princípio ativo informado não entram na checagem de interações.
          </p>
        )}
      </section>

      {repetidos.map((g) => (
        <p key={g.principio} role="note" className="rounded-2xl border-l-8 border-tarja bg-white p-5 print:break-inside-avoid">
          <strong>Mesma substância em mais de um item:</strong> {g.itens.map((i) => formatarNome(i.nome)).join(" e ")} têm{" "}
          {formatarNome(g.principio)}. Usar os dois juntos pode causar excesso. Converse com o médico ou o farmacêutico.
        </p>
      ))}

      {principios.length >= 2 && (
        <section className="space-y-5">
          <h2 className="text-2xl font-extrabold">Interações</h2>
          <p className="rounded-2xl border-l-8 border-tarja bg-white p-5 print:break-inside-avoid">
            <strong>Checagem feita por inteligência artificial. Pode ter erros e não substitui o médico ou o farmacêutico.</strong>{" "}
            Para checar, enviamos apenas os nomes das substâncias, sem nenhum dado seu.
          </p>

          {!atual && (
            <button
              type="button"
              onClick={verificar}
              className="rounded-full bg-marca px-6 py-3 text-lg font-extrabold text-white hover:bg-marca-escura print:hidden"
            >
              Verificar interações
            </button>
          )}

          {atual?.tipo === "carregando" && (
            <Aguarde
              titulo="Checando as interações"
              etapas={["Comparando as substâncias duas a duas…", "Procurando substâncias repetidas…", "Organizando em linguagem simples…", "Quase pronto…"]}
            />
          )}

          {atual?.tipo === "erro" && (
            <div className="space-y-3">
              <p role="alert">{atual.mensagem}</p>
              <button type="button" onClick={verificar} className="rounded-full border-2 border-ink px-6 py-3 font-bold hover:bg-white print:hidden">
                Tentar de novo
              </button>
            </div>
          )}

          {atual?.tipo === "pronto" && !atual.dados && <p>Não foi possível montar a checagem. Converse com o farmacêutico.</p>}

          {atual?.tipo === "pronto" && atual.dados && (
            <div className="space-y-5">
              <div className="space-y-4 print:hidden">
                <Ouvir textos={textoParaOuvir(atual.dados)} />
                <button
                  type="button"
                  onClick={() => salvarPdf("Bulinha - Meus remédios")}
                  className="rounded-full bg-marca px-6 py-3 text-lg font-extrabold text-white hover:bg-marca-escura"
                >
                  Salvar em PDF
                </button>
              </div>

              {atual.dados.substancias_repetidas.map((s) => (
                <section key={s.substancia} className={`${CARTAO} border-l-8 border-tarja space-y-1`}>
                  <h3 className="text-xl font-extrabold">Substância repetida: {s.substancia}</h3>
                  <p className="text-muted">Aparece em: {s.itens.join(", ")}</p>
                  <p>{s.explicacao}</p>
                </section>
              ))}

              {[...atual.dados.pares]
                .sort((x, y) => ORDEM[x.gravidade] - ORDEM[y.gravidade])
                .map((p) => (
                  <section key={`${p.a}|${p.b}`} className={`${CARTAO} space-y-2`}>
                    <p>
                      <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${ROTULO[p.gravidade].cor}`}>{ROTULO[p.gravidade].texto}</span>
                    </p>
                    <h3 className="text-xl font-extrabold">
                      {formatarNome(p.a)} e {formatarNome(p.b)}
                    </h3>
                    <p>{p.explicacao}</p>
                    <p className="text-muted">{p.o_que_fazer}</p>
                  </section>
                ))}

              {atual.dados.pares.length === 0 && atual.dados.substancias_repetidas.length === 0 && (
                <p className={CARTAO}>Não encontramos interações importantes conhecidas entre estes remédios.</p>
              )}
              <p className="text-muted">{atual.dados.observacao_geral}</p>
            </div>
          )}
        </section>
      )}

      {lista.length > 0 && principios.length < 2 && (
        <p className="text-muted">Adicione pelo menos dois remédios com princípio ativo informado para checar interações.</p>
      )}

      <p className="hidden text-sm text-muted print:block">
        Gerado pelo Bulinha. Resumo informativo feito por inteligência artificial, não é bula e não substitui a orientação de um médico ou farmacêutico.
      </p>
    </>
  );
}
