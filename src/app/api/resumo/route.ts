import Anthropic from "@anthropic-ai/sdk";
import { principioExiste } from "@/lib/catalog";
import { MENSAGEM_LIMITE, consumirConsulta, ipDe } from "@/lib/limite";
import { gravarCacheIA, lerCacheIA } from "@/lib/cache-ia";
import { gerarResumo, type Resumo } from "@/lib/resumo";

export const maxDuration = 60;

const erro = (mensagem: string, status: number) =>
  Response.json({ erro: mensagem }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  const principio = new URL(request.url).searchParams.get("principio")?.trim() ?? "";
  if (!principio || !principioExiste(principio)) return erro("Princípio ativo não encontrado.", 404);

  const cabecalhos = { "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=604800" };
  const guardado = await lerCacheIA<Resumo | null>("resumo", principio);
  if (guardado) return Response.json({ resumo: guardado.valor }, { headers: cabecalhos });

  if (!process.env.ANTHROPIC_API_KEY) return erro("Resumo indisponível no momento.", 503);

  const ip = ipDe(request);
  const consumo = await consumirConsulta(ip);
  if (!consumo) return erro(MENSAGEM_LIMITE, 429);

  try {
    const resumo = await gerarResumo(new Anthropic(), principio);
    await gravarCacheIA("resumo", principio, resumo);
    return Response.json({ resumo }, { headers: cabecalhos });
  } catch {
    await consumo.devolver();
    return erro("Não foi possível gerar o resumo agora. Tente de novo.", 502);
  }
}
