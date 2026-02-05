import { AppState, Modalidade, Jogador, PagamentoStatus, Time } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);

export const criarEstadoInicial = (): AppState => {
  const now = Date.now();
  return {
    versao: 1,
    contadorChegada: 0,
    jogadores: {},
    times: {},
    porModalidade: {
      FUT: {
        modalidade: "FUT",
        config: {
          jogadoresPorTime: 5,
          criterioMontagemInicial: "CHEGADA",
          modo: "REI_DA_QUADRA",
          limiteDoacoesPorEvento: 3,
          gatilhoRebalanceamentoIncompletos: 5,
          naoMexerEmTimeEmJogoAoRecompor: true,
        },
        jogadoresSoltos: [],
        filaTimes: [],
        jogoAtual: null,
        ultimosDerrotados: [],
        historicoJogos: [],
      },
      VOLEI: {
        modalidade: "VOLEI",
        config: {
          jogadoresPorTime: 4,
          criterioMontagemInicial: "CHEGADA",
          modo: "REI_DA_QUADRA",
          limiteDoacoesPorEvento: 3,
          gatilhoRebalanceamentoIncompletos: 5,
          naoMexerEmTimeEmJogoAoRecompor: true,
        },
        jogadoresSoltos: [],
        filaTimes: [],
        jogoAtual: null,
        ultimosDerrotados: [],
        historicoJogos: [],
      },
    },
    snapshots: [],
  };
};

export const snapshot = (s: AppState, motivo: string): AppState => {
  const copy: Omit<AppState, "snapshots"> = JSON.parse(JSON.stringify({ ...s, snapshots: undefined }));
  const snap = { at: Date.now(), state: copy, motivo };
  const next = { ...s, snapshots: [snap, ...s.snapshots].slice(0, 30) };
  return next;
};

export const undo = (s: AppState): AppState => {
  const first = s.snapshots[0];
  if (!first) return s;
  const restored = { ...(first.state as any), snapshots: s.snapshots.slice(1) } as AppState;
  return restored;
};

export const adicionarJogador = (
  s: AppState,
  nome: string,
  modalidades: Partial<Record<Modalidade, boolean>>,
  pagamentoStatus: PagamentoStatus = "PENDENTE"
): AppState => {
  let next = snapshot(s, "Adicionar jogador");
  const id = uid();
  const ordemChegada = next.contadorChegada + 1;
  const jogador: Jogador = {
    id,
    nome: nome.trim(),
    ordemChegada,
    pagamentoStatus,
    ativo: true,
    modalidades: {
      FUT: !!modalidades.FUT,
      VOLEI: !!modalidades.VOLEI,
    },
  };
  next = { ...next, contadorChegada: ordemChegada, jogadores: { ...next.jogadores, [id]: jogador } };

  // entra como "solto" na(s) modalidade(s)
  (["FUT", "VOLEI"] as Modalidade[]).forEach((m) => {
    if (jogador.modalidades[m]) {
      const em = next.porModalidade[m];
      next = {
        ...next,
        porModalidade: {
          ...next.porModalidade,
          [m]: { ...em, jogadoresSoltos: [...em.jogadoresSoltos, id] },
        },
      };
    }
  });
  return next;
};

export const atualizarPagamento = (s: AppState, jogadorId: string, status: PagamentoStatus): AppState => {
  let next = snapshot(s, "Atualizar pagamento");
  const j = next.jogadores[jogadorId];
  if (!j) return s;
  next = { ...next, jogadores: { ...next.jogadores, [jogadorId]: { ...j, pagamentoStatus: status } } };
  return next;
};

