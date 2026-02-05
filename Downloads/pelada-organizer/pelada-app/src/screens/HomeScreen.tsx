import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { AppState, Modalidade } from "../types";
import { ModalidadeSwitch } from "../components/ModalidadeSwitch";
import { ArrivalsScreen } from "./ArrivalsScreen";
import { TeamsScreen } from "./TeamsScreen";
import { GameScreen } from "./GameScreen";
import { HistoryScreen } from "./HistoryScreen";
import { BackupScreen } from "./BackupScreen";
import { limparTudo, undo } from "../engine";

type Tab = "CHEGADAS" | "TIMES" | "JOGO" | "HISTORICO" | "BACKUP";

export function HomeScreen(props: { state: AppState; onState: (s: AppState) => void; onLogout: () => void }) {
  const { state, onState, onLogout } = props;
  const [modalidade, setModalidade] = useState<Modalidade>("FUT");
  const [tab, setTab] = useState<Tab>("CHEGADAS");

  const content = useMemo(() => {
    if (tab === "CHEGADAS") return <ArrivalsScreen state={state} modalidade={modalidade} onState={onState} />;
    if (tab === "TIMES") return <TeamsScreen state={state} modalidade={modalidade} onState={onState} />;
    if (tab === "JOGO") return <GameScreen state={state} modalidade={modalidade} onState={onState} />;
    if (tab === "HISTORICO") return <HistoryScreen state={state} modalidade={modalidade} />;
    return <BackupScreen state={state} onState={onState} />;
  }, [tab, modalidade, state]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Pelada Organizer</Text>
          <Pressable style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutTxt}>Sair</Text>
          </Pressable>
        </View>
        <ModalidadeSwitch value={modalidade} onChange={setModalidade} />
        <View style={styles.tabs}>
          {(["CHEGADAS", "TIMES", "JOGO", "HISTORICO", "BACKUP"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>
                  {t === "HISTORICO" ? "HISTÓRICO" : t}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.quickRow}>
          <Pressable style={styles.quickBtn} onPress={() => onState(undo(state))}>
            <Text style={styles.quickTxt}>Desfazer</Text>
          </Pressable>
          <Pressable style={[styles.quickBtn, styles.danger]} onPress={() => onState(limparTudo(state))}>
            <Text style={[styles.quickTxt, styles.dangerTxt]}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16, gap: 12, backgroundColor: "#f9fafb" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 24, fontWeight: "900" },
  tabs: { flexDirection: "row", gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  tabActive: { backgroundColor: "#111827" },
  tabTxt: { fontWeight: "900", color: "#111827" },
  tabTxtActive: { color: "white" },
  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  quickTxt: { fontWeight: "900", color: "#111827" },
  danger: { backgroundColor: "#fee2e2" },
  dangerTxt: { color: "#991b1b" },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  logoutTxt: { fontWeight: "900", color: "#111827" },
  body: { flex: 1 },
});
