"use client";

import { useEffect, useState } from "react";

const DICAS = [
  "Leia sempre a bula da caixa antes de usar um remédio.",
  "Confira a validade antes de tomar. Remédio vencido pode não funcionar e fazer mal.",
  "Não divida nem amasse comprimidos sem falar com o farmacêutico.",
  "Guarde remédios longe do calor, da umidade e do alcance de crianças.",
  "Conte ao médico todos os remédios que você usa, inclusive chás e vitaminas.",
  "Evite misturar remédios com bebida alcoólica.",
  "Sintomas que não passam merecem uma consulta. Não fique só no remédio.",
  "Não use sobras de tratamentos antigos sem orientação.",
];

function CapsulaBalancando() {
  return (
    <svg aria-hidden width="72" height="72" viewBox="0 0 120 120" className="anim-balanco shrink-0">
      <g transform="rotate(-40 60 60)">
        <rect x="12" y="38" width="96" height="44" rx="22" fill="#2b3fe0" />
        <path d="M60 38h26a22 22 0 0 1 0 44H60z" fill="#a5b0f5" />
      </g>
    </svg>
  );
}

/** Espera com movimento: cápsula animada, mensagem de etapa e dicas de segurança que se alternam. */
export default function Aguarde({ titulo, etapas, esqueleto = false }: { titulo: string; etapas: string[]; esqueleto?: boolean }) {
  const [dica, setDica] = useState(() => Math.floor(Math.random() * DICAS.length));
  const [etapa, setEtapa] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDica((d) => (d + 1) % DICAS.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setEtapa((e) => Math.min(e + 1, etapas.length - 1)), 4000);
    return () => clearInterval(t);
  }, [etapas.length]);

  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl bg-bruma p-5">
        <CapsulaBalancando />
        <div className="min-w-0">
          <p className="text-xl font-extrabold">{titulo}</p>
          <p className="text-muted">{etapas[etapa]}</p>
        </div>
      </div>

      <p key={dica} className="anim-dica rounded-2xl border-l-8 border-marca bg-white p-5">
        <strong>Você sabia?</strong> {DICAS[dica]}
      </p>

      {esqueleto && (
        <div aria-hidden className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3 rounded-2xl bg-white p-5">
              <div className="esqueleto h-6 w-1/2 rounded-full" />
              <div className="esqueleto h-4 w-full rounded-full" />
              <div className="esqueleto h-4 w-4/5 rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
