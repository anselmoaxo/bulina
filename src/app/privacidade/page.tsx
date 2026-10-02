import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacidade - Bulina" };

export default function Privacidade() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 space-y-5 px-4 py-10 text-zinc-800">
      <Link href="/" className="text-sm text-teal-700 underline">
        ← Voltar
      </Link>
      <h1 className="text-2xl font-bold">Política de privacidade</h1>
      <p className="text-sm text-zinc-500">Última atualização: 02/10/2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Resumo</h2>
        <p>
          A Bulina não pede cadastro, e-mail nem senha. Não guardamos o que você pesquisa nem as
          fotos que você tira.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">O que acontece com a foto</h2>
        <p>
          Ao fotografar a caixa, a imagem é reduzida no seu aparelho e enviada ao nosso servidor, que
          a repassa à Anthropic (serviço de inteligência artificial) apenas para ler o nome do
          remédio. A Bulina não grava a foto. A Anthropic trata os dados conforme seus próprios
          termos e política de privacidade. Por isso, fotografe somente a caixa, sem pessoas,
          documentos ou receitas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Busca por nome</h2>
        <p>
          O texto digitado é usado só para procurar no catálogo de medicamentos da ANVISA e não é
          armazenado.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Dados técnicos</h2>
        <p>
          Para limitar o número de fotos por dia, o servidor usa seu endereço IP temporariamente, em
          memória, sem gravar em banco de dados. A hospedagem (Vercel) pode registrar dados técnicos
          de acesso, como IP e navegador, conforme a política dela. Guardamos no seu aparelho apenas
          a marca de que você concordou com o uso da câmera. Não usamos cookies de rastreamento nem
          anúncios.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Seus direitos (LGPD)</h2>
        <p>
          Você pode pedir informações sobre seus dados, correção ou exclusão, nos termos da Lei
          13.709/2018. Como não mantemos cadastro nem histórico, em regra não há dados pessoais seus
          armazenados por nós.
        </p>
        <p>
          Contato do responsável: <strong>[inserir e-mail de contato]</strong>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Aviso importante</h2>
        <p>
          A Bulina é informativa e não substitui a orientação de um médico ou farmacêutico. Não se
          automedique. Em emergência, ligue para o SAMU (192).
        </p>
      </section>
    </main>
  );
}
