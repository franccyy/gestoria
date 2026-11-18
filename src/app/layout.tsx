import type { Metadata, Viewport } from "next";
import { fontSans, fontSerif } from "@/lib/fonts";
import { AppProviders } from "@/state/AppProviders";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "GestorIA",
  description: "Assistente inteligente de gestão de lojas — protótipo com dados fictícios.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body className="min-h-dvh">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
