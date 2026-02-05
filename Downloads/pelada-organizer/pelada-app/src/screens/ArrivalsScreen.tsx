import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import { AppState, Modalidade, PagamentoStatus } from "../types";
import { adicionarJogador, atualizarPagamento, marcarFoiEmbora } from "../engine";

function badge(status: PagamentoStatus) {
  if (status === "PAGO") return "✅";
  if (status === "PENDENTE") return "❓";
  return "❌";
}

export function ArrivalsScreen(props: {
  state: AppState;
  modalidade: Modalidade;
  onState: (s: AppState) => void;
}) {
  const { state, modalidade, onState } = props;
  const [nome, setNome] = useState("");
  const [selFut, setSelFut] = useState(modalidade === "FUT");
  const [selVolei, setSelVolei] = useState(modalidade === "VOLEI");

  const jogadores = useMemo(() => {
    return Object.values(state.jogadores)
      .filter((j) => j.ativo)
      .sort((a, b) => a.ordemChegada - b.ordemChegada);
  }, [state.jogadores]);

  const add = () => {
    const n = nome.trim();
    if (!n) return;
    const fut = selFut;
    const volei = selVolei;
    if (!fut && !volei) {
      Alert.alert("Escolha a modalidade", "Selecione FUT, VÔLEI ou ambos.");
      return;
    }
    const modalidades = { FUT: fut, VOLEI: volei };
    onState(adicionarJogador(state, n, modalidades, "PENDENTE"));
    setNome("");
  };

  const cyclePay = (jid: string) => {
    const j = state.jogadores[jid];
    const next: PagamentoStatus =
      j.pagamentoStatus === "PENDENTE" ? "PAGO" : j.pagamentoStatus === "PAGO" ? "NAO" : "PENDENTE";
    onState(atualizarPagamento(state, jid, next));
  };

  const remove = (jid: string) => {
    Alert.alert("Saiu mais cedo?", "Isso remove o jogador dos times e do app nesta sessão.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => onState(marcarFoiEmbora(state, jid)) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Chegadas</Text>

      <View style={styles.row}>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Nome do jogador"
          style={styles.input}
        />
        <Pressable style={styles.primaryBtn} onPress={add}>
          <Text style={styles.primaryTxt}>Adicionar</Text>
        </Pressable>
      </View>

      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggle, selFut && styles.toggleOn]}
          onPress={() => setSelFut(!selFut)}
        >
          <Text style={[styles.toggleTxt, selFut && styles.toggleTxtOn]}>FUT</Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, selVolei && styles.toggleOn]}
          onPress={() => setSelVolei(!selVolei)}
        >
          <Text style={[styles.toggleTxt, selVolei && styles.toggleTxtOn]}>VÔLEI</Text>
        </Pressable>
      </View>

      <FlatList
        data={jogadores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.ordemChegada}. {item.nome}
              </Text>
              <Text style={styles.meta}>
                {item.modalidades.FUT ? "FUT" : ""}
                {item.modalidades.FUT && item.modalidades.VOLEI ? " + " : ""}
                {item.modalidades.VOLEI ? "VÔLEI" : ""}
              </Text>
            </View>

            <Pressable onPress={() => cyclePay(item.id)} style={styles.payBtn}>
              <Text style={styles.payTxt}>{badge(item.pagamentoStatus)}</Text>
            </Pressable>

            <Pressable onPress={() => remove(item.id)} style={styles.removeBtn}>
              <Text style={styles.removeTxt}>Sair</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  h1: { fontSize: 22, fontWeight: "800" },
  row: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  primaryBtn: {
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#111827",
    justifyContent: "center",
  },
  primaryTxt: { color: "white", fontWeight: "800" },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggle: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    alignItems: "center",
  },
  toggleOn: { backgroundColor: "#111827" },
  toggleTxt: { fontWeight: "700", color: "#111827" },
  toggleTxtOn: { color: "white" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eef2f7",
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "800" },
  meta: { color: "#6b7280", marginTop: 2, fontWeight: "600" },
  payBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  payTxt: { fontSize: 20 },
  removeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
  },
  removeTxt: { color: "#991b1b", fontWeight: "800" },
});
