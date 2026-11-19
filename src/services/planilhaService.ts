import Papa from "papaparse";
import type { Agencia, Cliente, Conta, EstadoCivil, TipoConta } from "../../types/banco";

// Links das planilhas do Google Sheets exportadas como CSV
const URL_CLIENTES =
  "https://docs.google.com/spreadsheets/d/1LkyaeCgiyaIN1IxXnbZQPmVMIcht3PIxMDUXHsvczK0/gviz/tq?tqx=out:csv&sheet=clientes";
const URL_CONTAS =
  "https://docs.google.com/spreadsheets/d/1LkyaeCgiyaIN1IxXnbZQPmVMIcht3PIxMDUXHsvczK0/gviz/tq?tqx=out:csv&sheet=contas";
const URL_AGENCIAS =
  "https://docs.google.com/spreadsheets/d/1LkyaeCgiyaIN1IxXnbZQPmVMIcht3PIxMDUXHsvczK0/gviz/tq?tqx=out:csv&sheet=agencias";

// Função para transformar texto da planilha em número
function parseNumero(valor: unknown): number {
  if (typeof valor === "number") {
    return valor;
  }

  if (!valor) {
    return 0;
  }

  let texto = String(valor).trim();

  // Tira espaços no meio do número, se tiver
  texto = texto.replace(/\s+/g, "");

  // Se tiver ponto e vírgula (ex: 1.500,50), tira os pontos de milhar
  if (texto.includes(".") && texto.includes(",")) {
    texto = texto.replace(/\./g, "");
  }

  // Troca vírgula por ponto para o JavaScript entender
  texto = texto.replace(",", ".");

  const numero = Number(texto);

  if (Number.isNaN(numero)) {
    return 0;
  }

  return numero;
}

// Função para transformar texto de data em objeto Date
function parseData(valor: unknown): Date {
  if (valor instanceof Date) {
    return valor;
  }

  const texto = String(valor ?? "").trim();

  if (texto === "") {
    return new Date(NaN);
  }

  // Verifica se está no formato YYYY-MM-DD (ex: 2000-05-20)
  if (texto.includes("-")) {
    const partes = texto.split("-");
    if (partes.length === 3) {
      const ano = Number(partes[0]);
      const mes = Number(partes[1]) - 1; // Mês começa no 0 no JS
      const dia = Number(partes[2]);
      return new Date(ano, mes, dia);
    }
  }

  // Verifica se está no formato brasileiro DD/MM/YYYY
  if (texto.includes("/")) {
    const partes = texto.split("/");
    if (partes.length === 3) {
      const dia = Number(partes[0]);
      const mes = Number(partes[1]) - 1;
      const ano = Number(partes[2]);
      return new Date(ano, mes, dia);
    }
  }

  return new Date(texto);
}

// Função que baixa o CSV da internet e transforma em lista de objetos
async function buscarCsv(url: string): Promise<Record<string, string>[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Erro ao baixar a planilha: " + response.status);
  }

  const csvTexto = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvTexto, {
      header: true, // Usa a primeira linha como nome das colunas
      skipEmptyLines: true, // Pula linhas em branco
      complete: (resultado) => {
        if (resultado.errors.length > 0) {
          console.log("Avisos ao ler CSV:", resultado.errors);
        }
        resolve(resultado.data);
      },
      error: (erro: Error) => {
        reject(erro);
      },
    });
  });
}

// Carrega e organiza a lista de clientes
export async function carregarClientes(): Promise<Cliente[]> {
  const linhas = await buscarCsv(URL_CLIENTES);

  return linhas.map((linha) => {
    const rgLimpo = String(linha.rg ?? "").trim();
    const nomeSocialLimpo = String(linha.nomeSocial ?? "").trim();
    const estadoCivilLimpo = String(linha.estadoCivil ?? "").trim();

    return {
      id: String(linha.id ?? "").trim(),
      cpfCnpj: String(linha.cpfCnpj ?? "").trim(),
      rg: rgLimpo !== "" ? rgLimpo : undefined,
      dataNascimento: parseData(linha.dataNascimento),
      nome: String(linha.nome ?? "").trim(),
      nomeSocial: nomeSocialLimpo !== "" ? nomeSocialLimpo : undefined,
      email: String(linha.email ?? "").trim(),
      endereco: String(linha.endereco ?? "").trim(),
      rendaAnual: parseNumero(linha.rendaAnual),
      patrimonio: parseNumero(linha.patrimonio),
      estadoCivil: (estadoCivilLimpo !== "" ? estadoCivilLimpo : "Solteiro") as EstadoCivil,
      codigoAgencia: parseNumero(linha.codigoAgencia),
    };
  });
}

// Carrega e organiza a lista de contas
export async function carregarContas(): Promise<Conta[]> {
  const linhas = await buscarCsv(URL_CONTAS);

  return linhas.map((linha) => {
    const tipoLimpo = String(linha.tipo ?? "").trim().toLowerCase();

    return {
      id: String(linha.id ?? "").trim(),
      cpfCnpjCliente: String(linha.cpfCnpjCliente ?? "").trim(),
      tipo: (tipoLimpo !== "" ? tipoLimpo : "corrente") as TipoConta,
      saldo: parseNumero(linha.saldo),
      limiteCredito: parseNumero(linha.limiteCredito),
      creditoDisponivel: parseNumero(linha.creditoDisponivel),
    };
  });
}

// Carrega e organiza a lista de agências
export async function carregarAgencias(): Promise<Agencia[]> {
  const linhas = await buscarCsv(URL_AGENCIAS);

  return linhas.map((linha) => {
    return {
      id: String(linha.id ?? "").trim(),
      codigo: parseNumero(linha.codigo),
      nome: String(linha.nome ?? "").trim(),
      endereco: String(linha.endereco ?? "").trim(),
    };
  });
}