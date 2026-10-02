/** Abre a impressão do navegador, de onde a pessoa escolhe "Salvar como PDF". O título vira o nome sugerido do arquivo. */
export function salvarPdf(titulo: string) {
  const original = document.title;
  document.title = titulo;
  window.addEventListener("afterprint", () => (document.title = original), { once: true });
  window.print();
}
