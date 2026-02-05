import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";

const ORGANIZER_PIN = "1234";

export function LoginScreen(props: {
  onOrganizer: () => void;
  onGuest: () => void;
}) {
  const { onOrganizer, onGuest } = props;
  const [pin, setPin] = useState("");

  const tryLogin = () => {
    if (pin.trim() === ORGANIZER_PIN) {
      onOrganizer();
      setPin("");
      return;
    }
    Alert.alert("PIN incorreto", "Use o PIN do organizador.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Pelada Organizer</Text>
        <Text style={styles.subtitle}>Acesso do organizador</Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="PIN do organizador"
          secureTextEntry
          keyboardType="number-pad"
          style={styles.input}
        />
        <Pressable style={styles.primaryBtn} onPress={tryLogin}>
          <Text style={styles.primaryTxt}>Entrar como organizador</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Acesso de convidados</Text>
        <Text style={styles.help}>Acompanhe jogos, fila e histórico em tempo real.</Text>
        <Pressable style={styles.secondaryBtn} onPress={onGuest}>
          <Text style={styles.secondaryTxt}>Entrar como convidado</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>PIN padrão: 1234 (pode ser trocado depois)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "#f9fafb", justifyContent: "center" },
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eef2f7",
    gap: 10,
  },
  title: { fontSize: 26, fontWeight: "900" },
  subtitle: { fontSize: 16, fontWeight: "800" },
  help: { color: "#6b7280", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  primaryBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  primaryTxt: { color: "white", fontWeight: "900" },
  secondaryBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  secondaryTxt: { color: "#111827", fontWeight: "900" },
  footer: { textAlign: "center", color: "#6b7280", fontWeight: "600", marginTop: 6 },
});
