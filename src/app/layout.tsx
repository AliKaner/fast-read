import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastRead — Hızlı Okuma Uygulaması (PDF & Metin)",
  description:
    "Kişiselleştirilebilir hız kontrolü, biyonik vurgu (Bionic Reading) ve PDF bölüm tespitiyle okuma hızınızı 3 kata kadar artırın. Metinlerinizi ve kitaplarınızı daha verimli tüketin.",
  keywords: [
    "hızlı okuma",
    "speed reading",
    "biyonik okuma",
    "bionic reading",
    "pdf okuyucu",
    "okuma verimliliği",
    "kelime kelime okuma",
    "RSVP reader",
    "türkçe hızlı okuma",
  ],
  authors: [{ name: "FastRead Team" }],
  openGraph: {
    title: "FastRead — Akıllı Hızlı Okuma Platformu",
    description:
      "PDF ve metin dosyalarını biyonik vurgu ile kelime kelime okuyun. Okuma hızınızı bilimsel tekniklerle geliştirin.",
    url: "https://fastread.io", // Placeholder canonical
    siteName: "FastRead",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FastRead — Hızına Hız Kat",
    description:
      "Biyonik okuma tekniği ve akıllı PDF analizi ile tanışın. Okuma sürelerinizi yarıya indirin.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
