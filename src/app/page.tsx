"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import UploadScreen from "@/components/UploadScreen";
import RSVPReader, { RSVPReaderHandle } from "@/components/RSVPReader";
import FullTextPanel from "@/components/FullTextPanel";
import SettingsPanel from "@/components/SettingsPanel";
import ChapterSelector from "@/components/ChapterSelector";
import { tokenize } from "@/lib/utils";
import { DEFAULT_SETTINGS } from "@/lib/types";
import type { ReaderSettings } from "@/lib/types";
import type { PdfChapter } from "@/lib/pdfParser";
import styles from "./page.module.css";

// Page flow states
type AppState =
  | { screen: "upload" }
  | { screen: "chapters"; file: File; chapters: PdfChapter[] }
  | { screen: "reader"; words: string[] };

export default function Home() {
  const [appState, setAppState] = useState<AppState>({ screen: "upload" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const readerRef = useRef<RSVPReaderHandle>(null);

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  // ── Plain text ────────────────────────────────────────────────────────────
  const handleText = useCallback((text: string) => {
    setActiveIndex(0);
    setAppState({ screen: "reader", words: tokenize(text) });
  }, []);

  // ── PDF file: detect chapters ─────────────────────────────────────────────
  const handlePdfFile = useCallback(async (file: File) => {
    setChaptersLoading(true);
    // Initially show the chapter screen with loading state
    setAppState({ screen: "chapters", file, chapters: [] });
    try {
      const { extractPdfChapters } = await import("@/lib/pdfParser");
      const { chapters } = await extractPdfChapters(file);
      setAppState({ screen: "chapters", file, chapters });
    } catch (err) {
      console.error("Chapter extraction failed:", err);
      // Fall back: read the whole PDF
      const { parsePdf } = await import("@/lib/pdfParser");
      const text = await parsePdf(file);
      setActiveIndex(0);
      setAppState({ screen: "reader", words: tokenize(text) });
    } finally {
      setChaptersLoading(false);
    }
  }, []);

  // ── Chapter selected ──────────────────────────────────────────────────────
  const handleChapterSelect = useCallback(
    async (chapter: PdfChapter) => {
      if (appState.screen !== "chapters") return;
      setChaptersLoading(true);
      try {
        const { extractPageRange } = await import("@/lib/pdfParser");
        const text = await extractPageRange(
          appState.file,
          chapter.pageFrom,
          chapter.pageTo
        );
        setActiveIndex(0);
        setAppState({ screen: "reader", words: tokenize(text) });
      } finally {
        setChaptersLoading(false);
      }
    },
    [appState]
  );

  // ── Read whole PDF ────────────────────────────────────────────────────────
  const handleReadAll = useCallback(async () => {
    if (appState.screen !== "chapters") return;
    setChaptersLoading(true);
    try {
      const { parsePdf } = await import("@/lib/pdfParser");
      const text = await parsePdf(appState.file);
      setActiveIndex(0);
      setAppState({ screen: "reader", words: tokenize(text) });
    } finally {
      setChaptersLoading(false);
    }
  }, [appState]);

  // ── Close reader ──────────────────────────────────────────────────────────
  const handleClose = () => {
    setAppState({ screen: "upload" });
    setActiveIndex(0);
  };

  const handleWordClick = (i: number) => {
    setActiveIndex(i);
    readerRef.current?.jumpTo(i);
  };

  const patchSettings = (patch: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const isReader = appState.screen === "reader";

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>⚡</span>
          <span>
            Fast<span className={styles.logoAccent}>Read</span>
          </span>
        </div>
        <button
          className={styles.settingsBtn}
          onClick={() => setSettingsOpen(true)}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Ayarlar
        </button>
      </header>

      {/* Settings Panel */}
      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onChange={patchSettings}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Main */}
      <main className={`${styles.main} ${isReader ? styles.mainReader : ""}`}>
        {appState.screen === "upload" && (
          <UploadScreen onText={handleText} onPdfFile={handlePdfFile} />
        )}

        {appState.screen === "chapters" && (
          <ChapterSelector
            fileName={appState.file.name}
            chapters={appState.chapters}
            onSelect={handleChapterSelect}
            onSelectAll={handleReadAll}
            onBack={handleClose}
            loading={chaptersLoading}
          />
        )}

        {appState.screen === "reader" && (
          <>
            <RSVPReader
              ref={readerRef}
              words={appState.words}
              settings={settings}
              onClose={handleClose}
              onIndexChange={setActiveIndex}
            />
            <FullTextPanel
              words={appState.words}
              activeIndex={activeIndex}
              settings={settings}
              onWordClick={handleWordClick}
            />
          </>
        )}
      </main>
    </>
  );
}
