import { useEffect, useState } from "react";
import { ClienteDetalhes } from "./components/ClienteDetalhes";
import {
  carregarAgencias,
  carregarClientes,
  carregarContas,
} from "./services/planilhaService";
import type { Agencia, Cliente, Conta } from "../types/banco";

export default function App() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [busca, setBusca] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro(null);

        const [listaClientes, listaContas, listaAgencias] = await Promise.all([
          carregarClientes(),
          carregarContas(),
          carregarAgencias(),
        ]);

        setClientes(listaClientes);
        setContas(listaContas);
        setAgencias(listaAgencias);
      } catch (err) {
        const mensagem =
          err instanceof Error
            ? err.message
            : "Erro ao carregar os dados das planilhas.";
        setErro(mensagem);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  if (carregando) {
    return (
      <main
        style={{
          padding: "24px",
          fontFamily: "sans-serif",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <h1>Sistema Bancário</h1>
        <p>Carregando dados das planilhas...</p>
      </main>
    );
  }

  if (erro) {
    return (
      <main
        style={{
          padding: "24px",
          fontFamily: "sans-serif",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <h1>Sistema Bancário</h1>
        <p style={{ color: "crimson", fontWeight: "bold" }}>
          Falha ao carregar: {erro}
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "24px",
        fontFamily: "sans-serif",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      <h1>Sistema Bancário</h1>

      <ClienteDetalhes
        clientes={clientes}
        contas={contas}
        agencias={agencias}
        busca={busca}
        onBuscaChange={setBusca}
      />
    </main>
  );
}