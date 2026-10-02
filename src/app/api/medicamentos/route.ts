import { buscar } from "@/lib/catalog";

export function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return Response.json({ resultados: buscar(q.slice(0, 80)) });
}
