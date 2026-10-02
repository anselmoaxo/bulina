import Anthropic from "@anthropic-ai/sdk";
import { principioExiste } from "@/lib/catalog";
import { MENSAGEM_LIMITE, consumirConsulta, devolverConsulta, ipDe } from "@/lib/limite";
import { gerarResumo, type Resumo } from "@/lib/resumo";

export const maxDuration = 60;

// Cache por instância; o cache principal é o da CDN (s-maxage abaixo).
const memoria = new Map<string, Resumo | null>();

const erro = (mensagem: string, status: number) =>
  Response.json({ erro: mensagem }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  const principio = new URL(request.url).searchParams.get("principio")?.trim() ?? "";
  if (!principio || !principioExiste(principio)) return erro("Princípio ativo não encontrado.", 404);

  const cabecalhos = { "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=604800" };
  if (memoria.has(principio)) return Response.json({ resumo: memoria.get(principio) }, { headers: cabecalhos });

  if (!process.env.ANTHROPIC_API_KEY) return erro("Resumo indisponível no momento.", 503);

  const ip = ipDe(request);
  if (!consumirConsulta(ip)) return erro(MENSAGEM_LIMITE, 429);

  try {
    const resumo = await gerarResumo(new Anthropic(), principio);
    memoria.set(principio, resumo);
    return Response.json({ resumo }, { headers: cabecalhos });
  } catch {
    devolverConsulta(ip);
    return erro("Não foi possível gerar o resumo agora. Tente de novo.", 502);
  }
}
