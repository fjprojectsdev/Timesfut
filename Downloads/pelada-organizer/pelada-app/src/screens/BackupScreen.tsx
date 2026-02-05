import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { AppState } from "../types";
import { criarEstadoInicial } from "../engine";

function cleanSnapshots(state: AppState): AppState {
  return { ...state, snapshots: [] };
}

function isValidState(obj: any): obj is AppState {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  if (!obj.porModalidade || !obj.jogadores || !obj.times) return false;
  if (!obj.porModalidade.FUT || !obj.porModalidade.VOLEI) return false;
  return true;
}

export function BackupScreen(props: {
  state: AppState;
  onState: (s: AppState) => void;
}) {
  const { state, onState } = props;
  const [input, setInput] = useState("");

  const exportText = useMemo(() => {
    return JSON.stringify(cleanSnapshots(state));
  }, [state]);

  const onImport = () => {
    try {
      const parsed = JSON.parse(input);
      if (!isValidState(parsed)) throw new Error("invalid");
      parsed.snapshots = [];
      onState(parsed as AppState);
      Alert.alert("Importado", "Estado restaurado com sucesso.");
    } catch {
      Alert.alert("JSON inválido", "Cole um JSON exportado pelo app.");
    }
  };

  const onResetInput = () => setInput("");

  const onLoadExport = () => {
    setInput(exportText);
  };

  const onResetState = () => {
    Alert.alert("Resetar dados?", "Isso apaga tudo e reinicia a sessão.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Resetar", style: "destructive", onPress: () => onState(criarEstadoInicial()) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Backup</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Exportar</Text>
        <Text style={styles.help}>Toque em “Colar exportação” e copie o JSON.</Text>
        <Pressable style={styles.secondaryBtn} onPress={onLoadExport}>
          <Text style={styles.secondaryTxt}>Colar exportação</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Importar</Text>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Cole aqui o JSON do backup"
          style={styles.textarea}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
        />
        <View style={styles.row}>
          <Pressable style={styles.primaryBtn} onPress={onImport}>
            <Text style={styles.primaryTxt}>Importar</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={onResetInput}>
            <Text style={styles.secondaryTxt}>Limpar</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.warnBtn} onPress={onResetState}>
        <Text style={styles.warnTxt}>Resetar sessão</Text>
      </Pressable>
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
  label: { fontWeight: "900" },
  help: { color: "#6b7280", fontWeight: "600" },
  textarea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "white",
    fontSize: 14,
  },
  row: { flexDirection: "row", gap: 10 },
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
  warnBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
  },
  warnTxt: { color: "#991b1b", fontWeight: "900" },
});
