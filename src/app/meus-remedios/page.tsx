import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../logo";
import MeusRemedios from "./meus-remedios";

export const metadata: Metadata = { title: "Meus remédios - Bulinha" };

export default function Pagina() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="bg-marinho bg-[radial-gradient(70%_120%_at_100%_0%,#2b3fe0_0%,transparent_70%)] text-white print:bg-white print:bg-none print:text-ink">
        <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 print:pb-2">
          <div className="flex items-center justify-between gap-4 print:hidden">
            <Logo claro />
            <Link href="/" className="rounded-full border-2 border-white/40 px-4 py-2 font-bold hover:bg-white/10">
              Início
            </Link>
          </div>
          <p className="hidden text-xl font-extrabold text-marca print:block">Bulinha</p>
          <h1 className="mt-10 text-4xl leading-tight font-extrabold sm:text-5xl print:mt-2 print:text-3xl">Meus remédios</h1>
          <p className="mt-3 max-w-md text-lg text-white/85 print:hidden">
            Guarde os remédios que você usa e veja possíveis interações entre eles. A lista fica só neste aparelho.
          </p>
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 pb-12 pt-8 print:space-y-4 print:pt-2">
        <MeusRemedios />
      </div>
    </main>
  );
}
