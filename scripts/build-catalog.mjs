// Gera src/data/catalog.json a partir dos dados abertos da ANVISA (somente registros ativos).
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

const CATALOG_URL = "https://dados.anvisa.gov.br/dados/DADOS_ABERTOS_MEDICAMENTOS.csv";
// curl respeita HTTPS_PROXY (o fetch do Node, não).
const buf = execFileSync("curl", ["-fsSL", "--max-time", "180", "-A", "Mozilla/5.0 (compatible; Bulina/1.0)", CATALOG_URL], {
  maxBuffer: 64 * 1024 * 1024,
});
const text = new TextDecoder("latin1").decode(buf);
const rows = parse(text, { columns: true, delimiter: ";", relax_quotes: true, skip_empty_lines: true });

const seen = new Set();
const items = [];
for (const r of rows) {
  if (r.SITUACAO_REGISTRO !== "Ativo") continue;
  const nome = r.NOME_PRODUTO.trim();
  const principio = r.PRINCIPIO_ATIVO.trim();
  if (!nome) continue;
  const key = `${nome.toLowerCase()}|${principio.toLowerCase()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  items.push({
    nome,
    principio,
    categoria: r.CATEGORIA_REGULATORIA.trim(),
    classe: r.CLASSE_TERAPEUTICA.trim(),
  });
}
items.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
writeFileSync(new URL("../src/data/catalog.json", import.meta.url), JSON.stringify(items));
console.log(`${items.length} medicamentos ativos gravados`);
