// Limite diário de consultas novas por IP, em memória. Em ambiente serverless vale por instância:
// serve como freio de custo no MVP, não como garantia forte.
// Resultados já guardados em cache não passam por aqui e não gastam consulta.
export const LIMITE_DIARIO = Number(process.env.BULINHA_LIMITE_DIARIO ?? 5);

const usos = new Map<string, { dia: string; n: number }>();
const hoje = () => new Date().toISOString().slice(0, 10);

/** Tenta gastar uma consulta do IP. Retorna false se o limite do dia já foi atingido. */
export function consumirConsulta(ip: string): boolean {
  const atual = usos.get(ip);
  const n = atual && atual.dia === hoje() ? atual.n : 0;
  if (n >= LIMITE_DIARIO) return false;
  usos.set(ip, { dia: hoje(), n: n + 1 });
  return true;
}

/** Devolve a consulta quando a geração falhou por erro nosso. */
export function devolverConsulta(ip: string) {
  const atual = usos.get(ip);
  if (atual && atual.dia === hoje() && atual.n > 0) usos.set(ip, { dia: atual.dia, n: atual.n - 1 });
}

export const MENSAGEM_LIMITE =
  `Você usou as ${LIMITE_DIARIO} consultas novas de hoje. Remédios que outras pessoas já consultaram continuam disponíveis. Volte amanhã para novas consultas.`;

export function ipDe(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "desconhecido";
}
