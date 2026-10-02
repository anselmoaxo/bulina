import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarExato } from "@/lib/catalog";
import { formatarNome, primeiraMaiuscula } from "@/lib/formatar";

export default async function Medicamento({ searchParams }: PageProps<"/medicamento">) {
  const { nome, principio } = await searchParams;
  if (typeof nome !== "string" || typeof principio !== "string") notFound();
  const m = buscarExato(nome, principio);
  if (!m) notFound();

  const dados = [
    ["Princípio ativo", m.principio ? formatarNome(m.principio) : "não informado"],
    ["Classe", m.classe ? primeiraMaiuscula(m.classe) : ""],
    ["Categoria", m.categoria],
  ].filter(([, v]) => v);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-8">
      <Link href="/" className="flex w-fit items-center gap-2 py-2 font-bold text-folha underline">
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5l-7 7 7 7" />
        </svg>
        Nova consulta
      </Link>

      <header className="space-y-5">
        <h1 className="text-4xl leading-tight font-extrabold break-words">{formatarNome(m.nome)}</h1>
        <dl className="border-t border-linha">
          {dados.map(([rotulo, valor]) => (
            <div key={rotulo} className="grid grid-cols-[8.5rem_1fr] gap-3 border-b border-linha py-3">
              <dt className="text-muted">{rotulo}</dt>
              <dd className="font-bold">{valor}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="space-y-2 border-l-8 border-tarja bg-white p-4">
        <h2 className="text-lg font-extrabold">O resumo da bula ainda não está disponível</h2>
        <p>
          Para saber para que serve, como usar e quais efeitos podem aparecer, leia a bula oficial no{" "}
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

      <footer className="mt-auto border-t border-linha pt-5 text-muted">
        O Bulinha não substitui a orientação de um médico ou farmacêutico. Não se automedique.
      </footer>
    </main>
  );
}
