import Anthropic from "@anthropic-ai/sdk";
import { buscar } from "@/lib/catalog";
import { dentroDoLimite } from "@/lib/limite";
import { TIPOS_IMAGEM, lerCaixa, type TipoImagem } from "@/lib/ler-caixa";

const TAMANHO_MAX = 5 * 1024 * 1024;

const erro = (mensagem: string, status: number) => Response.json({ erro: mensagem }, { status });

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return erro("Leitura por foto indisponível no momento. Busque pelo nome.", 503);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "desconhecido";
  if (!dentroDoLimite(ip)) {
    return erro("Limite diário de fotos atingido. Tente amanhã ou busque pelo nome.", 429);
  }

  const form = await request.formData().catch(() => null);
  const foto = form?.get("foto");
  if (!(foto instanceof File)) return erro("Envie uma foto.", 400);
  if (!TIPOS_IMAGEM.includes(foto.type as TipoImagem)) {
    return erro("Formato não suportado. Use JPEG, PNG ou WebP.", 400);
  }
  if (foto.size > TAMANHO_MAX) return erro("Foto muito grande (máx. 5 MB).", 413);

  try {
    const base64 = Buffer.from(await foto.arrayBuffer()).toString("base64");
    const leitura = await lerCaixa(new Anthropic(), base64, foto.type as TipoImagem);
    if (!leitura.encontrado || !leitura.nome.trim()) {
      return Response.json({ leitura, candidatos: [] });
    }
    const candidatos = buscar(leitura.nome);
    if (candidatos.length === 0 && leitura.principio_ativo) {
      candidatos.push(...buscar(leitura.principio_ativo));
    }
    return Response.json({ leitura, candidatos });
  } catch {
    return erro("Não foi possível ler a foto agora. Tente de novo ou busque pelo nome.", 502);
  }
}
