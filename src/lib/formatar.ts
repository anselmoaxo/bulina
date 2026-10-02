const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e", "com", "para", "em"]);

function formatarParte(parte: string): string {
  return parte
    .trim()
    .split(/\s+/)
    .map((p, i) => {
      if (p !== p.toUpperCase() || !/[A-ZÀ-Ý]/.test(p)) return p; // já tem caixa mista
      const baixo = p.toLowerCase();
      if (MINUSCULAS.has(baixo) && i > 0) return baixo;
      if (/\d/.test(p) || p.length <= 3) return p; // siglas e doses: AAS, B12, 500MG
      return baixo.charAt(0).toUpperCase() + baixo.slice(1);
    })
    .join(" ");
}

/** "PARACETAMOL+FOSFATO DE CODEÍNA" -> "Paracetamol + Fosfato de Codeína". */
export function formatarNome(nome: string): string {
  return nome.split("+").map(formatarParte).filter(Boolean).join(" + ");
}

// Os dados da ANVISA vêm sem acento. Restauramos as palavras mais comuns das classes terapêuticas.
const ACENTOS: Record<string, string> = {
  nao: "não", acao: "ação", analgesicos: "analgésicos", narcoticos: "narcóticos",
  antibioticos: "antibióticos", sistemicos: "sistêmicos", sistemica: "sistêmica",
  associacoes: "associações", associacao: "associação", topicos: "tópicos", topico: "tópico",
  antineoplasico: "antineoplásico", antineoplasicos: "antineoplásicos",
  histaminicos: "histamínicos", anestesicos: "anestésicos", antiemeticos: "antieméticos",
  antiespasmodicos: "antiespasmódicos", ansioliticos: "ansiolíticos", antimicoticos: "antimicóticos",
  antimicotico: "antimicótico", hipnoticos: "hipnóticos", estrogenos: "estrógenos",
  androgenos: "andrógenos", progestagenos: "progestágenos", balsamicos: "balsâmicos",
  oftalmicos: "oftálmicos", oftalmico: "oftálmico", terapeutica: "terapêutica",
  sintomatica: "sintomática", urinario: "urinário", ossea: "óssea", reabsorcao: "reabsorção",
  hormonios: "hormônios", hormonio: "hormônio", farmacos: "fármacos", diureticos: "diuréticos",
  neurolepticos: "neurolépticos", antiacidos: "antiácidos", antialergicos: "antialérgicos",
  ginecologicos: "ginecológicos", anticolinergicos: "anticolinérgicos",
  antitussigenos: "antitussígenos", alimentacao: "alimentação", reposicao: "reposição",
  replicacao: "replicação", hemodialise: "hemodiálise", citotoxicos: "citotóxicos",
  mucolitico: "mucolítico", antilipemicos: "antilipêmicos", antianemicos: "antianêmicos",
  diagnosticos: "diagnósticos", fracoes: "frações", hidroeletrolitica: "hidroeletrolítica",
  antireumaticos: "antirreumáticos", antinflamatorios: "anti-inflamatórios",
  antiinflamatorios: "anti-inflamatórios", antidiabeticos: "antidiabéticos",
  antiviroticos: "antivirais", antiasmaticos: "antiasmáticos",
};

/** "ANALGESICOS NARCOTICOS" -> "Analgésicos narcóticos". */
export function formatarClasse(classe: string): string {
  const t = classe
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => ACENTOS[p] ?? p)
    .join(" ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Classes de medicamentos controlados (opioides): exigem receita retida. */
export function ehControlado(classe: string): boolean {
  return /(^|\s)narcoticos/i.test(classe) && !/nao\s+narcoticos/i.test(classe);
}
