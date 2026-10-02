import { createHash } from "node:crypto";

export type Executar = (texto: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

/** Dia civil de Brasília: o limite diário zera à meia-noite daqui. */
const HOJE = "(now() at time zone 'America/Sao_Paulo')::date";

/**
 * Contador de consultas por IP e cache de resultados de IA, em Postgres.
 * O IP nunca é gravado: guardamos um hash que muda a cada dia (não permite ligar o mesmo IP em dias diferentes).
 */
export function criarArmazenamento(executar: Executar, segredo: string) {
  let pronto: Promise<void> | null = null;

  function iniciar(): Promise<void> {
    pronto ??= (async () => {
      await executar(
        `create table if not exists bulinha_limite (
           chave text not null, dia date not null, n integer not null default 0,
           primary key (chave, dia))`,
      );
      await executar(
        `create table if not exists bulinha_cache (
           tipo text not null, chave text not null, conteudo jsonb not null,
           criado_em timestamptz not null default now(),
           primary key (tipo, chave))`,
      );
      await executar(`delete from bulinha_limite where dia < ${HOJE} - 1`);
    })().catch((e) => {
      pronto = null; // tenta de novo na próxima chamada
      throw e;
    });
    return pronto;
  }

  async function chaveDoDia(ip: string): Promise<string> {
    const [{ dia }] = (await executar(`select ${HOJE}::text as dia`)) as { dia: string }[];
    return createHash("sha256").update(`${ip}|${dia}|${segredo}`).digest("hex");
  }

  return {
    /** Gasta uma consulta de forma atômica. Retorna a chave usada, ou null se o limite do dia já foi atingido. */
    async consumir(ip: string, limite: number): Promise<string | null> {
      await iniciar();
      const chave = await chaveDoDia(ip);
      const linhas = await executar(
        `insert into bulinha_limite (chave, dia, n) values ($1, ${HOJE}, 1)
         on conflict (chave, dia) do update set n = bulinha_limite.n + 1
         where bulinha_limite.n < $2
         returning n`,
        [chave, limite],
      );
      return linhas.length > 0 ? chave : null;
    },

    async devolver(chave: string): Promise<void> {
      await executar(`update bulinha_limite set n = greatest(n - 1, 0) where chave = $1 and dia = ${HOJE}`, [chave]);
    },

    async lerCache(tipo: string, chave: string): Promise<{ conteudo: unknown } | null> {
      await iniciar();
      const linhas = await executar(`select conteudo from bulinha_cache where tipo = $1 and chave = $2`, [tipo, chave]);
      return linhas.length > 0 ? { conteudo: linhas[0].conteudo } : null;
    },

    async gravarCache(tipo: string, chave: string, conteudo: unknown): Promise<void> {
      await iniciar();
      await executar(
        `insert into bulinha_cache (tipo, chave, conteudo) values ($1, $2, $3::jsonb)
         on conflict (tipo, chave) do update set conteudo = excluded.conteudo, criado_em = now()`,
        [tipo, chave, JSON.stringify(conteudo)],
      );
    },
  };
}
export type Armazenamento = ReturnType<typeof criarArmazenamento>;
