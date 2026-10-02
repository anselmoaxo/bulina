// Limite diário simples por IP, em memória. Em ambiente serverless vale por instância:
// serve como freio de custo no MVP, não como garantia forte.
const usos = new Map<string, { dia: string; n: number }>();

export function dentroDoLimite(ip: string, grupo = "foto", limite?: number): boolean {
  const max = limite ?? Number(process.env.BULINHA_LIMITE_DIARIO ?? 20);
  const chave = `${grupo}:${ip}`;
  const dia = new Date().toISOString().slice(0, 10);
  const atual = usos.get(chave);
  const n = atual && atual.dia === dia ? atual.n : 0;
  if (n >= max) return false;
  usos.set(chave, { dia, n: n + 1 });
  return true;
}
