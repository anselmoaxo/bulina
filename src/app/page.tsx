import Link from "next/link";
import Busca from "./busca";
import Foto from "./foto";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold text-teal-700">Bulinha</h1>
        <p className="mt-1 text-zinc-600">
          A bula do seu remédio, resumida e em linguagem simples.
        </p>
      </header>

      <Foto />

      <Busca />

      <footer className="mt-auto space-y-2 text-sm text-zinc-600">
        <p>
          Este app não substitui a orientação de um médico ou farmacêutico.
          Não se automedique.
        </p>
        <p>
          Em caso de emergência, ligue para o SAMU (192) ou procure um pronto
          atendimento.
        </p>
        <p>
          <Link href="/privacidade" className="underline">
            Política de privacidade
          </Link>
        </p>
      </footer>
    </main>
  );
}
