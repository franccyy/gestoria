"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isNavItemActive } from "@/lib/navigation";

/**
 * Navegação inferior fixa com as cinco seções.
 * A aba da tela atual fica destacada automaticamente.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-20">
      <ul className="pb-safe mx-auto grid max-w-app grid-cols-5 gap-1 border-t-thick border-border bg-background px-2 pt-2">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-[4.25rem] flex-col items-center justify-center gap-1 rounded-sm px-1 transition-colors",
                  "text-caption sm:text-body",
                  active ? "bg-highlight text-primary" : "text-foreground hover:bg-surface-muted",
                )}
              >
                <Icon name={item.icon} className="size-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
