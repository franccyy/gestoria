import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Conjunto único de ícones do GestorIA, desenhados em SVG simples
 * (traço de 1.75px, grade 24×24). Herdam a cor do texto (currentColor).
 *
 * Uso: <Icon name="home" />  ou  <Icon name="mic" className="size-6" />
 * Para adicionar um ícone, inclua um novo item em ICONS.
 */
const ICONS = {
  home: <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  chat: (
    <>
      <path d="M4 4.5h10a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H8.5L5 15.5V13H4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1z" />
      <path d="M18 8.5h2a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1h-1v2.5L15.5 17H11a1 1 0 0 1-1-1v-.5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M9 16v-5M13 16V8M17 16v-3" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12A8.5 8.5 0 1 0 6 6L3.5 8.5" />
      <path d="M3.5 4v4.5H8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  scanEye: (
    <>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <path d="M7 12s2-3.5 5-3.5 5 3.5 5 3.5-2 3.5-5 3.5S7 12 7 12z" />
      <circle cx="12" cy="12" r="1.25" />
    </>
  ),
  sparkles: (
    <>
      <path d="M11 3.5 12.7 9l5.3 1.7-5.3 1.8L11 18l-1.7-5.5L4 10.7 9.3 9z" />
      <path d="M18.5 3v4M16.5 5h4M18 16.5v3M16.5 18h3" />
    </>
  ),
  arrowUpRight: <path d="M7 17 17 7M8.5 7H17v8.5" />,
  arrowUp: <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </>
  ),
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="2" />,
  scan: <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M7.5 12h9" />,
  calendarClock: (
    <>
      <path d="M20 10.5V6.5A1.5 1.5 0 0 0 18.5 5h-13A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20H11M4 10h16M8.5 3v4M15.5 3v4" />
      <circle cx="17" cy="17" r="4" />
      <path d="M17 15.25V17l1.25 1" />
    </>
  ),
  packageX: (
    <>
      <path d="M20.5 12V8L12 3.5 3.5 8v8L12 20.5l1.5-.8" />
      <path d="M3.5 8 12 12.5 20.5 8M12 12.5v8" />
      <path d="m16.5 16 4 4m0-4-4 4" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.75v.5" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 4.3 2.9 17.5A2 2 0 0 0 4.6 20.5h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
      <path d="M12 9.5v4.5M12 17v.5" />
    </>
  ),
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.5h6.4a1.5 1.5 0 0 0 1.5-1.5l.8-12M10 11v6M14 11v6" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  className?: string;
  /** Texto para leitores de tela. Sem ele, o ícone é tratado como decorativo. */
  title?: string;
}

export function Icon({ name, className, title }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {ICONS[name]}
    </svg>
  );
}
