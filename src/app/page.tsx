import Link from "next/link";
import Consulta from "./consulta";
import { Logo, Pilulas } from "./logo";

const ICONE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const DIFERENCIAIS = [
  { texto: "Sem cadastro", icone: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /> },
  { texto: "Foto não é guardada", icone: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></> },
  { texto: "Dados da ANVISA", icone: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 14l2 2 4-4" /></> },
  { texto: "Grátis", icone: <><path d="M20 12v9H4v-9" /><path d="M2 7h20v5H2z" /><path d="M12 21V7" /></> },
];

const PASSOS = [
  { titulo: "Busque ou fotografe", texto: "Digite o nome do remédio ou tire uma foto da caixa." },
  { titulo: "Confirme o remédio", texto: "Mostramos os registros da ANVISA parecidos para você escolher o certo." },
  { titulo: "Leia o resumo", texto: "Para que serve, efeitos, cuidados e interações, em linguagem simples." },
];

const PERGUNTAS = [
  {
    p: "O Bulinha substitui a bula ou o médico?",
    r: "Não. O resumo é geral, feito por inteligência artificial, e pode ter erros. Sempre leia a bula da caixa e converse com o médico ou o farmacêutico antes de usar qualquer remédio.",
  },
  {
    p: "A minha foto fica guardada?",
    r: "Não. A foto é reduzida no seu aparelho, usada só para ler o nome da caixa e descartada. O Bulinha não a guarda.",
  },
  { p: "Preciso me cadastrar? Custa algo?", r: "Não precisa de cadastro e é grátis. Há um limite diário de consultas para manter o serviço no ar." },
  {
    p: "De onde vêm os dados?",
    r: "Os medicamentos vêm do catálogo de registros da ANVISA. O resumo explica a substância em geral e não é o texto oficial da bula.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section
        className="relative isolate overflow-hidden bg-noite text-white"
        style={{ backgroundImage: "radial-gradient(70% 90% at 90% 0%, #0b6b5a 0%, transparent 70%)" }}
      >
        <Pilulas className="pointer-events-none absolute -right-24 top-40 -z-10 w-72 opacity-20 md:right-0 md:top-1/2 md:w-[28rem] md:-translate-y-1/2 md:opacity-100" />
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-6 sm:pb-20">
          <Logo claro />
          <div className="mt-12 max-w-xl md:mt-16">
            <h1 className="text-5xl leading-[1.05] font-extrabold sm:text-6xl">
              Entenda o seu remédio em segundos
            </h1>
            <p className="mt-5 max-w-md text-xl text-white/85">
              Digite o nome ou fotografe a caixa. Veja para que serve, os efeitos e os cuidados, em
              linguagem simples.
            </p>
            <div className="mt-9">
              <Consulta />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl space-y-16 px-4 py-14">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {DIFERENCIAIS.map((d) => (
            <li key={d.texto} className="flex items-center gap-3 rounded-2xl bg-bula p-4 font-bold">
              <svg aria-hidden width="26" height="26" viewBox="0 0 24 24" className="shrink-0 text-folha" {...ICONE}>
                {d.icone}
              </svg>
              {d.texto}
            </li>
          ))}
        </ul>

        <section className="space-y-6">
          <h2 className="text-3xl font-extrabold">Como funciona</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-12px_rgba(5,46,39,0.25)]">
                <span className="flex size-12 items-center justify-center rounded-full bg-folha text-xl font-extrabold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-xl font-extrabold">{p.titulo}</h3>
                <p className="mt-1 text-muted">{p.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-extrabold">Perguntas frequentes</h2>
          <div className="divide-y divide-linha border-y border-linha">
            {PERGUNTAS.map((q) => (
              <details key={q.p} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                  {q.p}
                  <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" className="shrink-0 text-folha transition-transform group-open:rotate-180" {...ICONE}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-3 max-w-prose text-muted">{q.r}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="space-y-2 border-t border-linha pt-6 text-muted">
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
      </div>
    </main>
  );
}
