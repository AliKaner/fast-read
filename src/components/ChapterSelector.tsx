"use client";

import type { PdfChapter } from "@/lib/pdfParser";
import styles from "./ChapterSelector.module.css";

interface Props {
  fileName: string;
  chapters: PdfChapter[];
  onSelect: (chapter: PdfChapter) => void;
  onSelectAll: () => void;
  onBack: () => void;
  loading?: boolean;
}

export default function ChapterSelector({
  fileName,
  chapters,
  onSelect,
  onSelectAll,
  onBack,
  loading,
}: Props) {
  return (
    <section className={styles.screen}>
      <div className={styles.top}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Geri
        </button>
        <div className={styles.fileInfo}>
          <span className={styles.fileIcon}>📄</span>
          <span className={styles.fileName}>{fileName}</span>
          <span className={styles.pageCount}>{chapters.length} bölüm bulundu</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Bölümler tespit ediliyor…</p>
        </div>
      ) : (
        <>
          <button className={styles.readAllBtn} onClick={onSelectAll}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Tüm Belgeyi Oku
          </button>

          <div className={styles.grid}>
            {chapters.map((ch, i) => (
              <button
                key={i}
                className={styles.card}
                onClick={() => onSelect(ch)}
              >
                <div className={styles.cardIndex}>{i + 1}</div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{ch.title}</div>
                  <div className={styles.cardMeta}>
                    {ch.pageFrom === ch.pageTo
                      ? `Sayfa ${ch.pageFrom}`
                      : `Sayfa ${ch.pageFrom} – ${ch.pageTo}`}
                    {" · "}
                    {ch.pageTo - ch.pageFrom + 1} sayfa
                  </div>
                </div>
                <svg
                  className={styles.cardArrow}
                  width="16" height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
