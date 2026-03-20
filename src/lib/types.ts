export interface ReaderSettings {
  wpm: number;
  fontSize: number;
  highlightColor: string;
  highlightRatio: number; // 0–1
  theme: "dark" | "light" | "sepia";
  showFocusLine: boolean;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  wpm: 300,
  fontSize: 48,
  highlightColor: "#f97316",
  highlightRatio: 0.4,
  theme: "dark",
  showFocusLine: true,
};
