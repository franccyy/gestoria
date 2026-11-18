import type { Product } from "@/types/store";

/**
 * Cadastro FICTÍCIO de produtos da loja de demonstração.
 * Preços em reais. Saldo e estoque mínimo na unidade do produto (un ou kg).
 *
 * Produtos propositalmente com estoque baixo (saldo ≤ mínimo), para testes:
 * Suco de Laranja, Manteiga, Shampoo, Sabão em Pó (zerado) e Tomate.
 *
 * Ao alterar esta lista, gere novamente o histórico de vendas:
 *   npm run data:generate
 */
export const PRODUCTS: readonly Product[] = [
  // Bebidas
  { code: "1001", name: "Coca-Cola 2 litros", category: "Bebidas", unit: "un", price: 10.99, stock: 124, minStock: 60 },
  { code: "1002", name: "Coca-Cola Lata 350 ml", category: "Bebidas", unit: "un", price: 4.49, stock: 210, minStock: 100 },
  { code: "1003", name: "Guaraná Antarctica 2 litros", category: "Bebidas", unit: "un", price: 8.99, stock: 96, minStock: 50 },
  { code: "1004", name: "Água Mineral sem Gás 1,5 litro", category: "Bebidas", unit: "un", price: 3.49, stock: 180, minStock: 80 },
  { code: "1005", name: "Suco de Laranja Integral 1 litro", category: "Bebidas", unit: "un", price: 12.9, stock: 8, minStock: 20 },
  { code: "1006", name: "Cerveja Pilsen Lata 350 ml", category: "Bebidas", unit: "un", price: 3.99, stock: 480, minStock: 200 },

  // Mercearia
  { code: "2001", name: "Arroz Branco Tipo 1 5 kg", category: "Mercearia", unit: "un", price: 27.9, stock: 85, minStock: 40 },
  { code: "2002", name: "Feijão Carioca 1 kg", category: "Mercearia", unit: "un", price: 8.49, stock: 140, minStock: 60 },
  { code: "2003", name: "Açúcar Refinado 1 kg", category: "Mercearia", unit: "un", price: 4.99, stock: 160, minStock: 60 },
  { code: "2004", name: "Café Torrado e Moído 500 g", category: "Mercearia", unit: "un", price: 18.9, stock: 72, minStock: 40 },
  { code: "2005", name: "Óleo de Soja 900 ml", category: "Mercearia", unit: "un", price: 7.49, stock: 130, minStock: 50 },
  { code: "2006", name: "Macarrão Espaguete 500 g", category: "Mercearia", unit: "un", price: 4.29, stock: 190, minStock: 70 },
  { code: "2007", name: "Farinha de Trigo 1 kg", category: "Mercearia", unit: "un", price: 5.49, stock: 95, minStock: 40 },
  { code: "2008", name: "Molho de Tomate 340 g", category: "Mercearia", unit: "un", price: 2.99, stock: 260, minStock: 90 },
  { code: "2009", name: "Biscoito Recheado Chocolate 140 g", category: "Mercearia", unit: "un", price: 2.79, stock: 230, minStock: 100 },

  // Laticínios
  { code: "3001", name: "Leite Integral 1 litro", category: "Laticínios", unit: "un", price: 5.29, stock: 420, minStock: 200 },
  { code: "3002", name: "Iogurte Natural 170 g", category: "Laticínios", unit: "un", price: 2.99, stock: 150, minStock: 60 },
  { code: "3003", name: "Queijo Muçarela Fatiado 150 g", category: "Laticínios", unit: "un", price: 9.9, stock: 64, minStock: 30 },
  { code: "3004", name: "Manteiga com Sal 200 g", category: "Laticínios", unit: "un", price: 12.49, stock: 6, minStock: 15 },
  { code: "3005", name: "Requeijão Cremoso 200 g", category: "Laticínios", unit: "un", price: 8.99, stock: 58, minStock: 25 },

  // Higiene
  { code: "4001", name: "Papel Higiênico Folha Dupla 12 rolos", category: "Higiene", unit: "un", price: 21.9, stock: 70, minStock: 30 },
  { code: "4002", name: "Creme Dental 90 g", category: "Higiene", unit: "un", price: 4.99, stock: 110, minStock: 45 },
  { code: "4003", name: "Sabonete em Barra 85 g", category: "Higiene", unit: "un", price: 2.49, stock: 175, minStock: 70 },
  { code: "4004", name: "Shampoo 350 ml", category: "Higiene", unit: "un", price: 16.9, stock: 4, minStock: 12 },

  // Limpeza
  { code: "5001", name: "Detergente Líquido 500 ml", category: "Limpeza", unit: "un", price: 2.69, stock: 240, minStock: 90 },
  { code: "5002", name: "Sabão em Pó 1,6 kg", category: "Limpeza", unit: "un", price: 24.9, stock: 0, minStock: 10 },
  { code: "5003", name: "Água Sanitária 2 litros", category: "Limpeza", unit: "un", price: 6.99, stock: 88, minStock: 35 },
  { code: "5004", name: "Amaciante 2 litros", category: "Limpeza", unit: "un", price: 15.9, stock: 46, minStock: 20 },

  // Hortifrúti (vendidos por quilo)
  { code: "6001", name: "Banana Prata", category: "Hortifrúti", unit: "kg", price: 6.49, stock: 95, minStock: 40 },
  { code: "6002", name: "Tomate", category: "Hortifrúti", unit: "kg", price: 8.99, stock: 9, minStock: 25 },
  { code: "6003", name: "Batata Inglesa", category: "Hortifrúti", unit: "kg", price: 5.99, stock: 120, minStock: 40 },

  // Padaria
  { code: "7001", name: "Pão Francês", category: "Padaria", unit: "kg", price: 16.9, stock: 45, minStock: 20 },
  { code: "7002", name: "Pão de Forma 500 g", category: "Padaria", unit: "un", price: 8.49, stock: 38, minStock: 15 },
];
