// Limite diário simples por IP, em memória. Em ambiente serverless vale por instância:
// serve como freio de custo no MVP, não como garantia forte.
const LIMITE_DIARIO = Number(process.env.BULINA_LIMITE_DIARIO ?? 20);
const usos = new Map<string, { dia: string; n: number }>();

export function dentroDoLimite(ip: string): boolean {
  const dia = new Date().toISOString().slice(0, 10);
  const atual = usos.get(ip);
  const n = atual && atual.dia === dia ? atual.n : 0;
  if (n >= LIMITE_DIARIO) return false;
  usos.set(ip, { dia, n: n + 1 });
  return true;
}
