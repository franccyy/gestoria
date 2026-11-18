/**
 * PONTO ÚNICO DE ACESSO À BASE FICTÍCIA.
 *
 * Nenhuma outra parte do app lê os arquivos de dados diretamente.
 * Quando houver banco de dados ou integração com ERP, a troca começa aqui.
 */
import { parseMonthKey, type MonthRef } from "@/lib/periods";
import type { Product, SalesRecord } from "@/types/store";
import { PRODUCTS } from "./products";
import salesFile from "./sales.json";

export interface DatasetInfo {
  storeName: string;
  /** Primeiro mês com vendas registradas. */
  firstMonth: MonthRef;
  /** Último mês com vendas: é o "mês atual" das consultas. */
  referenceMonth: MonthRef;
}

export const DATASET_INFO: DatasetInfo = {
  storeName: "Loja Demonstração 01",
  firstMonth: parseMonthKey(salesFile.firstPeriod),
  referenceMonth: parseMonthKey(salesFile.lastPeriod),
};

export const ALL_PRODUCTS: readonly Product[] = PRODUCTS;
export const ALL_SALES: readonly SalesRecord[] = salesFile.records;
