#!/usr/bin/env node
// Pré-gera os resumos dos princípios ativos mais comuns, para a primeira pessoa a consultar não esperar.
// Chama o próprio site (as chaves de IA e do banco continuam só na Vercel) com o token de administrador.
//
//   BULINHA_ADMIN_TOKEN=... node scripts/aquecer-cache.mjs --limite 300
//   node scripts/aquecer-cache.mjs --limite 300 --listar        (só mostra a lista, não gasta nada)
//
// Opções: --limite N (padrão 50) | --paralelo N (padrão 3) | --listar | BULINHA_URL=https://... (padrão bulina.vercel.app)
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : padrao;
};
const limite = opcao("limite", 50);
const paralelo = opcao("paralelo", 3);
const soListar = args.includes("--listar");
const base = (process.env.BULINHA_URL ?? "https://bulina.vercel.app").replace(/\/$/, "");
const token = process.env.BULINHA_ADMIN_TOKEN;

// Ordem de prioridade: 1) substâncias muito usadas no Brasil (lista abaixo), 2) as demais, por número de
// medicamentos ativos no catálogo que as usam.
const COMUNS = [
  "dipirona", "paracetamol", "ibuprofeno", "acido acetilsalicilico", "diclofenaco", "nimesulida", "cetoprofeno", "naproxeno",
  "amoxicilina", "azitromicina", "cefalexina", "ciprofloxacino", "sulfametoxazol", "metronidazol", "claritromicina", "ceftriaxona",
  "losartana", "enalapril", "captopril", "anlodipino", "atenolol", "propranolol", "carvedilol", "metoprolol", "hidroclorotiazida",
  "furosemida", "espironolactona", "valsartana", "olmesartana", "metformina", "glibenclamida", "glimepirida", "gliclazida",
  "insulina", "sinvastatina", "atorvastatina", "rosuvastatina", "omeprazol", "pantoprazol", "esomeprazol", "domperidona",
  "ondansetrona", "metoclopramida", "loratadina", "desloratadina", "cetirizina", "dexclorfeniramina", "prednisona",
  "prednisolona", "dexametasona", "betametasona", "salbutamol", "budesonida", "fluoxetina", "sertralina", "escitalopram",
  "citalopram", "amitriptilina", "paroxetina", "venlafaxina", "bupropiona", "clonazepam", "alprazolam", "diazepam",
  "zolpidem", "carbamazepina", "fenitoina", "levetiracetam", "acido valproico", "pregabalina", "gabapentina", "levotiroxina",
  "varfarina", "rivaroxabana", "clopidogrel", "acido folico", "colecalciferol", "sulfato ferroso", "cianocobalamina",
  "simeticona", "butilbrometo de escopolamina", "tramadol", "codeina", "morfina", "fluconazol", "nistatina", "ivermectina",
  "albendazol", "loperamida", "sildenafila", "tadalafila", "finasterida", "tansulosina", "alendronato", "cloreto de sodio",
  "etinilestradiol", "levonorgestrel", "medroxiprogesterona", "ranitidina", "ambroxol", "acetilcisteina", "bromoprida",
  "sulfadiazina de prata", "aciclovir", "cetorolaco", "orfenadrina", "ciclobenzaprina", "tizanidina", "fexofenadina",
];
const semAcento = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

const catalogo = JSON.parse(readFileSync(new URL("../src/data/catalog.json", import.meta.url), "utf8"));
const contagem = new Map();
for (const m of catalogo) if (m.principio) contagem.set(m.principio, (contagem.get(m.principio) ?? 0) + 1);
const porContagem = [...contagem].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

const escolhidos = new Map();
for (const termo of COMUNS) {
  // até 2 grafias do catálogo por substância (ex.: "dipirona" e "dipirona monoidratada"), preferindo as mais simples
  const achados = porContagem
    .filter(([p]) => semAcento(p).includes(termo) && p.split(",").length <= 2)
    .sort((a, b) => a[0].split(",").length - b[0].split(",").length || b[1] - a[1])
    .slice(0, 2);
  for (const [p, n] of achados) escolhidos.set(p, n);
}
for (const [p, n] of porContagem) escolhidos.set(p, escolhidos.get(p) ?? n);
const lista = [...escolhidos].slice(0, limite);

if (soListar) {
  lista.forEach(([p, n], i) => console.log(`${String(i + 1).padStart(3)}. ${p} (${n} medicamentos)`));
  console.log(`\n${lista.length} princípios ativos.`);
  process.exit(0);
}
if (!token || token.length < 32) {
  console.error("Defina BULINHA_ADMIN_TOKEN (o mesmo valor configurado na Vercel, com 32+ caracteres).");
  process.exit(1);
}

async function gerar(principio) {
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const res = await fetch(`${base}/api/resumo?principio=${encodeURIComponent(principio)}`, {
        headers: { "x-bulinha-admin": token },
        signal: AbortSignal.timeout(90_000),
      });
      if (res.ok) return { ok: true, vazio: (await res.json()).resumo === null };
      if (res.status === 429) return { ok: false, erro: "limite atingido: token de administrador recusado?" };
      if (res.status === 404 || res.status === 503) return { ok: false, erro: `HTTP ${res.status}`, parar: res.status === 503 };
    } catch {}
    await new Promise((r) => setTimeout(r, 2000 * tentativa));
  }
  return { ok: false, erro: "falhou após 3 tentativas" };
}

let feitos = 0;
let falhas = [];
let naoReconhecidos = [];
let proximo = 0;
const inicio = Date.now();

async function trabalhador() {
  while (proximo < lista.length) {
    const [principio] = lista[proximo++];
    const r = await gerar(principio);
    feitos++;
    if (!r.ok) falhas.push(`${principio}: ${r.erro}`);
    else if (r.vazio) naoReconhecidos.push(principio);
    const min = ((Date.now() - inicio) / 60000).toFixed(1);
    console.log(`[${feitos}/${lista.length}] ${r.ok ? (r.vazio ? "sem resumo" : "ok") : "ERRO"}  ${principio}  (${min} min)`);
    if (r.parar) process.exit(1);
  }
}

console.log(`Gerando ${lista.length} resumos em ${base} (${paralelo} em paralelo). Pode interromper e rodar de novo: o que já está pronto é pulado.`);
await Promise.all(Array.from({ length: paralelo }, trabalhador));
console.log(`\nConcluído em ${((Date.now() - inicio) / 60000).toFixed(1)} min. ${lista.length - falhas.length} ok, ${falhas.length} com erro.`);
if (naoReconhecidos.length) console.log(`Sem resumo (IA não reconheceu): ${naoReconhecidos.join("; ")}`);
if (falhas.length) console.log(`Erros:\n  ${falhas.join("\n  ")}`);
