import { neon } from "@neondatabase/serverless";
import { criarArmazenamento, type Armazenamento } from "./armazenamento";

let instancia: Armazenamento | null | undefined;

/** Armazenamento no Neon, ou null se DATABASE_URL não estiver configurada (aí o app usa só a memória). */
export function banco(): Armazenamento | null {
  if (instancia !== undefined) return instancia;
  const url = process.env.DATABASE_URL;
  if (!url) return (instancia = null);
  const sql = neon(url);
  instancia = criarArmazenamento(
    async (texto, params) => (await sql.query(texto, params ?? [])) as Record<string, unknown>[],
    process.env.BULINHA_SEGREDO ?? url,
  );
  return instancia;
}
