# Bulinha

App web (PWA) para consultar remédios: para que serve, como usar, efeitos colaterais e cuidados, como uma bula resumida em linguagem simples. A busca é por nome ou por foto da caixa.

> Este app não substitui a orientação de um médico ou farmacêutico.

## Escopo do MVP

- Busca por nome comercial ou princípio ativo.
- Foto da caixa: a IA lê o nome, o usuário confirma antes da consulta.
- Resumo estruturado da bula: indicação, uso, efeitos colaterais (comuns e graves), contraindicações, interações, armazenamento.
- Dados vindos da bula oficial (ANVISA); a IA só resume o texto real e informa a fonte.
- Sem login. Fotos não são armazenadas. Gratuito, com limite diário de consultas.

Fora do MVP: login, chat de perguntas, histórico, lembretes, outros países.

## Stack

Next.js (App Router) + TypeScript + Tailwind, API do Claude para visão e resumo, deploy na Vercel.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Catálogo de medicamentos

A busca usa `src/data/catalog.json`, gerado a partir dos dados abertos da ANVISA (só registros ativos). Para atualizar:

```bash
node scripts/build-catalog.mjs
```

Detalhes e limites da fonte em `docs/spike-anvisa.md` (o texto da bula ainda não tem fonte definida).

## Foto da caixa

`POST /api/identificar` recebe a foto (`multipart`, campo `foto`; JPEG/PNG/WebP até 5 MB), usa a API do Claude para ler o nome na embalagem e devolve candidatos do catálogo para o usuário confirmar. A foto não é gravada. A tela reduz a imagem no aparelho antes de enviar.

Variáveis de ambiente (no servidor; **nunca** commitar):

| Variável | Uso |
|---|---|
| `ANTHROPIC_API_KEY` | Obrigatória para a foto. Local: `.env.local`. Produção: variáveis do projeto na Vercel. Sem ela, o endpoint responde 503 e a busca por nome continua funcionando. |
| `BULINHA_MODEL` | Opcional. Padrão `claude-opus-5-5`. |
| `DATABASE_URL` | Postgres (Neon, via Marketplace da Vercel). Guarda o contador de consultas por IP e os resultados de IA já gerados; as tabelas `bulinha_limite` e `bulinha_cache` são criadas sozinhas na primeira execução. Sem ela, o app usa só a memória do servidor. |
| `BULINHA_SEGREDO` | Opcional. Segredo misturado ao hash do IP (padrão: derivado de `DATABASE_URL`). |
| `BULINHA_LIMITE_DIARIO` | Opcional. Consultas novas por IP por dia, somando foto, resumo e interações (padrão 5; contador compartilhado no banco). Resultados já em cache não contam; falha da IA devolve a consulta. |

## Resumo por princípio ativo

`GET /api/resumo?principio=...` gera, com o Claude, um resumo geral da substância (para que serve, efeitos, contraindicações, cuidados, interações), sem doses. **Não é a bula do produto**; a tela deixa isso explícito e aponta o Bulário da ANVISA. Só aceita princípios ativos que existem no catálogo. O resultado é guardado no banco e na CDN da Vercel, então cada princípio ativo é gerado uma única vez (mude `VERSAO` em `src/lib/cache-ia.ts` ao melhorar o prompt, para regenerar).

## Meus remédios e leitura em voz alta

- **Meus remédios** (`/meus-remedios`): lista de até 10 remédios guardada só no aparelho (`localStorage`), sem login. `GET /api/interacoes?p=...` recebe apenas princípios ativos (validados no catálogo) e gera, com o Claude, possíveis interações e substâncias repetidas; cache de 30 dias na CDN. Duplicidades de princípio ativo idênticas são detectadas no próprio navegador, sem IA.
- **Ouvir** (`src/app/ouvir.tsx`): leitura com a Web Speech API (voz do aparelho, nada sai do dispositivo); divide o texto em trechos curtos e permite falar mais devagar.

## Próximos passos

1. Obter o texto oficial das bulas (hoje o resumo é geral, gerado por IA).
2. Busca por nome e resumo estruturado.
3. Foto da caixa com confirmação.
4. Política de privacidade, limite diário e deploy.
