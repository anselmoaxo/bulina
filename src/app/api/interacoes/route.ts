import Anthropic from "@anthropic-ai/sdk";
import { principioExiste } from "@/lib/catalog";
import { MAX_ITENS, gerarInteracoes, type Interacoes } from "@/lib/interacoes";
import { dentroDoLimite } from "@/lib/limite";

export const maxDuration = 60;

const memoria = new Map<string, Interacoes | null>();

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
  if (memoria.has(chave)) return Response.json({ interacoes: memoria.get(chave) }, { headers: cabecalhos });

  if (!process.env.ANTHROPIC_API_KEY) return erro("Checagem indisponível no momento.", 503);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "desconhecido";
  if (!dentroDoLimite(ip, "interacoes", Number(process.env.BULINHA_LIMITE_INTERACOES ?? 15))) {
    return erro("Muitas checagens hoje. Tente novamente amanhã.", 429);
  }

  try {
    const interacoes = await gerarInteracoes(new Anthropic(), principios);
    memoria.set(chave, interacoes);
    return Response.json({ interacoes }, { headers: cabecalhos });
  } catch {
    return erro("Não foi possível checar agora. Tente de novo.", 502);
  }
}
