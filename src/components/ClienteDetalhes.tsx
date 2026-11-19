import type { Agencia, Cliente, Conta } from "../../types/banco";

// Props que o componente recebe da tela principal
interface ClienteDetalhesProps {
  clientes: Cliente[];
  contas: Conta[];
  agencias: Agencia[];
  busca: string;
  onBuscaChange: (novoTexto: string) => void;
}

export function ClienteDetalhes(props: ClienteDetalhesProps) {
  const clientes = props.clientes;
  const contas = props.contas;
  const agencias = props.agencias;
  const busca = props.busca;
  const onBuscaChange = props.onBuscaChange;

  // Tira espaços das pontas e deixa minúsculo para facilitar comparar
  const termo = busca.trim().toLowerCase();

  // Filtra os clientes pelo nome, nome social ou cpf/cnpj
  const clientesFiltrados = clientes.filter((cliente) => {
    if (termo === "") {
      return true;
    }

    const achouNome = cliente.nome.toLowerCase().includes(termo);
    const achouCpf = cliente.cpfCnpj.toLowerCase().includes(termo);
    const achouNomeSocial = cliente.nomeSocial
      ? cliente.nomeSocial.toLowerCase().includes(termo)
      : false;

    return achouNome || achouCpf || achouNomeSocial;
  });

  // Formata valor para real (R$)
  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Formata data sem estourar "Invalid Date" se vier vazia ou inválida
  function formatarData(data: Date) {
    const tempo = data.getTime();

    if (Number.isNaN(tempo)) {
      return "Não informada";
    }

    return data.toLocaleDateString("pt-BR");
  }

  // Pega só os 10 primeiros para não pesar a tela
  const primeirosClientes = clientesFiltrados.slice(0, 10);

  return (
    <section style={{ marginTop: "24px" }}>
      <h2>Clientes, Contas e Agências</h2>

      <input
        type="text"
        placeholder="Buscar por nome, nome social ou CPF/CNPJ..."
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
          maxWidth: "420px",
          marginBottom: "16px",
        }}
      />

      <p>
        Mostrando {primeirosClientes.length} de {clientesFiltrados.length} encontrados
        ({clientes.length} no total)
      </p>

      <div style={{ display: "grid", gap: "12px" }}>
        {primeirosClientes.map((cliente) => {
          // Procura a agência do cliente
          const agencia = agencias.find(
            (ag) => ag.codigo === cliente.codigoAgencia
          );

          // Pega todas as contas desse cliente
          const contasCliente = contas.filter(
            (conta) => conta.cpfCnpjCliente === cliente.cpfCnpj
          );

          return (
            <div
              key={cliente.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <strong>{cliente.nomeSocial || cliente.nome}</strong>
              {cliente.nomeSocial ? (
                <span> (Nome civil: {cliente.nome})</span>
              ) : null}

              <div>
                CPF/CNPJ: {cliente.cpfCnpj} | Estado civil: {cliente.estadoCivil}
              </div>

              <div>
                Nascimento: {formatarData(cliente.dataNascimento)} | Renda anual:{" "}
                {formatarMoeda(cliente.rendaAnual)} | Patrimônio:{" "}
                {formatarMoeda(cliente.patrimonio)}
              </div>

              <div>
                Agência:{" "}
                {agencia
                  ? `${agencia.codigo} - ${agencia.nome}`
                  : `Código ${cliente.codigoAgencia} (não encontrada)`}
              </div>

              <div style={{ marginTop: "8px" }}>
                <strong>Contas ({contasCliente.length}):</strong>

                {contasCliente.length === 0 ? (
                  <div>Nenhuma conta encontrada.</div>
                ) : (
                  <ul>
                    {contasCliente.map((conta) => (
                      <li key={conta.id}>
                        {conta.id} ({conta.tipo}) — Saldo:{" "}
                        {formatarMoeda(conta.saldo)} | Crédito disp.:{" "}
                        {formatarMoeda(conta.creditoDisponivel)} /{" "}
                        {formatarMoeda(conta.limiteCredito)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}