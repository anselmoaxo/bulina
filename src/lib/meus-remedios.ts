import { useSyncExternalStore } from "react";

export type ItemLista = { nome: string; principio: string };

const CHAVE = "bulinha:meus-remedios";
const EVENTO = "bulinha:lista";
export const MAX_LISTA = 10;
const VAZIA: ItemLista[] = [];

let cache: { raw: string | null; lista: ItemLista[] } = { raw: null, lista: VAZIA };

function ler(): ItemLista[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(CHAVE);
  } catch {
    return VAZIA;
  }
  if (raw === cache.raw) return cache.lista;
  let lista = VAZIA;
  try {
    const dados = JSON.parse(raw ?? "[]");
    if (Array.isArray(dados)) {
      lista = dados.filter(
        (i): i is ItemLista => typeof i?.nome === "string" && typeof i?.principio === "string",
      );
    }
  } catch {}
  cache = { raw, lista };
  return lista;
}

function gravar(lista: ItemLista[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

function assinar(aviso: () => void) {
  window.addEventListener("storage", aviso);
  window.addEventListener(EVENTO, aviso);
  return () => {
    window.removeEventListener("storage", aviso);
    window.removeEventListener(EVENTO, aviso);
  };
}

export function useMeusRemedios(): ItemLista[] {
  return useSyncExternalStore(assinar, ler, () => VAZIA);
}

export const mesmoItem = (a: ItemLista, b: ItemLista) => a.nome === b.nome && a.principio === b.principio;

export function adicionarRemedio(item: ItemLista): boolean {
  const lista = ler();
  if (lista.some((i) => mesmoItem(i, item))) return true;
  if (lista.length >= MAX_LISTA) return false;
  gravar([...lista, item]);
  return true;
}

export function removerRemedio(item: ItemLista) {
  gravar(ler().filter((i) => !mesmoItem(i, item)));
}
