export type Modalidade = "FUT" | "VOLEI";

export type PagamentoStatus = "PAGO" | "PENDENTE" | "NAO";

export type Jogador = {
  id: string;
  nome: string;
  ordemChegada: number;
  pagamentoStatus: PagamentoStatus;
  ativo: boolean;
  modalidades: Record<Modalidade, boolean>;
};

export type Time = {
  id: string;
  modalidade: Modalidade;
  jogadores: string[]; // ids
  criadoEm: number;
  status: "NA_FILA" | "EM_JOGO";
  ultimoDerrotaAt?: number; // timestamp/contador
};

export type JogoAtual = { timeAId: string; timeBId: string } | null;

export type ConfigModalidade = {
  jogadoresPorTime: number;
  criterioMontagemInicial: "CHEGADA" | "ALEATORIO";
  modo: "REI_DA_QUADRA";
  limiteDoacoesPorEvento: number;
  gatilhoRebalanceamentoIncompletos: number;
  naoMexerEmTimeEmJogoAoRecompor: boolean;
};

export type EstadoModalidade = {
  modalidade: Modalidade;
  config: ConfigModalidade;
  jogadoresSoltos: string[];
  filaTimes: string[]; // timeIds
  jogoAtual: JogoAtual;
  ultimosDerrotados: string[]; // timeIds, mais recente primeiro
  historicoJogos: Array<{
    timeAId: string;
    timeBId: string;
    vencedorId: string;
    perdedorId: string;
    at: number;
  }>;
};

export type AppState = {
  versao: number;
  contadorChegada: number;
  jogadores: Record<string, Jogador>;
  times: Record<string, Time>;
  porModalidade: Record<Modalidade, EstadoModalidade>;
  snapshots: AppStateSnapshot[]; // para undo
};

export type AppStateSnapshot = {
  at: number;
  state: Omit<AppState, "snapshots">;
  motivo: string;
};
