import React, { useMemo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { AppState, Modalidade } from "../types";

export function HistoryScreen(props: {
  state: AppState;
  modalidade: Modalidade;
}) {
  const { state, modalidade } = props;
  const em = state.porModalidade[modalidade];

  const items = useMemo(() => {
    return em.historicoJogos.map((h) => {
      const a = state.times[h.timeAId];
      const b = state.times[h.timeBId];
      const vencedor = state.times[h.vencedorId];
      const perdedor = state.times[h.perdedorId];
      const nomesA = a?.jogadores.map((jid) => state.jogadores[jid]?.nome).filter(Boolean).join(", ");
      const nomesB = b?.jogadores.map((jid) => state.jogadores[jid]?.nome).filter(Boolean).join(", ");
      const nomesV = vencedor?.jogadores.map((jid) => state.jogadores[jid]?.nome).filter(Boolean).join(", ");
      const nomesP = perdedor?.jogadores.map((jid) => state.jogadores[jid]?.nome).filter(Boolean).join(", ");
      return {
        id: `${h.at}-${h.timeAId}-${h.timeBId}`,
        at: new Date(h.at).toLocaleTimeString(),
        a: nomesA || "Time A",
        b: nomesB || "Time B",
        v: nomesV || "Vencedor",
        p: nomesP || "Perdedor",
      };
    });
  }, [em.historicoJogos, state.times, state.jogadores]);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Histórico</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum jogo registrado ainda.</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.title}>#{items.length - index} • {item.at}</Text>
            <Text style={styles.row}>A: {item.a}</Text>
            <Text style={styles.row}>B: {item.b}</Text>
            <Text style={styles.win}>Vencedor: {item.v}</Text>
            <Text style={styles.lose}>Perdedor: {item.p}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "800" },
  empty: { color: "#6b7280", fontWeight: "600", marginTop: 12 },
  card: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eef2f7",
    marginBottom: 10,
    gap: 4,
  },
  title: { fontWeight: "900" },
  row: { color: "#374151", fontWeight: "600" },
  win: { color: "#065f46", fontWeight: "800" },
  lose: { color: "#991b1b", fontWeight: "800" },
});
