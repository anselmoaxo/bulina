import Anthropic from "@anthropic-ai/sdk";
import { principioExiste } from "@/lib/catalog";
import { gravarCacheIA, lerCacheIA } from "@/lib/cache-ia";
import { MAX_ITENS, gerarInteracoes, type Interacoes } from "@/lib/interacoes";
import { MENSAGEM_LIMITE, consumirConsulta, ipDe } from "@/lib/limite";

export const maxDuration = 60;

const erro = (mensagem: string, status: number) =>
  Response.json({ erro: mensagem }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams.getAll("p").map((p) => p.trim());
  const principios = [...new Set(params)].sort();

  if (principios.length < 2) return erro("Informe pelo menos dois remédios diferentes.", 400);
  if (principios.length > MAX_ITENS) return erro(`Use no máximo ${MAX_ITENS} remédios.`, 400);
  if (!principios.every(principioExiste)) return erro("Remédio não encontrado.", 404);

  const cabecalhos = { "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=604800" };
  const chave = principios.join("|");
  const guardado = await lerCacheIA<Interacoes | null>("interacoes", chave);
  if (guardado) return Response.json({ interacoes: guardado.valor }, { headers: cabecalhos });

  if (!process.env.ANTHROPIC_API_KEY) return erro("Checagem indisponível no momento.", 503);

  const ip = ipDe(request);
  const consumo = await consumirConsulta(ip);
  if (!consumo) return erro(MENSAGEM_LIMITE, 429);

  try {
    const interacoes = await gerarInteracoes(new Anthropic(), principios);
    await gravarCacheIA("interacoes", chave, interacoes);
    return Response.json({ interacoes }, { headers: cabecalhos });
  } catch {
    await consumo.devolver();
    return erro("Não foi possível checar agora. Tente de novo.", 502);
  }
}
