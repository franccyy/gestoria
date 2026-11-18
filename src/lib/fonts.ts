import { DM_Sans, Fraunces } from "next/font/google";

/**
 * Fontes da identidade visual do GestorIA.
 * - DM Sans: textos funcionais (botões, rótulos, descrições).
 * - Fraunces: títulos serifados elegantes.
 *
 * O next/font baixa as fontes durante o build e as serve pelo
 * próprio app (gratuito, sem chamadas externas no navegador).
 * Cada fonte expõe uma variável CSS usada em src/styles/tokens.css.
 */
export const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const fontSerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
