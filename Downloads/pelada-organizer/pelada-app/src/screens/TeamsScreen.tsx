import React, { useMemo } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { AppState, Modalidade } from "../types";
import { gerarTimes, iniciarJogos, atualizarConfig, rebalanceamentoTotal, recomporTime } from "../engine";

export function TeamsScreen(props: {
  state: AppState;
  modalidade: Modalidade;
  onState: (s: AppState) => void;
  readOnly?: boolean;
}) {
  const { state, modalidade, onState, readOnly } = props;
  const em = state.porModalidade[modalidade];
  const N = em.config.jogadoresPorTime;

  const timesFila = useMemo(() => {
    return em.filaTimes.map((tid) => state.times[tid]).filter(Boolean);
  }, [em.filaTimes, state.times]);

  const soltos = useMemo(() => {
    return em.jogadoresSoltos.map((jid) => state.jogadores[jid]).filter(Boolean);
  }, [em.jogadoresSoltos, state.jogadores]);

  const opcoesPorTime = modalidade === "FUT" ? [5, 6] : [2, 4, 6];

  const handleCopyTeams = async () => {
    if (timesFila.length === 0) {
      Alert.alert("Ops", "Não há times gerados para copiar.");
      return;
    }

    let texto = `⚽ *Times - ${modalidade === "FUT" ? "Futebol" : "Vôlei"}* ⚽\n\n`;

    timesFila.forEach((time, index) => {
      const nomes = time.jogadores
        .map((jid) => state.jogadores[jid]?.nome)
        .filter(Boolean)
        .join(", ");
      texto += `*Time ${index + 1}:* ${nomes}\n`;
    });

    if (soltos.length > 0) {
      const nomesSoltos = soltos.map((j) => j.nome).join(", ");
      texto += `\n🏃 *De fora:* ${nomesSoltos}`;
    }

    await Clipboard.setStringAsync(texto);
    Alert.alert("Sucesso", "Times copiados para a área de transferência!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Times</Text>

      {!readOnly ? (
        <View style={styles.configCard}>
        <Text style={styles.label}>Jogadores por time</Text>
        <View style={styles.chips}>
          {opcoesPorTime.map((qtd) => {
            const active = qtd === N;
            return (
              <Pressable
                key={qtd}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onState(atualizarConfig(state, modalidade, { jogadoresPorTime: qtd }))}
              >
                <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{qtd}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Critério de montagem</Text>
        <View style={styles.chips}>
          {(["CHEGADA", "ALEATORIO"] as const).map((c) => {
            const active = em.config.criterioMontagemInicial === c;
            return (
              <Pressable
                key={c}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onState(atualizarConfig(state, modalidade, { criterioMontagemInicial: c }))}
              >
                <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
                  {c === "CHEGADA" ? "Chegada" : "Aleatório"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Modo</Text>
        <View style={styles.modeRow}>
          <Text style={styles.modeTxt}>Rei da quadra (vencedor fica)</Text>
        </View>
        </View>
      ) : null}

      {!readOnly ? (
        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={() => onState(gerarTimes(state, modalidade))}>
            <Text style={styles.primaryTxt}>Gerar times</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => onState(iniciarJogos(state, modalidade))}>
            <Text style={styles.secondaryTxt}>Iniciar jogos</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Botão de Copiar */}
      <Pressable style={styles.copyBtn} onPress={handleCopyTeams}>
        <Text style={styles.copyTxt}>📋 Copiar p/ WhatsApp</Text>
      </Pressable>

      {!readOnly ? (
        <Pressable style={styles.warnBtn} onPress={() => onState(rebalanceamentoTotal(state, modalidade))}>
          <Text style={styles.warnTxt}>Rebalanceamento total</Text>
        </Pressable>
      ) : null}

      <Text style={styles.h2}>Fila de times ({timesFila.length})</Text>
      <FlatList
        data={timesFila}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.teamRow}>
              <Text style={styles.teamTitle}>T{index + 1} ({item.jogadores.length}/{N})</Text>
              {!readOnly && item.jogadores.length < N ? (
                <Pressable
                  style={styles.recomporBtn}
                  onPress={() => onState(recomporTime(state, modalidade, item.id))}
                >
                  <Text style={styles.recomporTxt}>Recompor</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.teamPlayers}>
              {item.jogadores.map((jid) => state.jogadores[jid]?.nome).filter(Boolean).join(", ")}
            </Text>
          </View>
        )}
      />

      <Text style={styles.h2}>Soltos ({soltos.length})</Text>
      <Text style={styles.small}>{soltos.map((j) => j.nome).join(", ") || "Ninguém solto agora."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "800" },
  h2: { fontSize: 16, fontWeight: "800", marginTop: 6 },
  small: { color: "#374151", fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  primaryTxt: { color: "white", fontWeight: "800" },
  secondaryBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  secondaryTxt: { color: "#111827", fontWeight: "800" },
  copyBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#25D366", // WhatsApp Green
    alignItems: "center",
  },
  copyTxt: { color: "white", fontWeight: "800" },
  warnBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    alignItems: "center",
  },
  warnTxt: { color: "#9a3412", fontWeight: "900" },
  configCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eef2f7",
    gap: 10,
  },
  label: { fontWeight: "800", color: "#111827" },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  chipActive: { backgroundColor: "#111827" },
  chipTxt: { fontWeight: "800", color: "#111827" },
  chipTxtActive: { color: "white" },
  modeRow: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  modeTxt: { color: "#374151", fontWeight: "700" },
  card: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eef2f7",
    marginBottom: 10,
  },
  teamRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  teamTitle: { fontWeight: "900" },
  teamPlayers: { marginTop: 6, color: "#374151", fontWeight: "600" },
  recomporBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e0f2fe",
  },
  recomporTxt: { color: "#075985", fontWeight: "900", fontSize: 12 },
});
