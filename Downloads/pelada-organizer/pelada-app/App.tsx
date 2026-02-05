import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";
import { AppState } from "./src/types";
import { loadState, saveState } from "./src/storage";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ViewerHomeScreen } from "./src/screens/ViewerHomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [mode, setMode] = useState<"organizer" | "guest" | null>(null);

  useEffect(() => {
    (async () => {
      const s = await loadState();
      setState(s);
    })();
  }, []);

  useEffect(() => {
    if (!state) return;
    saveState(state);
  }, [state]);

  if (!state) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{ headerShown: false }}>
          {() =>
            mode === null ? (
              <LoginScreen onOrganizer={() => setMode("organizer")} onGuest={() => setMode("guest")} />
            ) : mode === "organizer" ? (
              <HomeScreen state={state} onState={setState} onLogout={() => setMode(null)} />
            ) : (
              <ViewerHomeScreen state={state} onLogout={() => setMode(null)} />
            )
          }
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
