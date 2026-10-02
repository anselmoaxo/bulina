import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const Interacoes = z.object({
  pares: z.array(
    z.object({
      a: z.string(),
      b: z.string(),
      gravidade: z.enum(["grave", "moderada", "leve"]),
      explicacao: z.string(),
      o_que_fazer: z.string(),
    }),
  ),
  substancias_repetidas: z.array(z.object({ substancia: z.string(), itens: z.array(z.string()), explicacao: z.string() })),
  observacao_geral: z.string(),
});
export type Interacoes = z.infer<typeof Interacoes>;

export const MAX_ITENS = 10;

const SISTEMA = `Você explica, para o público geral brasileiro e em português do Brasil, possíveis interações entre substâncias de medicamentos que uma pessoa usa, em linguagem simples, frases curtas e sem jargão.

Regras:
- Você recebe uma lista de princípios ativos (um por linha). Analise todos os pares e liste em "pares" apenas as combinações com interação conhecida e relevante. Não invente: se não tiver certeza de uma interação, não a liste.
- Em "gravidade", use "grave" apenas para riscos que podem exigir atendimento urgente ou evitar a combinação, "moderada" para combinações que pedem cuidado e orientação, e "leve" para efeitos menores.
- Em "explicacao", diga o que pode acontecer, em até 2 frases. Use os nomes dos princípios exatamente como foram dados em "a" e "b".
- Em "o_que_fazer", oriente de forma geral e cautelosa: conversar com o médico ou o farmacêutico antes de usar juntos, e sinais para ficar atento. NUNCA mande a pessoa parar, trocar ou ajustar um remédio por conta própria, e NUNCA informe doses, horários ou quantidades.
- Em "substancias_repetidas", liste substâncias que aparecem em mais de um item (por exemplo, o mesmo princípio ativo em dois remédios ou dentro de uma combinação), pois isso pode causar excesso. Informe a substância, os itens em que aparece e uma explicação curta.
- Em "observacao_geral", escreva 1 ou 2 frases. Se não houver interações relevantes conhecidas, diga isso e deixe claro que isso não garante que o uso conjunto seja seguro. Lembre que ervas, vitaminas e álcool também interagem.
- Se algum nome não for uma substância de medicamento que você reconheça, ignore-o e avise isso na observação geral.`;

/** Gera possíveis interações entre princípios ativos. Recebe apenas nomes de substâncias, nenhum dado pessoal. */
export async function gerarInteracoes(
  client: Pick<Anthropic, "messages">,
  principios: string[],
): Promise<Interacoes | null> {
  const resposta = await client.messages.parse({
    model: process.env.BULINHA_MODEL ?? "claude-opus-5-5",
    max_tokens: 6000,
    system: SISTEMA,
    output_config: { effort: "low", format: zodOutputFormat(Interacoes) },
    messages: [{ role: "user", content: `Princípios ativos:\n${principios.map((p) => `- ${p}`).join("\n")}` }],
  });
  return resposta.parsed_output;
}
