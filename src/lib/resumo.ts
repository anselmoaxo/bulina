import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// A geração é dividida em duas partes que rodam em paralelo (metade do tempo de espera).
const ParteUm = z.object({
  reconhecido: z.boolean(),
  para_que_serve: z.string(),
  como_age: z.string(),
  efeitos_comuns: z.array(z.string()),
  efeitos_graves: z.array(z.string()),
});
const ParteDois = z.object({
  nao_use_se: z.array(z.string()),
  cuidados_especiais: z.array(z.string()),
  interacoes: z.array(z.string()),
});
export type Resumo = z.infer<typeof ParteUm> & z.infer<typeof ParteDois>;

const SISTEMA = `Você escreve resumos informativos sobre substâncias de medicamentos para o público geral brasileiro, em português do Brasil, em linguagem simples (nível de ensino fundamental), frases curtas, sem jargão. Quando precisar de um termo técnico, explique entre parênteses.

Regras:
- Descreva a substância (princípio ativo) em geral, como em uma bula de paciente. Você NÃO está vendo a bula de um produto específico.
- NUNCA informe doses, quantidades, horários ou duração de uso, e nunca diga como tratar uma pessoa.
- Inclua apenas informações bem estabelecidas. Se não tiver certeza de algo, omita em vez de adivinhar.
- Em efeitos_comuns, liste os mais frequentes. Em efeitos_graves, liste os sinais que exigem procurar atendimento médico com urgência.
- Em nao_use_se, liste contraindicações principais (alergias, doenças, situações).
- Em cuidados_especiais, cubra gravidez, amamentação, idosos, crianças, álcool e direção/máquinas quando forem relevantes.
- Em interacoes, liste os tipos de remédios ou substâncias mais importantes que interagem.
- Se o princípio ativo é uma combinação, cubra cada componente e deixe claro de qual se trata em cada item.
- Cada lista deve ter de 3 a 6 itens curtos, e cada texto corrido no máximo 2 frases. Se o nome não for uma substância de medicamento que você reconheça com segurança, responda reconhecido=false e deixe os textos e as listas vazios. Preencha apenas as seções pedidas na mensagem.`;

async function gerarParte<T extends z.ZodType>(
  client: Pick<Anthropic, "messages">,
  schema: T,
  principio: string,
  secoes: string,
): Promise<z.infer<T> | null> {
  const resposta = await client.messages.parse({
    model: process.env.BULINHA_MODEL ?? "claude-opus-5-5",
    max_tokens: 4000,
    system: SISTEMA,
    output_config: { effort: "low", format: zodOutputFormat(schema) },
    messages: [
      { role: "user", content: `Princípio ativo: ${principio}\n\nPreencha somente estas seções: ${secoes}.` },
    ],
  });
  return resposta.parsed_output;
}

/** Gera o resumo geral de um princípio ativo. Não usa dados de pessoas. */
export async function gerarResumo(
  client: Pick<Anthropic, "messages">,
  principio: string,
): Promise<Resumo | null> {
  const [um, dois] = await Promise.all([
    gerarParte(client, ParteUm, principio, "reconhecido, para_que_serve, como_age, efeitos_comuns, efeitos_graves"),
    gerarParte(client, ParteDois, principio, "nao_use_se, cuidados_especiais, interacoes"),
  ]);
  if (!um || !dois || !um.reconhecido) return null;
  return { ...um, ...dois };
}