export const marcarFoiEmbora = (s: AppState, jogadorId: string): AppState => {
  let next = snapshot(s, "Jogador foi embora");
  const j = next.jogadores[jogadorId];
  if (!j) return s;

  // remove de todos os times
  Object.values(next.times).forEach((t) => {
    if (t.jogadores.includes(jogadorId)) {
      next.times[t.id] = { ...t, jogadores: t.jogadores.filter((x) => x !== jogadorId) };
    }
  });

  // remove das listas soltas
  (["FUT", "VOLEI"] as Modalidade[]).forEach((m) => {
    const em = next.porModalidade[m];
    next.porModalidade[m] = {
      ...em,
      jogadoresSoltos: em.jogadoresSoltos.filter((x) => x !== jogadorId),
    };
  });

  // marca inativo
  next = { ...next, jogadores: { ...next.jogadores, [jogadorId]: { ...j, ativo: false } } };

  // recompor se necessário
  (["FUT", "VOLEI"] as Modalidade[]).forEach((m) => {
    next = checarERecompor(next, m);
  });
  return next;
};

// Alias mais explícito para uso externo
export const marcarJogadorFoiEmbora = (s: AppState, jogadorId: string): AppState => {
  return marcarFoiEmbora(s, jogadorId);
};

export const limparTudo = (_s: AppState): AppState => criarEstadoInicial();

export const gerarTimes = (s: AppState, modalidade: Modalidade): AppState => {
  let next = snapshot(s, `Gerar times ${modalidade}`);
  const em = next.porModalidade[modalidade];
  const N = em.config.jogadoresPorTime;

  // pega jogadores ativos dessa modalidade que não estão em time
  const emTimes = new Set<string>();
  Object.values(next.times).forEach((t) => {
    if (t.modalidade === modalidade) t.jogadores.forEach((id) => emTimes.add(id));
  });

  const candidatos = Object.values(next.jogadores)
    .filter((j) => j.ativo && j.modalidades[modalidade] && !emTimes.has(j.id))
    .sort((a, b) => a.ordemChegada - b.ordemChegada)
    .map((j) => j.id);

  const lista =
    em.config.criterioMontagemInicial === "ALEATORIO" ? shuffle([...candidatos]) : [...candidatos];

  const timesCriados: string[] = [];
  let idx = 0;
  while (idx + N <= lista.length) {
    const jogadores = lista.slice(idx, idx + N);
    idx += N;
    const tId = uid();
    const t: Time = {
      id: tId,
      modalidade,
      jogadores,
      criadoEm: Date.now(),
      status: "NA_FILA",
    };
    next = { ...next, times: { ...next.times, [tId]: t } };
    timesCriados.push(tId);
  }
  const sobras = lista.slice(idx);

  // remove dos soltos quem foi alocado em times
  const usados = new Set(timesCriados.flatMap((tid) => next.times[tid].jogadores));
  const soltosLimpos = em.jogadoresSoltos.filter((jid) => !usados.has(jid));

  // atualiza estado modalidade
  next = {
    ...next,
    porModalidade: {
      ...next.porModalidade,
      [modalidade]: {
        ...em,
        jogadoresSoltos: unique([...soltosLimpos, ...sobras]),
        filaTimes: [...em.filaTimes, ...timesCriados],
      },
    },
  };
  return next;
};

export const iniciarJogos = (s: AppState, modalidade: Modalidade): AppState => {
  let next = snapshot(s, `Iniciar jogos ${modalidade}`);
  const em = next.porModalidade[modalidade];
  if (em.jogoAtual) return s;
  if (em.filaTimes.length < 2) return s;

  const [a, b, ...rest] = em.filaTimes;
  next = setStatusTime(next, a, "EM_JOGO");
  next = setStatusTime(next, b, "EM_JOGO");
  next = {
    ...next,
    porModalidade: {
      ...next.porModalidade,
      [modalidade]: { ...em, filaTimes: rest, jogoAtual: { timeAId: a, timeBId: b } },
    },
  };
  return next;
};

