const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e", "com", "para", "em"]);

/** "DIPIRONA MONOIDRATADA + CAFEÍNA" -> "Dipirona monoidratada + cafeína" legível; siglas curtas ficam em maiúsculas. */
export function formatarNome(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .map((p, i) => {
      if (p !== p.toUpperCase() || !/[A-ZÀ-Ý]/.test(p)) return p; // já tem caixa mista
      const baixo = p.toLowerCase();
      if (/\d/.test(p) || (p.length <= 3 && i > 0 && !MINUSCULAS.has(baixo)) || p.length <= 2) {
        return MINUSCULAS.has(baixo) ? baixo : p;
      }
      if (MINUSCULAS.has(baixo) && i > 0) return baixo;
      return baixo.charAt(0).toUpperCase() + baixo.slice(1);
    })
    .join(" ");
}

export function primeiraMaiuscula(texto: string): string {
  const t = texto.trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
