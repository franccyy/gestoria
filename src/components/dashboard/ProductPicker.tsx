"use client";

import { useId, useMemo, useState } from "react";
import { SearchField } from "@/components/ui/SearchField";
import { formatCurrency } from "@/lib/format";
import { searchProducts } from "@/services/store/productSearch";
import type { Product } from "@/types/store";

interface ProductPickerProps {
  onSelect: (product: Product) => void;
}

/** Busca de produto por nome para trocar o produto do card de indicadores. */
export function ProductPicker({ onSelect }: ProductPickerProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchProducts(query, 6), [query]);
  const resultsId = useId();
  const hasQuery = query.trim().length > 0;

  function choose(product: Product) {
    onSelect(product);
    setQuery("");
  }

  return (
    <div>
      <SearchField
        label="Buscar outro produto"
        placeholder="Ex.: arroz, coca 2l, leite"
        value={query}
        onValueChange={setQuery}
        aria-controls={hasQuery ? resultsId : undefined}
        onKeyDown={(event) => {
          // Enter escolhe o primeiro resultado.
          if (event.key === "Enter" && results[0]) {
            event.preventDefault();
            choose(results[0]);
          }
        }}
      />
      {hasQuery && (
        <div id={resultsId} aria-live="polite" className="mt-2">
          {results.length === 0 ? (
            <p className="rounded-sm bg-surface-muted px-4 py-3 text-body text-muted">
              Nenhum produto encontrado para “{query.trim()}”.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-sm border border-border bg-surface">
              {results.map((product) => (
                <li key={product.code}>
                  <button
                    type="button"
                    onClick={() => choose(product)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted"
                  >
                    <span className="min-w-0">
                      <span className="block text-body text-foreground">{product.name}</span>
                      <span className="block text-caption text-muted">{product.category}</span>
                    </span>
                    <span className="shrink-0 text-caption text-muted">
                      {formatCurrency(product.price)}
                      {product.unit === "kg" ? "/kg" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
