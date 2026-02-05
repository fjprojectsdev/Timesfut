import {
  criarEstadoInicial,
  adicionarJogador,
  gerarTimes,
  iniciarJogos,
  registrarResultado,
} from "../engine";

describe("engine", () => {
  test("gerarTimes cria times e deixa sobras em soltos", () => {
    let s = criarEstadoInicial();
    for (let i = 0; i < 6; i += 1) {
      s = adicionarJogador(s, `J${i + 1}`, { FUT: true });
    }
    s = gerarTimes(s, "FUT");

    const em = s.porModalidade.FUT;
    expect(em.filaTimes.length).toBe(1);
    expect(em.jogadoresSoltos.length).toBe(1);

    const tId = em.filaTimes[0];
    const time = s.times[tId];
    expect(time.jogadores.length).toBe(5);

    const soltosSet = new Set(em.jogadoresSoltos);
    time.jogadores.forEach((jid) => {
      expect(soltosSet.has(jid)).toBe(false);
    });
  });

  test("iniciarJogos e registrarResultado mantém rei da quadra", () => {
    let s = criarEstadoInicial();
    for (let i = 0; i < 10; i += 1) {
      s = adicionarJogador(s, `J${i + 1}`, { FUT: true });
    }
    s = gerarTimes(s, "FUT");
    s = iniciarJogos(s, "FUT");

    const em0 = s.porModalidade.FUT;
    expect(em0.jogoAtual).not.toBeNull();

    const a = em0.jogoAtual!.timeAId;
    const b = em0.jogoAtual!.timeBId;

    s = registrarResultado(s, "FUT", "A");
    const em1 = s.porModalidade.FUT;

    // Com apenas 2 times, o vencedor continua e o perdedor volta como desafiante
    expect(em1.jogoAtual).not.toBeNull();
    expect(em1.jogoAtual!.timeAId).toBe(a);
    expect(em1.jogoAtual!.timeBId).toBe(b);
  });
});
