"use client";

import Link from "next/link";
import { useMeusRemedios } from "@/lib/meus-remedios";

export default function LinkLista() {
  const lista = useMeusRemedios();
  return (
    <Link href="/meus-remedios" className="flex items-center gap-2 rounded-full border-2 border-white/40 px-4 py-2 font-bold text-white hover:bg-white/10">
      Meus remédios
      {lista.length > 0 && <span className="rounded-full bg-white px-2 text-sm font-extrabold text-marca">{lista.length}</span>}
    </Link>
  );
}
