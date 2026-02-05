import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "./types";
import { criarEstadoInicial } from "./engine";

const KEY = "PELADA_ORGANIZER_STATE_V1";

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return criarEstadoInicial();
    const parsed = JSON.parse(raw);
    // snapshots não precisam persistir (reduz tamanho)
    parsed.snapshots = [];
    return parsed as AppState;
  } catch {
    return criarEstadoInicial();
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    const toSave = { ...state, snapshots: [] };
    await AsyncStorage.setItem(KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}
