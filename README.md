# Bulina

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

## Próximos passos

1. Definir a fonte de dados da ANVISA (catálogo e texto das bulas).
2. Busca por nome e resumo estruturado.
3. Foto da caixa com confirmação.
4. Política de privacidade, limite diário e deploy.
