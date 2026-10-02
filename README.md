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
| `BULINHA_LIMITE_DIARIO` | Opcional. Fotos por IP por dia (padrão 20, em memória por instância). |

## Resumo por princípio ativo

`GET /api/resumo?principio=...` gera, com o Claude, um resumo geral da substância (para que serve, efeitos, contraindicações, cuidados, interações), sem doses. **Não é a bula do produto**; a tela deixa isso explícito e aponta o Bulário da ANVISA. Só aceita princípios ativos que existem no catálogo. O resultado é guardado na CDN da Vercel por 30 dias (`s-maxage`), então cada princípio ativo é gerado poucas vezes. Limite por IP para gerações novas: `BULINHA_LIMITE_RESUMOS` (padrão 40/dia).

## Próximos passos

1. Obter o texto oficial das bulas (hoje o resumo é geral, gerado por IA).
2. Busca por nome e resumo estruturado.
3. Foto da caixa com confirmação.
4. Política de privacidade, limite diário e deploy.
