import { timingSafeEqual } from "node:crypto";
import { banco } from "./db";

// Limite diário de consultas novas por IP. Com o banco (Neon) o contador é compartilhado entre todos os
// servidores; sem ele (ou se o banco falhar) cai para a memória do servidor, que é um freio mais fraco.
// Resultados já guardados em cache não passam por aqui e não gastam consulta.
export const LIMITE_DIARIO = Number(process.env.BULINHA_LIMITE_DIARIO ?? 5);

const memoria = new Map<string, { dia: string; n: number }>();
const hoje = () => new Date().toISOString().slice(0, 10);

function consumirMemoria(ip: string): boolean {
  const atual = memoria.get(ip);
  const n = atual && atual.dia === hoje() ? atual.n : 0;
  if (n >= LIMITE_DIARIO) return false;
  memoria.set(ip, { dia: hoje(), n: n + 1 });
  return true;
}

function devolverMemoria(ip: string) {
  const atual = memoria.get(ip);
  if (atual && atual.dia === hoje() && atual.n > 0) memoria.set(ip, { dia: atual.dia, n: atual.n - 1 });
}

export type Consumo = { devolver: () => Promise<void> };

/** Tenta gastar uma consulta do IP. Retorna null se o limite do dia já foi atingido; senão, um recibo para devolvê-la. */
export async function consumirConsulta(ip: string): Promise<Consumo | null> {
  const db = banco();
  if (db) {
    try {
      const chave = await db.consumir(ip, LIMITE_DIARIO);
      if (!chave) return null;
      return { devolver: () => db.devolver(chave).catch(() => {}) };
    } catch (e) {
      console.error("limite: banco indisponível, usando a memória do servidor", e);
    }
  }
  if (!consumirMemoria(ip)) return null;
  return { devolver: async () => devolverMemoria(ip) };
}

export const MENSAGEM_LIMITE =
  `Você usou as ${LIMITE_DIARIO} consultas novas de hoje. Remédios que outras pessoas já consultaram continuam disponíveis. Volte amanhã para novas consultas.`;

export function ipDe(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "desconhecido";
}

/**
 * Pré-geração em lote (scripts/aquecer-cache.mjs): quem envia o token de administrador não gasta consulta.
 * Fica desligado se BULINHA_ADMIN_TOKEN não existir ou tiver menos de 32 caracteres.
 */
export function ehAdmin(request: Request): boolean {
  const token = process.env.BULINHA_ADMIN_TOKEN;
  if (!token || token.length < 32) return false;
  const enviado = Buffer.from(request.headers.get("x-bulinha-admin") ?? "");
  const esperado = Buffer.from(token);
  return enviado.length === esperado.length && timingSafeEqual(enviado, esperado);
}
