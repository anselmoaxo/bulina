import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"] as const;
export type TipoImagem = (typeof TIPOS_IMAGEM)[number];

const Leitura = z.object({
  encontrado: z.boolean(),
  nome: z.string(),
  principio_ativo: z.string(),
});
export type Leitura = z.infer<typeof Leitura>;

const INSTRUCAO =
  "Esta imagem deve mostrar a embalagem de um medicamento. Leia apenas o que está impresso: " +
  "o nome comercial (ou o nome do genérico) e o princípio ativo, se aparecerem. " +
  "Se a imagem não mostrar claramente uma embalagem de medicamento, ou o nome estiver ilegível, " +
  "responda encontrado=false e deixe os textos vazios. Não adivinhe nem complete o que não está visível.";

/** Lê o nome do medicamento numa foto de caixa. A imagem não é guardada. */
export async function lerCaixa(
  client: Pick<Anthropic, "messages">,
  imagemBase64: string,
  tipo: TipoImagem,
): Promise<Leitura> {
  const resposta = await client.messages.parse({
    model: process.env.BULINHA_MODEL ?? "claude-opus-5-5",
    max_tokens: 2000,
    output_config: { effort: "low", format: zodOutputFormat(Leitura) },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: tipo, data: imagemBase64 } },
          { type: "text", text: INSTRUCAO },
        ],
      },
    ],
  });
  return resposta.parsed_output ?? { encontrado: false, nome: "", principio_ativo: "" };
}
