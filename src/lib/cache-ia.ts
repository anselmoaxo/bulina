import { banco } from "./db";

// Cache dos resultados gerados por IA. Com o banco, cada resultado é guardado para sempre (até mudar a VERSAO);
// sem ele, só na memória do servidor. Aumente a VERSAO ao melhorar um prompt para regenerar os resultados.
export const VERSAO = "v1";

const memoria = new Map<string, unknown>();

export async function lerCacheIA<T>(tipo: string, chave: string): Promise<{ valor: T } | null> {
  const k = `${tipo}|${VERSAO}:${chave}`;
  if (memoria.has(k)) return { valor: memoria.get(k) as T };
  const db = banco();
  if (!db) return null;
  try {
    const achado = await db.lerCache(tipo, `${VERSAO}:${chave}`);
    if (!achado) return null;
    memoria.set(k, achado.conteudo);
    return { valor: achado.conteudo as T };
  } catch (e) {
    console.error("cache: banco indisponível", e);
    return null;
  }
}

export async function gravarCacheIA(tipo: string, chave: string, valor: unknown): Promise<void> {
  memoria.set(`${tipo}|${VERSAO}:${chave}`, valor);
  const db = banco();
  if (!db) return;
  try {
    await db.gravarCache(tipo, `${VERSAO}:${chave}`, valor);
  } catch (e) {
    console.error("cache: não foi possível gravar", e);
  }
}
