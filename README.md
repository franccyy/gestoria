# GestorIA

**Informação certa, na hora certa.** O GestorIA é um assistente de gestão para o varejo: funcionários e gestores perguntam, por texto ou pela voz, sobre produtos, estoque, vendas e indicadores da loja, e recebem respostas sempre por escrito, calculadas sobre os dados.

Esta versão é um **MVP com dados fictícios**: 33 produtos de um supermercado, vendas mensais de janeiro de 2025 a novembro de 2026, sem conexão com ERP e sem custos de serviços externos.

---

## Sumário

1. [O que o app faz](#1-o-que-o-app-faz)
2. [Instalação](#2-instalação)
3. [Comandos](#3-comandos)
4. [Como usar](#4-como-usar)
5. [Documentação detalhada](#5-documentação-detalhada)
6. [Limitações desta versão](#6-limitações-desta-versão)
7. [Histórico do desenvolvimento](#7-histórico-do-desenvolvimento)

---

## 1. O que o app faz

| Tela | O que oferece |
|---|---|
| **Seleção de perfil** | Escolha entre Funcionário, Encarregado, Gerente e Administrador. Cada perfil vê as informações da sua função. |
| **Início** | Atalho para o assistente e perguntas sugeridas para o perfil. |
| **Assistente** | Perguntas em linguagem natural, por texto ou microfone. Entende saldo, preço, vendas, faturamento, representatividade, comparações, rankings, estoque baixo e categorias, e mantém o contexto ("E no mês passado?"). |
| **Indicadores** | Faturamento da loja e variação mensal; estoque, vendas no mês e no ano, faturamento, comparação entre períodos e representatividade de um produto, com busca. |
| **Histórico** | Perguntas e respostas da sessão, com opção de repetir uma pergunta ou limpar tudo. |
| **Auditoria** | Apresentação das funções futuras (preços, validade, rupturas, exposição), claramente marcadas como **não implementadas**. |

**Princípio central:** o assistente **nunca inventa números**. Toda resposta vem de um cálculo sobre a base. Quando falta informação (produto inexistente, período fora da base, filtro que a base não tem), ele diz claramente o que não encontrou.

## 2. Instalação

**Pré-requisito:** [Node.js](https://nodejs.org) versão 18.18 ou superior (recomendado: a versão **LTS**). Para conferir, rode `node -v` no terminal.

Abra um terminal **dentro da pasta `gestoria`** e rode:

```bash
npm install     # baixa as dependências (só na primeira vez, ou quando o package.json mudar)
npm run dev     # inicia o app
```

Depois abra <http://localhost:3000> no navegador.

> Editor recomendado: **VS Code**, com a extensão *Tailwind CSS IntelliSense*.

## 3. Comandos

| Comando | Para que serve |
|---|---|
| `npm run dev` | Inicia o app em modo de desenvolvimento (atualiza sozinho ao salvar arquivos) |
| `npm test` | Roda os 103 testes automáticos (cálculos, assistente e indicadores) |
| `npm run typecheck` | Procura erros de tipagem TypeScript em todo o projeto |
| `npm run build` | Gera a versão de produção (também detecta erros); rode antes de publicar |
| `npm run start` | Executa a versão de produção gerada pelo `build` |
| `npm run data:summary` | Mostra no terminal um resumo da base fictícia (faturamento, mais vendidos, estoque baixo) |
| `npm run data:generate` | Gera de novo o histórico de vendas, depois de alterar o cadastro de produtos |

## 4. Como usar

1. Abra o app, escolha um perfil (ex.: **Gerente**) e toque em **Explorar protótipo**.
2. No **Início**, toque em uma sugestão ou em **Iniciar conversa**.
3. No **Assistente**, experimente esta sequência:
   - *Quanto vendemos de Coca-Cola 2 litros?* → 850 unidades em novembro de 2026
   - *E no mês passado?* → 790 unidades em outubro de 2026 (o assistente entende que é o mesmo produto)
   - *Quais são os 3 produtos mais vendidos de cada categoria?* → uma lista por categoria
   - *Quanto vendemos neste mês?* → faturamento da loja, R$ 182.346,06
4. Toque no **microfone** para falar a pergunta. O texto aparece no campo para você revisar antes de enviar.
5. Abra **Indicadores**: o card do produto abre no último produto que você consultou. Use a busca para ver outro.
6. Para testar permissões, toque em **Trocar perfil** e entre como **Funcionário**: valores em reais deixam de aparecer.

**No celular:** com `npm run dev` rodando e o celular na mesma rede Wi-Fi, abra o endereço **Network** que aparece no terminal (ex.: `http://192.168.0.15:3000`). Para o microfone funcionar no celular, o app precisa estar publicado com HTTPS: veja [docs/PUBLICAR.md](docs/PUBLICAR.md).

**Microfone:** funciona no Chrome, Edge e Safari (o Firefox não oferece reconhecimento de voz; nele, o app avisa e a digitação continua). Exige `localhost` ou HTTPS. No Chrome, o áudio é transcrito pelos servidores do Google, então também precisa de internet.

## 5. Documentação detalhada

| Documento | Conteúdo |
|---|---|
| [docs/ASSISTENTE.md](docs/ASSISTENTE.md) | Tudo o que o assistente entende, regras de contexto, permissões, segurança contra respostas erradas e como ensinar perguntas novas |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Pastas, camadas, tema centralizado, componentes reutilizáveis, base fictícia, como fazer mudanças comuns e como evoluir (banco de dados, ERP, Claude API) |
| [docs/TESTES.md](docs/TESTES.md) | Testes automáticos e roteiro completo de testes manuais, com os valores esperados |
| [docs/PUBLICAR.md](docs/PUBLICAR.md) | Como abrir no celular e como publicar gratuitamente na Vercel (com HTTPS) |

## 6. Limitações desta versão

- **Dados fictícios e mensais.** Não há dados por dia, semana, marca, fornecedor ou cliente; o assistente avisa quando a pergunta pede isso.
- **Perfis são demonstrativos, não segurança.** A escolha de perfil não tem senha e as permissões são aplicadas no navegador. Antes de usar dados reais, é obrigatório ter login e verificação de permissões no servidor (veja *Como evoluir* em [docs/ARQUITETURA.md](docs/ARQUITETURA.md)).
- **Interpretação por regras.** O assistente reconhece um vocabulário definido. Perguntas escritas de forma muito diferente podem receber "Não entendi", com uma sugestão de como perguntar. A troca por um modelo de IA está prevista na arquitetura.
- **Sessão local.** Perfil e conversa ficam só na aba do navegador e somem ao fechá-la.
- **Auditoria inteligente** é apenas apresentação visual.

## 7. Histórico do desenvolvimento

| Etapa | Entrega |
|---|---|
| 1 | Configuração do projeto, tema centralizado e estrutura de pastas |
| 2 | Biblioteca de componentes reutilizáveis |
| 3 | As 6 telas do protótipo, perfis e histórico da sessão |
| 4 | Base fictícia (33 produtos, 23 meses) e funções de cálculo testadas |
| 5 | Motor do assistente (intenções, contexto, permissões, categorias) e microfone |
| 6 | Indicadores calculados, com produto do último contexto e busca |
| 7 | Revisão do código, acessibilidade (contraste, teclado, movimento reduzido), testes de ponta a ponta e documentação |

Tecnologias: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Web Speech API. Nenhum serviço pago.
