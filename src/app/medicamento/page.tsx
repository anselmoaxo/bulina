import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarExato } from "@/lib/catalog";

export default async function Medicamento({ searchParams }: PageProps<"/medicamento">) {
  const { nome, principio } = await searchParams;
  if (typeof nome !== "string" || typeof principio !== "string") notFound();
  const m = buscarExato(nome, principio);
  if (!m) notFound();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <Link href="/" className="text-sm text-teal-700 underline">
        ← Nova consulta
      </Link>

      <header>
        <h1 className="text-2xl font-bold">{m.nome}</h1>
        <dl className="mt-3 space-y-1 text-zinc-700">
          <div>
            <dt className="inline font-medium">Princípio ativo: </dt>
            <dd className="inline">{m.principio || "não informado"}</dd>
          </div>
          {m.classe && (
            <div>
              <dt className="inline font-medium">Classe: </dt>
              <dd className="inline">{m.classe.toLowerCase()}</dd>
            </div>
          )}
          {m.categoria && (
            <div>
              <dt className="inline font-medium">Categoria: </dt>
              <dd className="inline">{m.categoria}</dd>
            </div>
          )}
        </dl>
      </header>

      <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        O resumo da bula ainda não está disponível. Para ler a bula oficial deste
        medicamento, consulte o{" "}
        <a
          className="underline"
          href="https://consultas.anvisa.gov.br/#/bulario/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bulário Eletrônico da ANVISA
        </a>
        .
      </section>

      <footer className="mt-auto text-sm text-zinc-600">
        Este app não substitui a orientação de um médico ou farmacêutico. Não se
        automedique.
      </footer>
    </main>
  );
}
