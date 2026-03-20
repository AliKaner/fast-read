export type FontFamily =
  | "inter"
  | "jetbrains"
  | "georgia"
  | "courier"
  | "system";

export const FONT_OPTIONS: { key: FontFamily; label: string; css: string }[] = [
  { key: "inter",     label: "Inter",         css: "'Inter', sans-serif" },
  { key: "jetbrains", label: "Mono",          css: "'JetBrains Mono', monospace" },
  { key: "georgia",   label: "Georgia",       css: "Georgia, serif" },
  { key: "courier",   label: "Courier",       css: "'Courier New', monospace" },
  { key: "system",    label: "Sistem",        css: "system-ui, sans-serif" },
];

export interface ReaderSettings {
  wpm: number;
  fontSize: number;
  highlightColor: string;
  highlightRatio: number; // 0–1
  theme: "dark" | "light" | "sepia";
  showFocusLine: boolean;
  letterSpacing: number; // em units, e.g. 0.02
  fontFamily: FontFamily;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  wpm: 300,
  fontSize: 48,
  highlightColor: "#f97316",
  highlightRatio: 0.4,
  theme: "dark",
  showFocusLine: true,
  letterSpacing: 0.02,
  fontFamily: "inter",
};
