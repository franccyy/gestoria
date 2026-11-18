# Testes do GestorIA

## 1. Testes automáticos

```bash
npm test
```

Resultado esperado: `# pass 103` e `# fail 0`. Eles conferem, sem abrir o navegador:

| Arquivo | O que verifica |
|---|---|
| `src/lib/periods.test.ts` | Meses, anos, período anterior, nomes dos períodos |
| `src/services/store/storeQueries.test.ts` | Base (≥ 30 produtos, um registro por produto e mês), saldo, vendas, faturamento da loja = soma dos produtos, representatividade soma 100%, rankings, estoque baixo, categorias, períodos sem dados |
| `src/services/store/productSearch.test.ts` | Busca de produtos (acentos, abreviações, números exatos) |
| `src/services/assistant/rules/parsers.test.ts` | Leitura de períodos, produtos e intenções |
| `src/services/assistant/rules/ruleEngine.test.ts` | Conversas completas: perguntas sugeridas, contexto, comparações, permissões, categorias, respostas de "não encontrei" |
| `src/services/dashboard/indicators.test.ts` | Números dos Indicadores e escolha do produto exibido |

Cada número das respostas é conferido contra uma soma feita de forma independente, direto nos registros de venda.

Também rode `npm run typecheck` (tipos) e `npm run build` (versão de produção) antes de publicar: os dois devem terminar sem erros.

> Durante o desenvolvimento, as telas também foram testadas automaticamente em um navegador (Playwright): 6 telas × 4 perfis, auditoria de acessibilidade, teclado, microfone simulado e larguras de 320 a 1280 px. Esses testes não fazem parte do projeto para não exigir a instalação de mais ferramentas; o roteiro abaixo cobre os mesmos pontos manualmente.

## 2. Roteiro manual

Rode `npm run dev` e abra <http://localhost:3000>. Os valores esperados vêm da base fictícia e são sempre os mesmos.

### 2.1 Perfis e navegação

| Ação | Esperado |
|---|---|
| Abrir o app | "Sua loja mais inteligente." com 4 perfis; "Explorar protótipo" só habilita após escolher |
| Escolher **Gerente** e explorar | Início com "Visão demonstrativa · Gerente" e a faixa "Dados fictícios · Sem conexão com ERP" |
| Tocar em cada aba | A tela abre e a aba fica destacada em verde-claro |
| Recarregar a página (F5) | Perfil e conversa continuam |
| Abrir `/inicio` numa aba anônima | Volta para a seleção de perfil |
| "Trocar perfil" | Volta à seleção com o perfil atual marcado; trocar de perfil começa uma conversa nova |

### 2.2 Assistente (perfil Gerente, nesta ordem)

| # | Pergunta | Esperado |
|---|---|---|
| 1 | Qual o saldo atual da Coca-Cola 2 litros? | 124 unidades (mínimo 60 un.) |
| 2 | Quanto vendemos de Coca-Cola 2 litros? | 850 unidades em novembro de 2026 · R$ 9.341,50 |
| 3 | E no mês passado? | 790 unidades em outubro de 2026 |
| 4 | E o Guaraná? | Guaraná Antarctica 2 litros, outubro de 2026 |
| 5 | Quanto vendemos neste mês? | R$ 182.346,06, alta de 2,1% |
| 6 | Qual produto possui maior faturamento? | Pão Francês, R$ 21.733,40 (vendido por quilo) |
| 7 | Qual a representatividade da Coca-Cola nas vendas? | Coca-Cola 2 litros 5,1% · Coca-Cola Lata 3,5% · juntos 8,6% |
| 8 | Quais são os cinco produtos mais vendidos? | 1º Leite Integral (2.611 un.) … 4º Pão Francês (1.286 kg) |
| 9 | E em outubro? | O mesmo ranking, em outubro |
| 10 | Quais são os 3 produtos mais vendidos da categoria limpeza? | Detergente, Água Sanitária, Sabão em Pó |
| 11 | Quais são os 3 produtos mais vendidos de cada categoria? | 7 listas com título; nota "Padaria tem só 2 produtos" |
| 12 | Faturamento por categoria | Mercearia em 1º (R$ 49.624,60) |
| 13 | Quais produtos estão com estoque baixo? | 5 produtos; Sabão em Pó (0 un.) em vermelho |
| 14 | Compare este ano com o ano passado | Loja: 2026 (jan. a nov.) × 2025 (jan. a nov.) |
| 15 | Qual o saldo da picanha? | "Não encontrei "picanha"…" em amarelo |
| 16 | Mais vendidos da categoria frios | "Não encontrei "frios"…" e a lista de categorias |
| 17 | Vendas por marca | Explica que a base não tem informação por marca |
| 18 | Quanto vendemos de Coca-Cola 2 litros em dezembro de 2026? | "Não encontrei dados de vendas para dezembro de 2026…" |
| 19 | Quanto vendemos hoje? | Explica que os dados são mensais |

