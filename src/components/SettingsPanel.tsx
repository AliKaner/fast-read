"use client";

import { useRef } from "react";
import type { ReaderSettings } from "@/lib/types";
import styles from "./SettingsPanel.module.css";

interface Props {
  open: boolean;
  settings: ReaderSettings;
  onChange: (patch: Partial<ReaderSettings>) => void;
  onClose: () => void;
}

const SWATCHES = [
  "#f97316",
  "#ef4444",
  "#a855f7",
  "#3b82f6",
  "#22c55e",
  "#eab308",
];

export default function SettingsPanel({
  open,
  settings,
  onChange,
  onClose,
}: Props) {
  const customColorRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayActive : ""}`}
        onClick={onClose}
      />
      <aside className={`${styles.panel} ${open ? styles.panelActive : ""}`}>
        <div className={styles.header}>
          <h2>Ayarlar</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {/* WPM */}
          <div className={styles.group}>
            <label className={styles.label}>
              <span>Okuma Hızı</span>
              <span className={styles.value}>
                {settings.wpm} <small>KDK</small>
              </span>
            </label>
            <input
              type="range"
              min={60}
              max={900}
              step={10}
              value={settings.wpm}
              onChange={(e) => onChange({ wpm: +e.target.value })}
              className={styles.slider}
            />
            <div className={styles.sliderHints}>
              <span>60</span>
              <span>Yavaş</span>
              <span style={{ textAlign: "right" }}>Hızlı</span>
              <span style={{ textAlign: "right" }}>900</span>
            </div>
          </div>

          {/* Font Size */}
          <div className={styles.group}>
            <label className={styles.label}>
              <span>Yazı Boyutu</span>
              <span className={styles.value}>{settings.fontSize} px</span>
            </label>
            <input
              type="range"
              min={24}
              max={96}
              step={2}
              value={settings.fontSize}
              onChange={(e) => onChange({ fontSize: +e.target.value })}
              className={styles.slider}
            />
          </div>

          {/* Highlight color */}
          <div className={styles.group}>
            <label className={styles.label}>
              <span>Highlight Rengi</span>
            </label>
            <div className={styles.swatches}>
              {SWATCHES.map((color) => (
                <button
                  key={color}
                  className={`${styles.swatch} ${
                    settings.highlightColor === color ? styles.swatchActive : ""
                  }`}
                  style={{ background: color }}
                  onClick={() => onChange({ highlightColor: color })}
                  title={color}
                />
              ))}
              {/* Custom color */}
              <button
                className={styles.swatchCustom}
                title="Özel renk"
                onClick={() => customColorRef.current?.click()}
              >
                🎨
                <input
                  ref={customColorRef}
                  type="color"
                  value={settings.highlightColor}
                  onChange={(e) => onChange({ highlightColor: e.target.value })}
                  className={styles.colorInput}
                />
              </button>
            </div>
          </div>

          {/* Highlight ratio */}
          <div className={styles.group}>
            <label className={styles.label}>
              <span>Highlight Oranı</span>
              <span className={styles.value}>
                {Math.round(settings.highlightRatio * 100)}%
              </span>
            </label>
            <input
              type="range"
              min={10}
              max={70}
              step={5}
              value={Math.round(settings.highlightRatio * 100)}
              onChange={(e) =>
                onChange({ highlightRatio: +e.target.value / 100 })
              }
              className={styles.slider}
            />
            <p className={styles.hint}>Kelimenin başından kaç harf renklensin</p>
          </div>

          {/* Theme */}
          <div className={styles.group}>
            <label className={styles.label}>
              <span>Tema</span>
            </label>
            <div className={styles.themeButtons}>
              {(
                [
                  { key: "dark", label: "🌙 Koyu" },
                  { key: "light", label: "☀️ Açık" },
                  { key: "sepia", label: "📜 Sepya" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  className={`${styles.themeBtn} ${
                    settings.theme === key ? styles.themeBtnActive : ""
                  }`}
                  onClick={() => onChange({ theme: key })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus line toggle */}
          <div className={styles.group}>
            <label className={`${styles.label} ${styles.toggleRow}`}>
              <span>Odak Çizgisi</span>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.showFocusLine}
                  onChange={(e) => onChange({ showFocusLine: e.target.checked })}
                />
                <span className={styles.track} />
              </label>
            </label>
          </div>
        </div>
      </aside>
    </>
  );
}
