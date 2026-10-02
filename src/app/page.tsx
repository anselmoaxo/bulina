import Link from "next/link";
import Consulta from "./consulta";

function Capsula() {
  return (
    <svg aria-hidden width="36" height="36" viewBox="0 0 512 512">
      <rect width="512" height="512" rx="112" fill="#0b6b5a" />
      <g transform="rotate(-40 256 256)">
        <rect x="96" y="176" width="320" height="160" rx="80" fill="#fff" />
        <path d="M256 176h80a80 80 0 0 1 0 160h-80z" fill="#99f6e4" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-8">
      <p className="flex items-center gap-3 text-2xl font-extrabold text-folha">
        <Capsula />
        Bulinha
      </p>

      <header className="space-y-3">
        <h1 className="text-4xl leading-tight font-extrabold">Encontre o seu remédio</h1>
        <p className="max-w-prose text-lg text-muted">
          Digite o nome ou fotografe a caixa para ver os dados do medicamento registrado na ANVISA.
        </p>
      </header>

      <Consulta />

      <footer className="mt-auto space-y-2 border-t border-linha pt-5 text-muted">
        <p>
          O Bulinha não substitui a orientação de um médico ou farmacêutico. Não se automedique.
        </p>
        <p>
          <strong className="text-ink">Emergência:</strong> ligue para o SAMU, 192, ou procure um
          pronto atendimento.
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
