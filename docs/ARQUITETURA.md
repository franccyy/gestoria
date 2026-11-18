# Arquitetura do GestorIA

## 1. Camadas

Cada camada só conversa com a de baixo. As telas nunca calculam números, e os cálculos nunca sabem como a tela é.

```text
┌──────────────────────────────────────────────────────────────┐
│ Telas e componentes          src/app · src/components        │
├──────────────────────────────────────────────────────────────┤
│ Estado da sessão             src/state (perfil e conversa)   │
├───────────────────────────────┬──────────────────────────────┤
│ Assistente                    │ Indicadores                  │
│ src/services/assistant        │ src/services/dashboard       │
├───────────────────────────────┴──────────────────────────────┤
│ Consultas da loja            src/services/store              │
│   (devolvem dados OU "não encontrei"; nunca inventam)        │
├──────────────────────────────────────────────────────────────┤
│ Cálculos puros               src/services/calculations       │
├──────────────────────────────────────────────────────────────┤
│ Dados                        src/data (ponto único de acesso)│
└──────────────────────────────────────────────────────────────┘
```

## 2. Pastas

```text
gestoria/
├── docs/                       esta documentação
├── public/                     arquivos estáticos
├── scripts/
│   ├── generate-sales.ts       gera src/data/sales.json (npm run data:generate)
│   └── print-summary.ts        resumo da base no terminal (npm run data:summary)
└── src/
    ├── app/                    rotas (Next.js App Router)
    │   ├── layout.tsx          layout raiz: idioma, fontes, CSS, estados globais
    │   ├── page.tsx            "/" — Seleção de perfil
    │   └── (app)/              telas internas (exigem perfil; usam o AppShell)
    │       ├── inicio/  assistente/  indicadores/  historico/  auditoria/
    │       └── componentes/    vitrine de componentes (só em desenvolvimento)
    ├── components/
    │   ├── ui/                 peças básicas reutilizáveis
    │   ├── layout/             estrutura das telas
    │   ├── profile/ home/ assistant/ dashboard/ history/ audit/   telas de cada área
    │   └── showcase/           vitrine de componentes
    ├── data/                   base fictícia
    ├── hooks/                  useSpeechRecognition (microfone)
    ├── lib/                    utilidades: formatação, períodos, texto, perfis, sugestões, navegação
    ├── services/
    │   ├── assistant/          contrato, contexto e motor de regras (rules/)
    │   ├── calculations/       somas, variação, participação
    │   ├── dashboard/          dados da tela de Indicadores
    │   └── store/              consultas da loja e busca de produtos
    ├── state/                  ProfileContext, ConversationContext
    ├── styles/
    │   ├── tokens.css          ★ identidade visual (fonte única)
    │   └── globals.css         Tailwind + ligação tokens → classes
    └── types/                  tipos compartilhados
```

Arquivos `*.test.ts` ficam ao lado do código que testam.

## 3. Tema centralizado

Toda a identidade visual (cores, fontes, tamanhos, espaços, bordas, arredondamentos, sombras) está em `src/styles/tokens.css`.

```text
tokens.css             globals.css (@theme)      classes Tailwind       componentes
--gi-color-primary  →  --color-primary       →  bg-primary         →  <Card variant="primary">
--gi-radius-card    →  --radius-card         →  rounded-card
```

