import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarExato } from "@/lib/catalog";
import { ehControlado, formatarClasse, formatarNome } from "@/lib/formatar";
import { Logo } from "../logo";
import ResumoGeral from "./resumo-geral";

export default async function Medicamento({ searchParams }: PageProps<"/medicamento">) {
  const { nome, principio } = await searchParams;
  if (typeof nome !== "string" || typeof principio !== "string") notFound();
  const m = buscarExato(nome, principio);
  if (!m) notFound();

  const nomeBonito = formatarNome(m.nome);
  const data = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const dados = [
    ["Princípio ativo", m.principio ? formatarNome(m.principio) : "não informado"],
    ["Classe", m.classe ? formatarClasse(m.classe) : ""],
    ["Categoria", m.categoria],
  ].filter(([, v]) => v);

  return (
    <main className="flex flex-1 flex-col">
      <header className="bg-marinho bg-[radial-gradient(70%_120%_at_100%_0%,#2563eb_0%,transparent_70%)] text-white print:bg-white print:bg-none print:text-ink">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 print:pb-2">
          <div className="flex items-center justify-between gap-4 print:hidden">
            <Logo claro />
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border-2 border-white/40 px-4 py-2 font-bold hover:bg-white/10"
            >
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
              Nova consulta
            </Link>
          </div>
          <p className="hidden text-xl font-extrabold text-marca print:block">Bulinha</p>
          <h1 className="mt-10 text-4xl leading-tight font-extrabold break-words sm:text-5xl print:mt-2 print:text-3xl">
            {nomeBonito}
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 pb-12 print:space-y-4">
        <dl className="-mt-8 rounded-3xl bg-white p-2 shadow-[0_12px_40px_-14px_rgba(15,23,42,0.4)] print:mt-0 print:rounded-none print:border print:border-linha print:shadow-none">
          {dados.map(([rotulo, valor], i) => (
            <div
              key={rotulo}
              className={`grid grid-cols-[8.5rem_1fr] gap-3 px-4 py-3 ${i > 0 ? "border-t border-linha" : ""}`}
            >
              <dt className="text-muted">{rotulo}</dt>
              <dd className="font-bold">{valor}</dd>
            </div>
          ))}
        </dl>

        {ehControlado(m.classe) && (
          <section role="note" className="space-y-1 rounded-2xl border-l-8 border-tarja bg-white p-5 print:break-inside-avoid">
            <h2 className="text-lg font-extrabold">Medicamento controlado</h2>
            <p>
              Esta classe de remédio só deve ser usada com receita e acompanhamento de um médico.
              Não use por conta própria.
            </p>
          </section>
        )}

        {m.principio ? (
          <section className="space-y-5">
            <h2 className="text-3xl font-extrabold">Resumo</h2>
            <ResumoGeral principio={m.principio} nome={nomeBonito} />
          </section>
        ) : (
          <section className="space-y-2 rounded-2xl border-l-8 border-tarja bg-white p-5">
            <h2 className="text-lg font-extrabold">Resumo indisponível</h2>
            <p>
              Este registro não informa o princípio ativo. Leia a bula oficial no{" "}
              <a
                className="font-bold underline"
                href="https://consultas.anvisa.gov.br/#/bulario/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Bulário Eletrônico da ANVISA
              </a>
              .
            </p>
          </section>
        )}

        <p className="hidden text-sm text-muted print:block">
          Gerado pelo Bulinha em {data}. Resumo informativo feito por inteligência artificial, não é a
          bula do medicamento e não substitui a orientação de um médico ou farmacêutico.
        </p>

        <footer className="mt-auto border-t border-linha pt-5 text-muted print:hidden">
          O Bulinha não substitui a orientação de um médico ou farmacêutico. Não se automedique.
        </footer>
      </div>
    </main>
  );
}
