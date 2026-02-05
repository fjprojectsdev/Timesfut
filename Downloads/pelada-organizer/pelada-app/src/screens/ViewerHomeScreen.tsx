import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { AppState, Modalidade } from "../types";
import { ModalidadeSwitch } from "../components/ModalidadeSwitch";
import { TeamsScreen } from "./TeamsScreen";
import { GameScreen } from "./GameScreen";
import { HistoryScreen } from "./HistoryScreen";

type Tab = "TIMES" | "JOGO" | "HISTORICO";

export function ViewerHomeScreen(props: {
  state: AppState;
  onLogout: () => void;
}) {
  const { state, onLogout } = props;
  const [modalidade, setModalidade] = useState<Modalidade>("FUT");
  const [tab, setTab] = useState<Tab>("TIMES");

  const content = useMemo(() => {
    if (tab === "TIMES") return <TeamsScreen state={state} modalidade={modalidade} onState={() => {}} readOnly />;
    if (tab === "JOGO") return <GameScreen state={state} modalidade={modalidade} onState={() => {}} readOnly />;
    return <HistoryScreen state={state} modalidade={modalidade} />;
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
          {(["TIMES", "JOGO", "HISTORICO"] as Tab[]).map((t) => {
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
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  logoutTxt: { fontWeight: "900", color: "#111827" },
  body: { flex: 1 },
});
