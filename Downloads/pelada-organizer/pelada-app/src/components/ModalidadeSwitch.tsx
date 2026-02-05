import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Modalidade } from "../types";

export function ModalidadeSwitch(props: {
  value: Modalidade;
  onChange: (m: Modalidade) => void;
}) {
  const { value, onChange } = props;
  return (
    <View style={styles.wrap}>
      {(["FUT", "VOLEI"] as Modalidade[]).map((m) => {
        const active = value === m;
        return (
          <Pressable
            key={m}
            onPress={() => onChange(m)}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Text style={[styles.txt, active && styles.txtActive]}>
              {m === "FUT" ? "Fut" : "Vôlei"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  btnActive: {
    backgroundColor: "#111827",
  },
  txt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  txtActive: {
    color: "white",
  },
});
