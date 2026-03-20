"use client";

import { useRef, useCallback } from "react";
import { DEMO_TEXT } from "@/lib/demoText";
import styles from "./UploadScreen.module.css";

interface Props {
  onText: (text: string) => void;
  onPdfFile: (file: File) => void;
}

export default function UploadScreen({ onText, onPdfFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        onPdfFile(file);
      } else {
        file.text().then(onText);
      }
    },
    [onText, onPdfFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // reset so same file can be reloaded
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove(styles.dragover);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add(styles.dragover);
  };
  const handleDragLeave = () => {
    dropZoneRef.current?.classList.remove(styles.dragover);
  };

  const handleStart = () => {
    const text = textareaRef.current?.value.trim();
    if (text) onText(text);
  };

  return (
    <section className={styles.screen}>
      <div className={styles.hero}>
        <div className={styles.iconWrap}>
          <span>⚡</span>
        </div>
        <h1>FastRead</h1>
        <p className={styles.subtitle}>PDF veya metin yükle, hızlı okumaya başla</p>
      </div>

      {/* Demo button */}
      <button className={styles.demoBtn} onClick={() => onText(DEMO_TEXT)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Demo Metni Dene (~1000 kelime)
      </button>

      <div
        ref={dropZoneRef}
        className={styles.dropZone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={0.4}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p>
          PDF sürükle bırak veya{" "}
          <span className={styles.linkLabel}>dosya seç</span>
        </p>
        <span className={styles.uploadHint}>PDF veya TXT — max 50 MB</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          hidden
          onChange={handleFileInput}
        />
      </div>

      <div className={styles.divider}>
        <span>veya metin yapıştır</span>
      </div>

      <div className={styles.pasteArea}>
        <textarea
          ref={textareaRef}
          placeholder="Metni buraya yapıştır..."
          rows={7}
          className={styles.textarea}
        />
        <button className={styles.startBtn} onClick={handleStart}>
          <span>Okumaya Başla</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
