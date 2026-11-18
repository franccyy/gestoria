/** Categorias de produtos da loja. */
export type ProductCategory =
  | "Bebidas"
  | "Mercearia"
  | "Laticínios"
  | "Higiene"
  | "Limpeza"
  | "Hortifrúti"
  | "Padaria";

/** Unidade de venda: por unidade ou por quilo. */
export type ProductUnit = "un" | "kg";

/** Cadastro de um produto. */
export interface Product {
  /** Código interno do produto. */
  code: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  /** Preço de venda atual, em reais. */
  price: number;
  /** Saldo disponível em estoque (na unidade do produto). */
  stock: number;
  /** Abaixo ou igual a este saldo, o produto é considerado com estoque baixo. */
  minStock: number;
}

/**
 * Venda consolidada de um produto em um mês (histórico de vendas).
 * A quantidade vendida e o faturamento de qualquer período são
 * calculados somando estes registros.
 */
export interface SalesRecord {
  productCode: string;
  /** Mês no formato "AAAA-MM" (ex.: "2026-11"). */
  period: string;
  quantity: number;
  /** Faturamento do mês, em reais (quantidade × preço praticado no período). */
  revenue: number;
}