### 2.3 Permissões (perfil Funcionário)

| Pergunta / tela | Esperado |
|---|---|
| Quanto vendemos neste mês? | Explica que o total da loja é exclusivo de Gerente/Administrador, sem valores |
| Quanto vendemos de Coca-Cola 2 litros? | 850 unidades, sem R$ |
| Qual produto possui maior faturamento? | Bloqueado com explicação |
| 3 mais vendidos de cada categoria | Liberado (é por quantidade), sem R$ |
| Início | Sem a sugestão "Vendas do mês" |
| Indicadores | Sem cards da loja e sem representatividade; card do produto mostra "Preço atual" |

### 2.4 Microfone (Chrome ou Edge, em localhost)

| Ação | Esperado |
|---|---|
| Tocar no microfone | Pede permissão; o botão vira "Parar gravação" e aparece "Ouvindo…" |
| Falar "quanto vendemos de coca cola dois litros" | O texto aparece no campo; **não** é enviado sozinho |
| Tocar em enviar | Resposta com 850 unidades |
| Negar a permissão | Mensagem explicando; digitar continua funcionando |
| Abrir no Firefox | Sem botão de microfone; aviso de que dá para continuar digitando |

### 2.5 Indicadores (perfil Gerente)

| Situação | Esperado |
|---|---|
| Sem nenhuma pergunta feita | Loja R$ 182.346 · +2,1% · card "Mais vendido do mês: Leite Integral 1 litro" |
| Depois de perguntar sobre a Coca-Cola 2 litros | Card "Último produto consultado no Assistente": 124 un. · 850 un. no mês · 8.867 un. no ano · R$ 9.341,50 · comparação 850 / 790 / 832 un. · representatividade 5,1% |
| Buscar "sabao" e escolher | "Produto escolhido na busca", selo "Sem estoque", saldo em vermelho; endereço com `?produto=5002` |
| Buscar "banana" + Enter | Escolhe o primeiro resultado; valores em kg |
| Buscar "picanha" | "Nenhum produto encontrado" |
| "Voltar ao produto padrão" | Volta ao último consultado |
| "Perguntar ao assistente" | Abre o Assistente com a pergunta já escrita |

### 2.6 Histórico e Auditoria

| Ação | Esperado |
|---|---|
| Abrir Histórico após perguntas | Mais recente primeiro; "Ver resposta completa" mostra o texto inteiro, inclusive listas |
| "Perguntar novamente" | Abre o Assistente com a pergunta no campo |
| "Limpar histórico" | Pede confirmação; Cancelar mantém; Limpar apaga (também no Assistente) |
| Abrir Auditoria | 4 conceitos com o aviso "Não implementado nesta versão"; os cards não são clicáveis |

### 2.7 Responsividade e acessibilidade

| Verificação | Como | Esperado |
|---|---|---|
| Celular | F12 → ícone de celular → 320 px a 430 px | Nada corta, sem rolagem lateral, navegação não cobre o conteúdo |
| Computador | Janela larga | App centralizado como um "aparelho" |
| Teclado | Tab na tela de perfil, setas para escolher, Enter | Dá para entrar no app sem mouse; o foco aparece com contorno |
| Atalho | Primeiro Tab numa tela interna | Aparece "Pular para o conteúdo" |
| Diálogo | Enter em "Limpar histórico", depois Esc | Abre com o foco dentro e fecha com Esc |
| Movimento reduzido | Ativar "reduzir movimento" no sistema | Sem animações de carregamento nem rolagem suave |
| Tema | Trocar `--gi-color-primary` em `src/styles/tokens.css` | Todas as telas mudam de cor |
