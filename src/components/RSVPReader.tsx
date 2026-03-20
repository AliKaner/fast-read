"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { ReaderSettings } from "@/lib/types";
import { splitWord, wpmToMs } from "@/lib/utils";
import styles from "./RSVPReader.module.css";

interface Props {
  words: string[];
  settings: ReaderSettings;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export interface RSVPReaderHandle {
  jumpTo: (index: number) => void;
}



const RSVPReader = forwardRef<RSVPReaderHandle, Props>(function RSVPReader(
  { words, settings, onClose, onIndexChange },
  ref
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [localWpm, setLocalWpm] = useState(settings.wpm);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const playingRef = useRef(false);

  // keep refs in sync
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { setLocalWpm(settings.wpm); }, [settings.wpm]);

  // expose jumpTo
  useImperativeHandle(ref, () => ({
    jumpTo(i: number) {
      setCurrentIndex(i);
      indexRef.current = i;
      onIndexChange?.(i);
    },
  }));

  const advance = useCallback(() => {
    if (!playingRef.current) return;
    const next = indexRef.current + 1;
    if (next >= words.length) {
      setPlaying(false);
      return;
    }
    setCurrentIndex(next);
    indexRef.current = next;
    onIndexChange?.(next);
    timerRef.current = setTimeout(advance, wpmToMs(localWpm));
  }, [words.length, onIndexChange, localWpm]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setTimeout(advance, wpmToMs(localWpm));
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, advance, localWpm]);

  const togglePlay = () => {
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(0);
      indexRef.current = 0;
    }
    setPlaying((p) => !p);
  };

  const goBack = () => {
    const next = Math.max(0, currentIndex - 1);
    setCurrentIndex(next);
    indexRef.current = next;
    onIndexChange?.(next);
  };

  const goForward = () => {
    const next = Math.min(words.length - 1, currentIndex + 1);
    setCurrentIndex(next);
    indexRef.current = next;
    onIndexChange?.(next);
  };

  const restart = () => {
    setPlaying(false);
    setCurrentIndex(0);
    indexRef.current = 0;
    onIndexChange?.(0);
  };

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowLeft") goBack();
      if (e.code === "ArrowRight") goForward();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const word = words[currentIndex] ?? "";
  const [hi, rest] = splitWord(word, settings.highlightRatio);
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  return (
    <section className={styles.screen}>
      {/* Progress bar */}
      <div className={styles.progressWrap}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        <span className={styles.progressLabel}>
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* RSVP Display */}
      <div className={styles.rsvpContainer}>
        {settings.showFocusLine && (
          <div className={styles.focusLine} />
        )}
        <div
          key={currentIndex}
          className={styles.word}
          style={{ fontSize: `${settings.fontSize}px` }}
        >
          <span
            className={styles.hi}
            style={{ color: settings.highlightColor }}
          >
            {hi}
          </span>
          <span className={styles.rest}>{rest}</span>
        </div>
        <div className={styles.meta}>
          <span>{localWpm} KDK</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={restart} title="Başa dön">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
          </svg>
        </button>
        <button className={styles.ctrlBtn} onClick={goBack} title="Geri (←)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          className={`${styles.ctrlBtn} ${styles.playBtn}`}
          onClick={togglePlay}
          title="Oynat / Duraklat (Space)"
        >
          {playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        <button className={styles.ctrlBtn} onClick={goForward} title="İleri (→)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button className={styles.ctrlBtn} onClick={onClose} title="Çıkış">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Speed slider */}
      <div className={styles.speedRow}>
        <div className={styles.speedLabelRow}>
          <span className={styles.speedLabelText}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Okuma Hızı
          </span>
          <span className={styles.speedValue}>{localWpm} KDK</span>
        </div>
        <input
          type="range"
          min={60}
          max={900}
          step={10}
          value={localWpm}
          onChange={(e) => setLocalWpm(+e.target.value)}
          className={styles.speedSlider}
          style={{ "--fill": `${((localWpm - 60) / (900 - 60)) * 100}%` } as React.CSSProperties}
        />
        <span className={styles.speedHints}>
          <span>60 KDK</span><span>900 KDK</span>
        </span>
      </div>
    </section>
  );
});

export default RSVPReader;
