/**
 * Splits raw text into a clean array of words,
 * filtering out empty strings from whitespace-only splits.
 */
export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

/**
 * Splits a word into [highlighted prefix, rest] based on the ratio.
 * Always highlights at least 1 character, at most all characters.
 */
export function splitWord(word: string, ratio: number): [string, string] {
  const len = Math.max(1, Math.min(word.length, Math.ceil(word.length * ratio)));
  return [word.slice(0, len), word.slice(len)];
}

/**
 * Converts WPM to the interval in milliseconds between words.
 */
export function wpmToMs(wpm: number): number {
  return Math.round((60 / wpm) * 1000);
}
