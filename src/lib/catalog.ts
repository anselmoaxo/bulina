import catalog from "@/data/catalog.json";

export type Medicamento = {
  nome: string;
  principio: string;
  categoria: string;
  classe: string;
};

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const index = (catalog as Medicamento[]).map((m) => ({
  m,
  nome: normalize(m.nome),
  principio: normalize(m.principio),
}));

/** Busca por nome comercial ou princípio ativo, sem acento e sem diferenciar maiúsculas. */
export function buscar(consulta: string, limite = 15): Medicamento[] {
  const q = normalize(consulta);
  if (q.length < 2) return [];

  const ranked: { m: Medicamento; score: number }[] = [];
  for (const e of index) {
    let score = 0;
    if (e.nome.startsWith(q)) score = 4;
    else if (e.principio.startsWith(q)) score = 3;
    else if (e.nome.includes(q)) score = 2;
    else if (e.principio.includes(q)) score = 1;
    if (score) ranked.push({ m: e.m, score });
  }
  ranked.sort((a, b) => b.score - a.score || a.m.nome.length - b.m.nome.length);
  const vistos = new Set<string>();
  const unicos: Medicamento[] = [];
  for (const { m } of ranked) {
    const chave = normalize(m.nome);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    unicos.push(m);
    if (unicos.length === limite) break;
  }
  return unicos;
}
