# Spike: fonte de dados da ANVISA (02/10/2026)

## Catálogo de medicamentos: funciona
`https://dados.anvisa.gov.br/dados/DADOS_ABERTOS_MEDICAMENTOS.csv` (~8 MB, 43.583 linhas, ~17.300 com `SITUACAO_REGISTRO=Ativo`).
CSV em `latin1`, separador `;`. Colunas: `NOME_PRODUTO`, `PRINCIPIO_ATIVO`, `NUMERO_REGISTRO_PRODUTO`, `CATEGORIA_REGULATORIA` (Similar, Genérico, Novo, Fitoterápico, Baixo risco, Dinamizado...), `CLASSE_TERAPEUTICA`, `EMPRESA_DETENTORA_REGISTRO`, `SITUACAO_REGISTRO`.

Serve para: autocomplete por nome comercial, mapear nome para princípio ativo e nº de registro, filtrar só registros ativos.
Atualização frequente (`DT_CARGA_ETL` de hoje), então dá para recarregar por job agendado.

`TA_CONSULTA_MEDICAMENTOS.CSV` (~18 MB) tem mais campos (indicações, ATC, tarja), mas inclui registros inativos.

## Texto da bula: bloqueado
O texto da bula não está nos dados abertos. Ele está no Bulário Eletrônico (`consultas.anvisa.gov.br/api/consulta/bulario`), que responde **403 (Cloudflare "Attention Required")** a requisições vindas do datacenter. Provavelmente também falharia a partir da Vercel.

## Opções para o texto da bula
1. Testar o Bulário a partir de outra origem (IP residencial/BR) e ver se um proxy próprio resolve. Frágil e pode violar os termos de uso.
2. Descobrir se há API/parceria oficial (ex.: pedir a base via LAI ou contato com a ANVISA).
3. Fontes alternativas de bula com licença clara (ex.: bulas publicadas pelos próprios laboratórios, sujeitas a termos de cada um).
4. Fallback do MVP: usar o catálogo (nome, princípio ativo, classe) e gerar o resumo pela IA com **aviso explícito** de que não vem da bula oficial, apontando o link do Bulário. Menos confiável. Só aceitável com avisos fortes.

## Recomendação
Seguir com o catálogo (busca por nome) e decidir a fonte do texto antes de gerar qualquer resumo clínico. Não gerar conteúdo de bula só da memória do modelo sem sinalizar.
