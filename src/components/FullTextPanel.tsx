"use client";

import { useState, useEffect, useRef } from "react";
import { splitWord } from "@/lib/utils";
import type { ReaderSettings } from "@/lib/types";
import styles from "./FullTextPanel.module.css";

interface Props {
  words: string[];
  activeIndex: number;
  settings: ReaderSettings;
  onWordClick: (index: number) => void;
}

export default function FullTextPanel({
  words,
  activeIndex,
  settings,
  onWordClick,
}: Props) {
  const [open, setOpen] = useState(true);
  const activeRef = useRef<HTMLSpanElement | null>(null);

  // Auto-scroll active word into view only when panel is open
  useEffect(() => {
    if (open) {
      activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeIndex, open]);

  return (
    <div className={`${styles.panel} ${open ? styles.panelOpen : styles.panelClosed}`}>
      <button
        className={styles.header}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.headerLeft}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 6h16M4 12h16M4 18h10" />
          </svg>
          Tam Metin
        </span>
        <span className={styles.headerRight}>
          <span className={styles.hint}>tıkla → oradan devam et</span>
          <span className={`${styles.chevron} ${open ? styles.chevronUp : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </span>
      </button>

      <div className={styles.bodyWrapper}>
        <div className={styles.body}>
          {words.map((word, i) => {
            const [hi, rest] = splitWord(word, settings.highlightRatio);
            const isActive = i === activeIndex;
            return (
              <span
                key={i}
                ref={isActive ? activeRef : null}
                className={`${styles.word} ${isActive ? styles.wordActive : ""}`}
                onClick={() => onWordClick(i)}
              >
                <span
                  className={styles.wordHi}
                  style={
                    isActive
                      ? undefined
                      : { color: settings.highlightColor, opacity: 0.8 }
                  }
                >
                  {hi}
                </span>
                <span className={styles.wordRest}>{rest}</span>
                {" "}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