- **Trocar a cor principal:** altere `--gi-color-primary` (e `--gi-color-primary-hover`). Todas as telas mudam.
- Componentes **nunca** usam cores em hexadecimal; usam as classes do tema.
- As cores foram verificadas pelo critério de contraste WCAG AA (texto ≥ 4,5:1; contorno de campos ≥ 3:1). Ao mudar uma cor, confira o contraste (ex.: <https://webaim.org/resources/contrastchecker/>).

Principais classes:

| Grupo | Classes |
|---|---|
| Marca | `primary`, `on-primary`, `accent`, `on-accent`, `highlight`, `highlight-strong` |
| Fundos | `canvas`, `background`, `surface`, `surface-muted` |
| Textos | `foreground`, `muted`, `subtle` |
| Estados | `success`, `danger`, `warning` (+ `-soft`) |
| Bordas | `border`, `border-strong`, `input-border` |
| Tipografia | `font-sans`, `font-serif`, `text-caption`, `text-body`, `text-lead`, `text-title`, `text-display`, `text-metric`, `tracking-eyebrow` |
| Forma | `rounded-sm`, `rounded-card`, `rounded-lg`, `rounded-pill`, `shadow-card`, `shadow-raised`, `max-w-app` |
| Utilitários próprios | `border-thick`, `underline-thick`, `pb-nav-safe`, `pb-safe` |

## 4. Componentes reutilizáveis

**`components/ui/`** — uma implementação de cada peça, configurável por props:

| Componente | Uso | Principais props |
|---|---|---|
| `Button` / `ButtonLink` | Ações / links com visual de botão | `variant` (`primary`, `accent`, `outline`, `link`), `size`, `iconLeft`, `iconRight` |
| `IconButton` | Botão só com ícone | `icon`, `label` (obrigatório), `variant` |
| `Card` | Blocos com fundo e cantos arredondados | `variant` (9 estilos), `padding`, `radius`, `as` |
| `Chip` | Sugestões de perguntas | `icon` |
| `Badge` | Etiquetas | `tone` |
| `TextField` | Campo de texto com rótulo e mensagens | `label`, `hideLabel`, `startAdornment`, `endAdornment`, `hint`, `error` |
| `SearchField` | Campo de pesquisa | `label`, `value`, `onValueChange` |
| `Icon` | Ícones SVG próprios | `name` |
| `Loader` | Carregamento | `variant`, `label` |
| `Alert` | Informação, sucesso, aviso, erro | `tone`, `title`, `action` |
| `EmptyState` | Lista vazia | `action` |
| `ConfirmDialog` | Confirmação de ações | `open`, `title`, `onConfirm`, `onCancel` |
| `ProgressBar` | Barra de proporção | `ratio`, `label` |
| `Logo` | Marca | `size` |

**`components/layout/`**: `AppShell` (estrutura das telas internas), `ProfileShell` (exige perfil), `AppHeader`, `DemoBanner`, `PageHeading`, `BottomNav` (abas configuradas em `src/lib/navigation.ts`), `SkipLink` (atalho de acessibilidade).

Para ver todos isolados: com `npm run dev`, abra <http://localhost:3000/componentes>.

## 5. Base fictícia

| Arquivo | Conteúdo |
|---|---|
| `src/data/products.ts` | Cadastro de 33 produtos em 7 categorias: código, nome, categoria, unidade (un/kg), preço, saldo, estoque mínimo |
| `src/data/sales.json` | 759 registros: um por produto e mês (jan./2025 a nov./2026), com quantidade e faturamento. **Gerado** — não edite à mão |
| `src/data/index.ts` | Único ponto de acesso aos dados |

- **Mês de referência:** novembro de 2026 (o último da base). "Neste mês", "mês passado" e "neste ano" são calculados a partir dele, não do relógio, para o app responder igual em qualquer data.
- Quantidade vendida e faturamento são sempre **calculados** a partir do histórico.
- Preços de 2025 eram 6% menores; o faturamento de cada ano usa o preço daquele ano.
- Estoque baixo = saldo menor ou igual ao estoque mínimo.
- O gerador é determinístico (sempre os mesmos números). A Coca-Cola 2 litros tem 850 un. em nov./2026 e 790 un. em out./2026, como no exemplo do projeto.

## 6. Estado da sessão

- `state/ProfileContext.tsx`: perfil escolhido.
- `state/ConversationContext.tsx`: mensagens da conversa (o Assistente e o Histórico leem a mesma lista).
- Ambos ficam no `sessionStorage` (duram até fechar a aba). O produto escolhido na busca dos Indicadores fica no endereço (`?produto=2001`).

## 7. Mudanças comuns

| Quero… | Onde mexer |
|---|---|
| Trocar uma cor | `src/styles/tokens.css` |
| Adicionar um produto | `src/data/products.ts` + volume médio em `BASE_VOLUME` de `scripts/generate-sales.ts` → `npm run data:generate` → `npm test` |
| Mudar o estoque mínimo ou saldo | `src/data/products.ts` |
| Mudar perguntas sugeridas | `src/lib/suggestions.ts` |
| Mudar o que cada perfil vê | `src/lib/profiles.ts` (nível de acesso) e o bloco "Permissão" de `src/services/assistant/rules/ruleEngine.ts` |
| Adicionar um ícone | `src/components/ui/Icon.tsx` |
| Mudar as abas da navegação | `src/lib/navigation.ts` |
| Ensinar uma pergunta nova | [ASSISTENTE.md](ASSISTENTE.md#5-como-ensinar-uma-pergunta-nova) |

## 8. Como evoluir

### Banco de dados ou ERP

1. Criar rotas de API no próprio Next.js (`src/app/api/...`), que rodam no servidor e acessam o banco/ERP.
2. Trocar o conteúdo de `src/data/index.ts` por chamadas a essas rotas. As consultas de `src/services/store` passam a ser assíncronas (`async`); a lógica de cálculo e os testes continuam válidos.
3. Credenciais do banco/ERP ficam em variáveis de ambiente do servidor, **nunca** no navegador.

### Login e permissões de verdade

Hoje o perfil é escolhido livremente e as permissões são aplicadas no navegador — adequado para demonstração, **não para dados reais**. Antes de conectar dados da empresa:

- autenticação real (ex.: Auth.js, ou o login corporativo da empresa);
- o perfil vem do usuário autenticado, não de uma escolha na tela;
- as permissões são verificadas **no servidor**, na rota que devolve os dados.

### Claude API

1. Criar a rota `src/app/api/assistant/route.ts`, que recebe a pergunta, o perfil e o histórico.
2. Nessa rota, chamar a Claude API com a chave em variável de ambiente (`ANTHROPIC_API_KEY`, configurada no servidor/Vercel, **nunca** no código nem no navegador).
3. Oferecer ao modelo as consultas de `src/services/store` como **ferramentas** (*tool use*): o modelo escolhe qual consulta chamar, e os números continuam vindo da base — o princípio de não inventar números se mantém.
4. Aplicar as permissões do perfil **antes** de executar cada ferramenta.
5. Criar um motor `claudeEngine` que implementa `AssistantEngine` chamando essa rota, e trocá-lo em `src/services/assistant/index.ts`. O motor de regras pode continuar como alternativa se a API estiver indisponível.

Documentação oficial: <https://docs.claude.com>.

### Auditoria inteligente

A Tela 6 já tem o layout dos quatro módulos (preços, validade, rupturas, exposição). Cada um exigirá dados próprios (etiquetas, lotes, contagens, imagens) e regras de negócio específicas, a serem definidos em uma etapa dedicada.

## 9. Decisões técnicas

| Escolha | Motivo |
|---|---|
| Next.js 15 (App Router) | Rotas por pastas; rotas de API no servidor para integrações futuras sem expor chaves |
| TypeScript estrito | Erros aparecem antes de executar; os tipos documentam os dados |
| Tailwind CSS 4 | Tema configurado direto no CSS (`@theme`), ligado aos tokens |
| Sem bibliotecas de interface | Ícones próprios e Web Speech API nativa: menos dependências, nada pago |
| `node:test` + `tsx` | Executor de testes nativo do Node; `tsx` é o único pacote extra (roda TypeScript no terminal) |
| Motor por regras com contrato | Funciona sem custo hoje; o contrato `AssistantEngine` permite trocar por IA sem tocar nas telas |
| Consultas devolvem "dados ou motivo" (`QueryResult`) | Obriga quem consulta a tratar a falta de dados; impede números inventados |