export const registrarResultado = (s: AppState, modalidade: Modalidade, vencedor: "A" | "B"): AppState => {
  let next = snapshot(s, `Resultado ${modalidade}`);
  const em = next.porModalidade[modalidade];
  const jogo = em.jogoAtual;
  if (!jogo) return s;

  const timeA = next.times[jogo.timeAId];
  const timeB = next.times[jogo.timeBId];
  if (!timeA || !timeB) return s;

  const vencedorId = vencedor === "A" ? timeA.id : timeB.id;
  const perdedorId = vencedor === "A" ? timeB.id : timeA.id;

  // perdedor sai do jogo e entra no fim da fila (inteiro)
  next = setStatusTime(next, perdedorId, "NA_FILA");
  next = setStatusTime(next, vencedorId, "EM_JOGO");

  // atualiza ultimosDerrotados (mais recente primeiro)
  const novosDerrotados = [perdedorId, ...em.ultimosDerrotados.filter((id) => id !== perdedorId)];
  next.times[perdedorId] = { ...next.times[perdedorId], ultimoDerrotaAt: Date.now() };

  // histórico
  const hist = [
    {
      timeAId: timeA.id,
      timeBId: timeB.id,
      vencedorId,
      perdedorId,
      at: Date.now(),
    },
    ...em.historicoJogos,
  ].slice(0, 50);

  // pega próximo desafiante
  const fila = [...em.filaTimes, perdedorId];
  const proximo = fila.shift() || null;

  if (!proximo) {
    // sem próximo, pausa
    next = setStatusTime(next, vencedorId, "NA_FILA");
    next = {
      ...next,
      porModalidade: {
        ...next.porModalidade,
        [modalidade]: { ...em, filaTimes: fila, jogoAtual: null, ultimosDerrotados: novosDerrotados, historicoJogos: hist },
      },
    };
    return next;
  }

  next = setStatusTime(next, proximo, "EM_JOGO");
  next = {
    ...next,
    porModalidade: {
      ...next.porModalidade,
      [modalidade]: {
        ...em,
        filaTimes: fila,
        jogoAtual: { timeAId: vencedorId, timeBId: proximo },
        ultimosDerrotados: novosDerrotados,
        historicoJogos: hist,
      },
    },
  };

  // checagem/recomposição
  next = checarERecompor(next, modalidade);
  return next;
};

export const rebalanceamentoTotal = (s: AppState, modalidade: Modalidade): AppState => {
  let next = snapshot(s, `Rebalanceamento total ${modalidade}`);
  const em = next.porModalidade[modalidade];
  const N = em.config.jogadoresPorTime;

  // coletar times incompletos NA_FILA e soltos
  const incompletos = em.filaTimes
    .map((tid) => next.times[tid])
    .filter((t) => t && t.modalidade === modalidade && t.status === "NA_FILA" && t.jogadores.length < N)
    .map((t) => t!.id);

  const jogadoresColetados: string[] = [];
  incompletos.forEach((tid) => {
    const t = next.times[tid];
    jogadoresColetados.push(...t.jogadores);
    // remove o time da fila e do map
    delete next.times[tid];
  });

  const filaLimpa = em.filaTimes.filter((tid) => !incompletos.includes(tid));
  const lista = [...jogadoresColetados, ...em.jogadoresSoltos].filter((jid) => next.jogadores[jid]?.ativo);

  const ordenada = lista
    .map((jid) => next.jogadores[jid])
    .filter(Boolean)
    .sort((a, b) => a.ordemChegada - b.ordemChegada)
    .map((j) => j.id);

  const novosTimes: string[] = [];
  let idx = 0;
  while (idx + N <= ordenada.length) {
    const jogadores = ordenada.slice(idx, idx + N);
    idx += N;
    const tId = uid();
    next.times[tId] = { id: tId, modalidade, jogadores, criadoEm: Date.now(), status: "NA_FILA" };
    novosTimes.push(tId);
  }
  const sobras = ordenada.slice(idx);

  next.porModalidade[modalidade] = {
    ...em,
    filaTimes: [...filaLimpa, ...novosTimes],
    jogadoresSoltos: sobras,
  };
  return next;
};

