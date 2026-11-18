# Assistente — o que ele entende e como funciona

O assistente responde perguntas em português sobre a loja. Ele funciona **por regras** (palavras-chave), sem IA externa e sem custo. Todos os números vêm das consultas sobre a base fictícia.

## 1. O que dá para perguntar

| Assunto | Exemplos | Quem pode ver |
|---|---|---|
| **Saldo em estoque** | "Qual o saldo atual da Coca-Cola 2 litros?", "Tem arroz em estoque?", "Saldo da categoria limpeza" | Todos |
| **Preço** | "Quanto custa o arroz?", "Preço do tomate" | Todos |
| **Quantidade vendida** | "Quanto vendemos de Coca-Cola 2 litros?", "Vendas de banana em outubro" | Todos |
| **Vendas da loja / de categoria** | "Quanto vendemos neste mês?", "Quanto vendemos de limpeza?", "Faturamento por categoria", "Qual categoria vende mais?" | Gerente e Administrador |
| **Faturamento de produto** | "Qual o faturamento da Coca-Cola 2 litros?" | Gerente e Administrador |
| **Representatividade** | "Qual a representatividade da Coca-Cola nas vendas?", "Representatividade da categoria bebidas" | Gerente e Administrador |
| **Comparação de períodos** | "Compare as vendas da Coca-Cola 2 litros com o mês passado", "Compare este ano com o ano passado", "Vendas de outubro e setembro do arroz" | Quantidades: todos · Faturamento: Gerente e Administrador |
| **Ranking** | "Quais são os cinco produtos mais vendidos?", "Top 3 menos vendidos em 2025", "Qual produto possui maior faturamento?", "3 mais vendidos de cada categoria" | Por quantidade: todos · Por faturamento: Gerente e Administrador |
| **Estoque baixo** | "Quais produtos estão com estoque baixo?", "Estoque baixo de laticínios", "Estoque baixo por categoria" | Todos |
| **Resumo de produto** | Só o nome: "Coca-Cola 2 litros" | Todos (faturamento só para perfis comerciais) |
| **Ajuda** | "Oi", "O que você sabe fazer?" | Todos |

**Períodos entendidos:** "neste mês", "mês passado", "neste ano", "ano passado", nomes de meses ("outubro", "outubro de 2025"), "10/2025" e anos ("2025"). Sem período, vale o **mês de referência** (novembro de 2026), o último mês da base. "Dezembro" sem ano é o último dezembro com dados (2025).

**Categorias:** Bebidas, Mercearia, Laticínios, Higiene, Limpeza, Hortifrúti e Padaria. "De cada categoria" ou "por categoria" separa o resultado em uma lista por categoria.

**Rankings por quantidade** misturam produtos vendidos por unidade e por quilo; a unidade aparece em destaque em cada item ("2.611 un.", "1.286 kg") e os produtos a granel têm a nota "vendido por quilo".

## 2. Contexto da conversa

O assistente lembra do que acabou de responder:

| Sequência | O que acontece |
|---|---|
| "Quanto vendemos de Coca-Cola 2 litros?" → **"E no mês passado?"** | Mesmo produto, novo período |
| "Vendas da Coca-Cola 2 litros em outubro" → **"E o Guaraná?"** | Novo produto, mesmo período |
| "3 mais vendidos da categoria limpeza" → **"E em outubro?"** → **"e de higiene?"** | Mesmo ranking; troca o período e depois a categoria |
| "Saldo do arroz" → **"compare com setembro"** | Comparação curta continua no produto |
| "Quanto vendemos neste mês?" → **"E no mês passado?"** | Continua na loja |

Regras:

- Perguntas que começam com "E…" continuam a anterior e trocam só o que foi dito.
- Saldo, preço e representatividade sem produto usam o último produto da conversa.
- Pergunta completa sem produto ("Quanto vendemos neste mês?") é sobre a **loja**.
- O contexto fica salvo dentro de cada resposta; por isso continua valendo depois de recarregar a página, e a tela de Indicadores usa o mesmo registro para saber o último produto consultado.

## 3. Segurança contra respostas erradas

Uma resposta que ignora parte da pergunta parece certa e engana. Por isso:

| Situação | Resposta |
|---|---|
| Produto que não existe ("saldo da picanha") | "Não encontrei "picanha" entre os produtos e as categorias…" — **nunca** reaproveita o produto anterior |
| Categoria que não existe ("mais vendidos da categoria frios") | Avisa e lista as categorias existentes |
| Filtro que a base não tem (marca, fornecedor, fabricante, cliente, vendedor, filial, horário) | Explica que a base não tem essa informação |
| Período fora da base ("dezembro de 2026") | "Não encontrei dados de vendas para dezembro de 2026. A base tem vendas de janeiro de 2025 a novembro de 2026." |
| Dia ou semana ("hoje") | Explica que os dados são mensais |
| Período inteiro ("de sempre") | Explica que consulta um mês ou um ano por vez |
| Nome ambíguo ("Coca-Cola") | Responde para todos os produtos encontrados, em lista |
| Sem permissão | Explica a restrição do perfil, sem mostrar o valor |

Respostas desse tipo aparecem em **amarelo**; respostas com dados, em verde-claro.

## 4. Como funciona por dentro

Código em `src/services/assistant/`:

```text
pergunta
  │
  ├─ intentDetector.ts   → intenção (saldo, vendas, ranking…) e parâmetros do ranking
  ├─ periodParser.ts     → períodos citados
  ├─ productMatcher.ts   → produtos citados (tolera acentos, plural, "coca 2l")
  ├─ categoryParser.ts   → categorias e filtros não suportados
  │
  └─ ruleEngine.ts       → completa com o contexto, verifica a permissão
        │
        └─ answers/      → monta a resposta chamando src/services/store
              productAnswers.ts · storeAnswers.ts · categoryAnswers.ts
```

A resposta tem três partes (`AssistantReply`): o **texto** principal, os **detalhes** (mini cards de números, listas e grupos) e o **contexto** para a próxima pergunta.

A permissão é verificada **no motor**, não só na tela: um perfil operacional nunca recebe o número, nem escondido.

## 5. Como ensinar uma pergunta nova

Exemplo: fazer o assistente entender "giro" como sinônimo de vendas.

1. Em `rules/intentDetector.ts`, acrescente a palavra à regra da intenção (`["sales", /vend|saiu|sairam|saida|giro/]`).
2. Em `rules/ruleEngine.test.ts`, acrescente um teste: `conversation("gerente")("Qual o giro da Coca-Cola 2 litros?")` deve responder 850 unidades.
3. Rode `npm test`.

Para uma intenção totalmente nova, crie a função de consulta em `src/services/store/storeQueries.ts` (com teste), a resposta em `answers/` e o caso no `switch` de `ruleEngine.ts`.

## 6. Microfone

Usa a Web Speech API do navegador (`src/hooks/useSpeechRecognition.ts`): gratuita, sem chave, em português do Brasil.

- O texto aparece no campo enquanto a pessoa fala; o envio é sempre manual, depois da revisão.
- Erros (permissão negada, nenhuma fala, sem microfone, sem internet) viram mensagens claras abaixo do campo, e a digitação continua funcionando.
- Sem suporte (Firefox) ou sem HTTPS, o botão não aparece e uma mensagem explica o motivo.

## 7. Trocar por um modelo de IA (ex.: Claude API)

O motor é escolhido em **um único lugar**: `src/services/assistant/index.ts`. Qualquer motor que implemente o contrato `AssistantEngine` (`types.ts`) funciona sem mudar as telas. O caminho recomendado está em [ARQUITETURA.md](ARQUITETURA.md#claude-api).
