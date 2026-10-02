import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacidade - Bulinha" };

export default function Privacidade() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 space-y-6 px-4 py-8 ">
      <Link href="/" className="text-sm font-bold text-marca underline">
        Voltar
      </Link>
      <h1 className="text-4xl leading-tight font-extrabold">Política de privacidade</h1>
      <p className="text-sm text-muted">Última atualização: 02/10/2026</p>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold">Resumo</h2>
        <p>
          A Bulinha não pede cadastro, e-mail nem senha. Não guardamos o que você pesquisa nem as
          fotos que você tira.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold">O que acontece com a foto</h2>
        <p>
          Ao fotografar a caixa, a imagem é reduzida no seu aparelho e enviada ao nosso servidor, que
          a repassa à Anthropic (serviço de inteligência artificial) apenas para ler o nome do
          remédio. A Bulinha não grava a foto. A Anthropic trata os dados conforme seus próprios
          termos e política de privacidade. Por isso, fotografe somente a caixa, sem pessoas,
          documentos ou receitas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold">Busca por nome</h2>
        <p>
          O texto digitado é usado só para procurar no catálogo de medicamentos da ANVISA e não é
          armazenado.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold">Meus remédios</h2>
        <p>
          A lista de remédios que você monta fica salva apenas no seu aparelho, no navegador. Nós não
          temos acesso a ela. Para checar interações, enviamos à Anthropic somente os nomes das
          substâncias dos remédios da lista, sem nenhum dado seu. Se você limpar os dados do navegador,
          a lista é apagada.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold">Ler em voz alta</h2>
        <p>
          A leitura em voz alta usa a voz do seu próprio aparelho. O texto não é enviado a nenhum
          serviço para isso.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold">Dados técnicos</h2>
        <p>
          Para gerar o resumo de um medicamento, enviamos à Anthropic apenas o nome do princípio ativo, sem
          nenhum dado seu. Para limitar o número de consultas por dia, guardamos em um banco de dados uma
          versão embaralhada (hash) do seu endereço IP, que muda a cada dia e não permite descobrir o IP
          original; esses registros são apagados depois de um dia. Os resumos gerados ficam guardados para
          todos e não contêm dado pessoal. A hospedagem (Vercel) pode registrar dados técnicos
          de acesso, como IP e navegador, conforme a política dela. Guardamos no seu aparelho apenas
          a marca de que você concordou com o uso da câmera. Não usamos cookies de rastreamento nem
          anúncios.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold">Seus direitos (LGPD)</h2>
        <p>
          Você pode pedir informações sobre seus dados, correção ou exclusão, nos termos da Lei
          13.709/2018. Como não mantemos cadastro nem histórico, em regra não há dados pessoais seus
          armazenados por nós.
        </p>
        <p>
          Contato do responsável: <a className="font-bold underline" href="mailto:anselmotech2025@gmail.com">anselmotech2025@gmail.com</a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold">Aviso importante</h2>
        <p>
          A Bulinha é informativa e não substitui a orientação de um médico ou farmacêutico. Não se
          automedique. Em emergência, ligue para o SAMU (192).
        </p>
      </section>
    </main>
  );
}
