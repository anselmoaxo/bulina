#!/usr/bin/env node
// Testa se o Bulário Eletrônico da ANVISA responde a partir DESTE computador e mostra o formato real da resposta.
// Não grava nada além de um PDF de teste em ./tmp. Uso:  node scripts/bulario-sondar.mjs [nome]   (padrão: dipirona)
import { mkdirSync, writeFileSync } from "node:fs";

const nome = process.argv[2] ?? "dipirona";
const BASE = "https://consultas.anvisa.gov.br/api/consulta";
const cabecalhos = {
  Authorization: "Guest",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "pt-BR,pt;q=0.9",
  Origin: "https://consultas.anvisa.gov.br",
  Referer: "https://consultas.anvisa.gov.br/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

const bloqueado = (res, corpo) =>
  res.status === 403 || /cloudflare|attention required|just a moment/i.test(corpo.slice(0, 2000));

console.log(`1) Buscando "${nome}" no Bulário...`);
const url = `${BASE}/bulario?count=3&filter%5BnomeProduto%5D=${encodeURIComponent(nome)}&page=1`;
let res, texto;
try {
  res = await fetch(url, { headers: cabecalhos, signal: AbortSignal.timeout(30_000) });
  texto = await res.text();
} catch (e) {
  console.log(`   FALHOU: ${e.message}. Verifique a internet/proxy/antivírus.`);
  process.exit(1);
}
console.log(`   HTTP ${res.status} | ${res.headers.get("content-type")}`);
if (bloqueado(res, texto)) {
  console.log("\nRESULTADO: BLOQUEADO pela proteção do site (Cloudflare). Este computador/rede também é barrado.");
  console.log("Alternativas: tentar de outra rede, ou usar outra fonte (Formulário Terapêutico Nacional).");
  process.exit(2);
}

let json;
try {
  json = JSON.parse(texto);
} catch {
  console.log("   A resposta não é JSON. Início:\n" + texto.slice(0, 500));
  process.exit(3);
}
const itens = json.content ?? json.items ?? json.data ?? [];
console.log(`   Total informado: ${json.totalElements ?? json.total ?? "?"} | itens nesta página: ${itens.length}`);
if (!itens.length) {
  console.log("   Sem itens. Resposta (início):\n" + texto.slice(0, 800));
  process.exit(3);
}
console.log("   Campos do primeiro item:", Object.keys(itens[0]).join(", "));
console.log("   Primeiro item:", JSON.stringify(itens[0], null, 2).slice(0, 1200));

const item = itens.find((i) => i.idBulaPacienteProtegido) ?? itens[0];
const id = item.idBulaPacienteProtegido;
if (!id) {
  console.log("\nNão achei o campo 'idBulaPacienteProtegido'. Me envie a saída acima para eu ajustar o script.");
  process.exit(3);
}

console.log(`\n2) Baixando a bula do paciente de "${item.nomeProduto ?? item.nome ?? "?"}"...`);
const urlPdf = `${BASE}/medicamentos/arquivo/bula/parecer/${id}/?Authorization=`;
const r2 = await fetch(urlPdf, { headers: cabecalhos, signal: AbortSignal.timeout(60_000) });
const buf = Buffer.from(await r2.arrayBuffer());
const ehPdf = buf.subarray(0, 5).toString() === "%PDF-";
console.log(`   HTTP ${r2.status} | ${r2.headers.get("content-type")} | ${buf.length} bytes | PDF válido: ${ehPdf}`);
if (ehPdf) {
  mkdirSync("tmp", { recursive: true });
  writeFileSync("tmp/bula-teste.pdf", buf);
  console.log("   Salvo em tmp/bula-teste.pdf");
  console.log("\nRESULTADO: LIBERADO. Dá para montar o pipeline neste computador.");
} else {
  console.log("   Não veio um PDF. Início da resposta:\n" + buf.subarray(0, 400).toString());
  console.log("\nRESULTADO: a busca funciona, mas o download do PDF precisa de ajuste. Me envie esta saída.");
  process.exit(3);
}
