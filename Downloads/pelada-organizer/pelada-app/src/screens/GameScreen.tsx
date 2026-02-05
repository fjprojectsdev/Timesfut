import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { AppState, Modalidade } from "../types";
import { registrarResultado } from "../engine";

export function GameScreen(props: {
  state: AppState;
  modalidade: Modalidade;
  onState: (s: AppState) => void;
  readOnly?: boolean;
}) {
  const { state, modalidade, onState, readOnly } = props;
  const em = state.porModalidade[modalidade];
  const N = em.config.jogadoresPorTime;
  const jogo = em.jogoAtual;

  const info = useMemo(() => {
    if (!jogo) return null;
    const a = state.times[jogo.timeAId];
    const b = state.times[jogo.timeBId];
    if (!a || !b) return null;
    return { a, b };
  }, [jogo, state.times]);

  const filaPreview = em.filaTimes.slice(0, 3).map((tid) => state.times[tid]).filter(Boolean);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Jogo</Text>

      {!info ? (
        <View style={styles.card}>
          <Text style={styles.big}>Sem jogo rolando</Text>
          <Text style={styles.small}>Vá em “Times” e toque em “Iniciar jogos”.</Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.big}>Quadra agora</Text>

            <View style={styles.matchRow}>
              <View style={styles.teamBox}>
                <Text style={styles.teamTitle}>Time A ({info.a.jogadores.length}/{N})</Text>
                <Text style={styles.players}>
                  {info.a.jogadores.map((jid) => state.jogadores[jid]?.nome).filter(Boolean).join(", ")}
                </Text>
                {!readOnly ? (
                  <Pressable style={styles.winBtn} onPress={() => onState(registrarResultado(state, modalidade, "A"))}>
                    <Text style={styles.winTxt}>A venceu</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.vs}>x</Text>

              <View style={styles.teamBox}>
                <Text style={styles.teamTitle}>Time B ({info.b.jogadores.length}/{N})</Text>
                <Text style={styles.players}>
                  {info.b.jogadores.map((jid) => state.jogadores[jid]?.nome).filter(Boolean).join(", ")}
                </Text>
                {!readOnly ? (
                  <Pressable style={styles.winBtn} onPress={() => onState(registrarResultado(state, modalidade, "B"))}>
                    <Text style={styles.winTxt}>B venceu</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.big}>Próximos na fila</Text>
            <Text style={styles.small}>
              {filaPreview.length
                ? filaPreview
                    .map((t, i) => `T${i + 1}: ${t.jogadores.map((jid) => state.jogadores[jid]?.nome).filter(Boolean).join(", ")}`)
                    .join("\n")
                : "Fila vazia (o perdedor sempre entra no fim, mas precisa ter outros times)."}
            </Text>
          </View>
        </>
      )}

      <View style={styles.card}>
        <Text style={styles.big}>Últimos derrotados (mais recente → antigo)</Text>
        <Text style={styles.small}>
          {em.ultimosDerrotados
            .slice(0, 6)
            .map((tid, idx) => {
              const t = state.times[tid];
              if (!t) return null;
              return `${idx + 1}) ${t.jogadores.map((jid) => state.jogadores[jid]?.nome).filter(Boolean).join(", ")}`;
            })
            .filter(Boolean)
            .join("\n") || "Ainda ninguém perdeu nessa modalidade."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "800" },
  card: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eef2f7",
    gap: 10,
  },
  big: { fontSize: 16, fontWeight: "900" },
  small: { color: "#374151", fontWeight: "600", lineHeight: 20 },
  matchRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  teamBox: { flex: 1, gap: 8 },
  teamTitle: { fontWeight: "900" },
  players: { color: "#374151", fontWeight: "600" },
  vs: { fontSize: 18, fontWeight: "900", marginTop: 10 },
  winBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  winTxt: { color: "white", fontWeight: "900" },
});
