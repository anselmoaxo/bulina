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

function distancia(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

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
  // Sem acertos diretos: tolera erros de digitação comparando com o início do nome/princípio.
  if (ranked.length === 0 && q.length >= 4) {
    const tolerancia = q.length >= 7 ? 2 : 1;
    for (const e of index) {
      const d = Math.min(
        distancia(q, e.nome.slice(0, q.length)),
        distancia(q, e.principio.slice(0, q.length)),
      );
      if (d <= tolerancia) ranked.push({ m: e.m, score: 0 });
    }
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

export function buscarExato(nome: string, principio: string): Medicamento | undefined {
  return (catalog as Medicamento[]).find((m) => m.nome === nome && m.principio === principio);
}
