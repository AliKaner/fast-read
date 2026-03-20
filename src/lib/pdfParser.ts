export interface PdfChapter {
  title: string;
  pageFrom: number; // 1-indexed
  pageTo: number;   // 1-indexed inclusive
}

export interface PdfOutlineItem {
  title: string;
  dest: unknown;
  items?: PdfOutlineItem[];
}

/**
 * Load a PDF and extract chapters.
 * Strategy:
 *   1. Try native PDF outline (bookmarks / TOC)
 *   2. Fall back to heuristic heading detection
 */
export async function extractPdfChapters(
  file: File
): Promise<{ chapters: PdfChapter[]; numPages: number; pdfjsLib: typeof import("pdfjs-dist") }> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const url = URL.createObjectURL(file);
  const pdf = await pdfjsLib.getDocument({ url }).promise;
  const numPages = pdf.numPages;

  // ── 1. Try native outline ──────────────────────────────────────────────────
  const outline = await pdf.getOutline();
  if (outline && outline.length > 0) {
    const chapters = await resolveOutlineChapters(
      outline as PdfOutlineItem[],
      pdf,
      numPages
    );
    if (chapters.length > 0) {
      URL.revokeObjectURL(url);
      return { chapters, numPages, pdfjsLib };
    }
  }

  // ── 2. Heuristic: detect headings page by page ─────────────────────────────
  const heuristicChapters = await detectChaptersHeuristic(pdf, numPages);
  URL.revokeObjectURL(url);
  return { chapters: heuristicChapters, numPages, pdfjsLib };
}

/** Extract text for a given page range (1-indexed, inclusive). */
export async function extractPageRange(
  file: File,
  from: number,
  to: number
): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const url = URL.createObjectURL(file);
  try {
    const pdf = await pdfjsLib.getDocument({ url }).promise;
    const parts: string[] = [];
    for (let p = from; p <= Math.min(to, pdf.numPages); p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      
      let pageText = "";
      let lastItem: any = null;

      for (const item of content.items) {
        if (!("str" in item)) continue;
        const str = item.str;
        const transform = item.transform; // [scaleX, skewY, skewX, scaleY, translateX, translateY]
        
        if (lastItem) {
          const lastTransform = lastItem.transform;
          const isSameLine = Math.abs(transform[5] - lastTransform[5]) < 2;
          
          if (isSameLine) {
            // Check horizontal gap
            const gap = transform[4] - (lastTransform[4] + lastItem.width);
            // If gap is large, add a space (heuristically > 20% of font height/width)
            // But if it's small or negative (overlap), just join
            if (gap > 2) {
              pageText += " ";
            }
          } else {
            // New line
            pageText += "\n";
          }
        }
        
        pageText += str;
        lastItem = item;
      }
      parts.push(pageText.normalize("NFKC"));
    }
    return parts.join("\n");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Full document text (for non-chapter PDFs). */
export async function parsePdf(file: File): Promise<string> {
  return extractPageRange(file, 1, 99999);
}

// ── helpers ────────────────────────────────────────────────────────────────

type PdfDocProxy = Awaited<ReturnType<typeof import("pdfjs-dist").getDocument>["promise"]>;

async function resolveOutlineChapters(
  outline: PdfOutlineItem[],
  pdf: PdfDocProxy,
  numPages: number
): Promise<PdfChapter[]> {
  // Flatten top-level items only (nested sub-chapters are merged into parent)
  const items = outline.filter((o) => o.title && o.dest);

  const withPages: { title: string; page: number }[] = [];
  for (const item of items) {
    try {
      // dest can be array or string; getDestination normalises it
      let destArray = item.dest;
      if (typeof destArray === "string") {
        destArray = await pdf.getDestination(destArray);
      }
      if (!Array.isArray(destArray)) continue;
      const ref = destArray[0] as { num: number; gen: number };
      const pageIndex = await pdf.getPageIndex(ref); // 0-indexed
      withPages.push({ title: item.title, page: pageIndex + 1 });
    } catch {
      // skip items that can't be resolved
    }
  }

  if (withPages.length === 0) return [];

  // Sort by page number ascending
  withPages.sort((a, b) => a.page - b.page);

  return withPages.map((item, i) => ({
    title: item.title,
    pageFrom: item.page,
    pageTo: i + 1 < withPages.length ? withPages[i + 1].page - 1 : numPages,
  }));
}

const HEADING_PATTERNS = [
  /^(chapter|bölüm|kısım|bab|kisim|part|section|appendix)\s*\d*/i,
  /^\d+[\.\s]+[A-ZÇĞİÖŞÜ][^\n]{2,50}$/,
  /^[IVXLCDM]+[\.\s]+[A-ZÇĞİÖŞÜ][^\n]{2,50}$/,
];

async function detectChaptersHeuristic(
  pdf: PdfDocProxy,
  numPages: number
): Promise<PdfChapter[]> {
  const chapters: PdfChapter[] = [];
  let prevChapterStart = 1;
  let prevChapterTitle = "Başlangıç";

  for (let p = 1; p <= numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();

    // Group the first few items into lines to find headings
    const lines: string[] = [];
    let currentLine = "";
    let lastY = -1;

    for (const item of content.items.slice(0, 15)) {
      if (!("str" in item)) continue;
      const y = Math.round(item.transform[5]);
      if (lastY !== -1 && Math.abs(y - lastY) > 2) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = "";
      }
      currentLine += item.str;
      lastY = y;
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    for (const str of lines) {
      if (str.length < 3 || str.length > 80) continue;
      if (HEADING_PATTERNS.some((r) => r.test(str))) {
        if (p > prevChapterStart) {
          chapters.push({
            title: prevChapterTitle,
            pageFrom: prevChapterStart,
            pageTo: p - 1,
          });
        }
        prevChapterStart = p;
        prevChapterTitle = str;
        break;
      }
    }
  }

  // Push the last chapter
  chapters.push({
    title: prevChapterTitle,
    pageFrom: prevChapterStart,
    pageTo: numPages,
  });

  // If only one "chapter" detected = no real chapters found → label it as whole book
  if (chapters.length === 1) {
    chapters[0].title = "Tüm Belge";
  }

  return chapters;
}