export const atualizarConfig = (s: AppState, modalidade: Modalidade, patch: Partial<AppState["porModalidade"][Modalidade]["config"]>): AppState => {
  let next = snapshot(s, `Atualizar config ${modalidade}`);
  const em = next.porModalidade[modalidade];
  next.porModalidade[modalidade] = { ...em, config: { ...em.config, ...patch } };
  return next;
};

// Recompõe um time específico (uso manual)
export const recomporTime = (s: AppState, modalidade: Modalidade, timeId: string): AppState => {
  let next = snapshot(s, `Recompor time ${modalidade}`);
  const em = next.porModalidade[modalidade];
  const budget = { remaining: em.config.limiteDoacoesPorEvento };
  next = recomporTimeInterno(next, modalidade, timeId, budget);
  return next;
};

// ---------- Internals ----------
const setStatusTime = (s: AppState, timeId: string, status: Time["status"]): AppState => {
  const t = s.times[timeId];
  if (!t) return s;
  return { ...s, times: { ...s.times, [timeId]: { ...t, status } } };
};

const checarERecompor = (s: AppState, modalidade: Modalidade): AppState => {
  let next = s;
  const em = next.porModalidade[modalidade];
  const N = em.config.jogadoresPorTime;

  // lista de times que estão NA_FILA e incompletos
  const incompletos = em.filaTimes
    .map((tid) => next.times[tid])
    .filter((t) => t && t.modalidade === modalidade && t.status === "NA_FILA" && t.jogadores.length < N)
    .map((t) => t!.id);

  if (incompletos.length >= em.config.gatilhoRebalanceamentoIncompletos) {
    return rebalanceamentoTotal(next, modalidade);
  }

  const budget = { remaining: em.config.limiteDoacoesPorEvento };
  for (const tid of incompletos) {
    next = recomporTimeInterno(next, modalidade, tid, budget);
    if (budget.remaining <= 0) break;
  }
  return next;
};

type DoacaoBudget = { remaining: number };

const recomporTimeInterno = (s: AppState, modalidade: Modalidade, timeId: string, budget: DoacaoBudget): AppState => {
  let next = s;
  const em = next.porModalidade[modalidade];
  const N = em.config.jogadoresPorTime;
  const time = next.times[timeId];
  if (!time) return s;

  while (next.times[timeId].jogadores.length < N) {
    const em2 = next.porModalidade[modalidade];

    // 1) soltos
    const soltos = em2.jogadoresSoltos.filter((jid) => next.jogadores[jid]?.ativo);
    if (soltos.length > 0) {
      const jid = soltos[0];
      next.times[timeId] = { ...next.times[timeId], jogadores: [...next.times[timeId].jogadores, jid] };
      next.porModalidade[modalidade] = { ...em2, jogadoresSoltos: soltos.slice(1) };
      continue;
    }

    // 2) doador via ultimosDerrotados (mais recente primeiro)
    if (budget.remaining <= 0) break;
    const doadorId = em2.ultimosDerrotados.find((tid) => {
      if (tid === timeId) return false;
      const t = next.times[tid];
      if (!t) return false;
      if (t.modalidade !== modalidade) return false;
      if (em2.config.naoMexerEmTimeEmJogoAoRecompor && t.status === "EM_JOGO") return false;
      return t.jogadores.length >= N; // precisa estar cheio pra doar 1
    });

    if (!doadorId) break; // não tem de onde puxar

    const doador = next.times[doadorId];
    const jogadorDoado = doador.jogadores[0];
    next.times[doadorId] = { ...doador, jogadores: doador.jogadores.slice(1) };
    next.times[timeId] = { ...next.times[timeId], jogadores: [...next.times[timeId].jogadores, jogadorDoado] };
    budget.remaining -= 1;
  }

  return next;
};

const shuffle = <T,>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const unique = <T,>(arr: T[]): T[] => Array.from(new Set(arr));
