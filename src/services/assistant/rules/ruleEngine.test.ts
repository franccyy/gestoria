import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatCurrency, formatPercent } from "@/lib/format";
import { findProfile } from "@/lib/profiles";
import {
  getCategoryShare,
  getRepresentativeness,
  getStoreSales,
  getTopProducts,
  listCategories,
} from "@/services/store/storeQueries";
import type { ChatMessage } from "@/types/conversation";
import type { ProfileId } from "@/types/profile";
import { replyPlainText } from "../context";
import type { AssistantReply } from "../types";
import { answerQuestion } from "./ruleEngine";

const NOV_2026 = { kind: "month", year: 2026, month: 11 } as const;

/** Simula uma conversa: cada pergunta recebe o histórico das anteriores. */
function conversation(profileId: ProfileId) {
  const profile = findProfile(profileId)!;
  const history: ChatMessage[] = [];
  return (question: string): AssistantReply & { full: string } => {
    const reply = answerQuestion(question, profile, history);
    history.push(
      { id: `q${history.length}`, role: "user", text: question, createdAt: "" },
      { id: `a${history.length}`, role: "assistant", createdAt: "", ...reply },
    );
    return { ...reply, full: replyPlainText(reply.text, reply.details) };
  };
}

function unwrap<T>(result: { ok: true; data: T } | { ok: false; message: string }): T {
  if (!result.ok) assert.fail(result.message);
  return result.data;
}

describe("perguntas sugeridas", () => {
  test("saldo atual da Coca-Cola 2 litros", () => {
    const reply = conversation("funcionario")("Qual o saldo atual da Coca-Cola 2 litros?");
    assert.equal(reply.status, "ok");
    assert.match(reply.text, /Coca-Cola 2 litros é de 124 unidades/);
  });

  test("quanto vendemos neste mês (loja)", () => {
    const reply = conversation("gerente")("Quanto vendemos neste mês?");
    const expected = unwrap(getStoreSales(NOV_2026)).revenue;
    assert.equal(reply.status, "ok");
    assert.ok(reply.text.includes(formatCurrency(expected)));
  });

  test("produto de maior faturamento", () => {
    const reply = conversation("gerente")("Qual produto possui maior faturamento?");
    const [top] = unwrap(getTopProducts(NOV_2026, "revenue", 1));
    assert.ok(reply.text.includes(top.product.name));
    assert.ok(reply.text.includes(formatCurrency(top.revenue)));
  });

  test("representatividade da Coca-Cola: os dois produtos e o total", () => {
    const reply = conversation("gerente")("Qual a representatividade da Coca-Cola nas vendas?");
    const share2l = unwrap(getRepresentativeness("1001", NOV_2026)).share;
    const shareLata = unwrap(getRepresentativeness("1002", NOV_2026)).share;
    assert.equal(reply.details?.list?.length, 2);
    assert.ok(reply.full.includes(formatPercent(share2l)));
    assert.ok(reply.full.includes(formatPercent(shareLata)));
    assert.ok(reply.full.includes(`Juntos: ${formatPercent(share2l + shareLata)}`));
  });

  test("cinco mais vendidos, com a unidade visível em cada item", () => {
    const reply = conversation("gerente")("Quais são os cinco produtos mais vendidos?");
    const expected = unwrap(getTopProducts(NOV_2026, "quantity", 5));
    const list = reply.details?.list ?? [];
    assert.equal(list.length, 5);
    list.forEach((item, index) => {
      assert.ok(item.label.includes(expected[index].product.name));
      assert.match(item.value, expected[index].product.unit === "kg" ? / kg$/ : / un\.$/);
      if (expected[index].product.unit === "kg") assert.match(item.note ?? "", /vendido por quilo/);
    });
    assert.ok(list.some((item) => item.value.endsWith("kg")), "a lista deve misturar un. e kg");
  });
});

describe("contexto da conversa", () => {
  test("“E no mês passado?” continua no mesmo produto", () => {
    const ask = conversation("funcionario");
    assert.match(ask("Quanto vendemos de Coca-Cola 2 litros?").text, /novembro de 2026.*850 unidades de Coca-Cola 2 litros/);
    assert.match(ask("E no mês passado?").text, /outubro de 2026.*790 unidades de Coca-Cola 2 litros/);
  });

  test("“E o Guaraná?” troca o produto e mantém o período", () => {
    const ask = conversation("gerente");
    ask("Quanto vendemos de Coca-Cola 2 litros em outubro?");
    assert.match(ask("E o Guaraná?").text, /outubro de 2026.*Guaraná Antarctica 2 litros/);
  });

  test("“E no mês passado?” depois de pergunta sobre a loja continua na loja", () => {
    const ask = conversation("gerente");
    ask("Quanto vendemos neste mês?");
    assert.match(ask("E no mês passado?").text, /faturamento da loja em outubro de 2026/);
  });

  test("repete o mesmo ranking para outro período", () => {
    const ask = conversation("gerente");
    ask("Top 3 produtos mais vendidos");
    const reply = ask("E em outubro?");
    assert.match(reply.text, /3 produtos mais vendidos em outubro de 2026/);
    assert.equal(reply.details?.list?.length, 3);
  });

  test("“Compare com setembro” compara o produto da conversa", () => {
    const ask = conversation("funcionario");
    ask("Quanto vendemos de Coca-Cola 2 litros?");
    assert.match(ask("compare com setembro").text, /^Coca-Cola 2 litros: 850 unidades em novembro de 2026, contra .* setembro de 2026/);
  });

  test("produto inexistente não herda o produto anterior", () => {
    const ask = conversation("gerente");
    ask("Qual o saldo da Coca-Cola 2 litros?");
    const reply = ask("e o saldo da picanha?");
    assert.equal(reply.status, "unavailable");
    assert.match(reply.text, /Não encontrei "picanha"/);
  });
});

describe("comparações", () => {
  test("Coca-Cola 2 litros com o mês passado: +7,6%", () => {
    const reply = conversation("gerente")("Compare as vendas da Coca-Cola 2 litros com o mês passado");
    assert.match(reply.text, /850 unidades em novembro de 2026, contra 790 unidades em outubro de 2026: alta de 7,6% \(\+60 unidades\)/);
  });

  test("este ano com o ano passado usa o mesmo intervalo de meses", () => {
    const reply = conversation("gerente")("Compare este ano com o ano passado");
    assert.match(reply.text, /faturamento da loja .* 2026 \(jan\. a nov\.\), contra .* 2025 \(jan\. a nov\.\)/);
  });

  test("dois meses citados viram comparação", () => {
    const reply = conversation("gerente")("vendas de outubro e setembro da coca 2l");
    assert.match(reply.text, /790 unidades em outubro de 2026, contra .* em setembro de 2026/);
  });

  test("“comparado ao ano passado” usa o mesmo mês do ano anterior", () => {
    const reply = conversation("gerente")("faturamento da coca 2l comparado ao ano passado");
    assert.match(reply.text, /novembro de 2026, contra .* novembro de 2025/);
  });
});

describe("permissões por perfil", () => {
  for (const question of [
    "Quanto vendemos neste mês?",
    "Qual o faturamento da Coca-Cola 2 litros?",
    "Qual a representatividade da Coca-Cola 2 litros?",
    "Qual produto possui maior faturamento?",
  ]) {
    test(`Funcionário não recebe números comerciais: "${question}"`, () => {
      const reply = conversation("funcionario")(question);
      assert.equal(reply.status, "unavailable");
      assert.match(reply.text, /No perfil Funcionário/);
      assert.doesNotMatch(reply.text, /R\$/);
    });
  }

  test("Funcionário vê vendas do produto sem faturamento", () => {
    const reply = conversation("funcionario")("Quanto vendemos de Coca-Cola 2 litros?");
    assert.doesNotMatch(reply.full, /R\$/);
  });

  test("Encarregado também é operacional", () => {
    assert.equal(conversation("encarregado")("Quanto vendemos neste mês?").status, "unavailable");
  });
});

describe("sem dados ou sem entendimento", () => {
  test("período fora da base", () => {
    const reply = conversation("gerente")("Quanto vendemos de Coca-Cola 2 litros em dezembro de 2026?");
    assert.equal(reply.status, "unavailable");
    assert.match(reply.text, /Não encontrei dados de vendas para dezembro de 2026/);
  });

  test("“dezembro” sem ano é o último dezembro com dados (2025)", () => {
    assert.match(conversation("gerente")("vendas da coca 2l em dezembro").text, /dezembro de 2025/);
  });

  test("dia ou semana: avisa que os dados são mensais", () => {
    assert.match(conversation("gerente")("Quanto vendemos hoje?").text, /apenas dados mensais/);
  });

  test("produto inexistente", () => {
    const reply = conversation("gerente")("Qual o saldo da picanha?");
    assert.equal(reply.status, "unavailable");
    assert.match(reply.text, /Não encontrei "picanha"/);
  });

  test("vendas de produto inexistente não viram vendas da loja", () => {
    const reply = conversation("gerente")("Quanto vendemos de picanha?");
    assert.match(reply.text, /Não encontrei "picanha"/);
  });

  test("pergunta sem sentido", () => {
    const reply = conversation("gerente")("asdfgh");
    assert.equal(reply.status, "unavailable");
    assert.match(reply.text, /Não entendi/);
  });

  test("saldo sem produto pergunta qual", () => {
    assert.match(conversation("gerente")("Qual o saldo?").text, /Qual produto/);
  });
});

describe("outras intenções", () => {
  test("estoque baixo, do mais crítico ao menos crítico", () => {
    const reply = conversation("funcionario")("Quais produtos estão com estoque baixo?");
    assert.equal(reply.details?.list?.length, 5);
    assert.match(reply.details?.list?.[0].label ?? "", /Sabão em Pó/);
  });

  test("preço", () => {
    assert.match(conversation("funcionario")("Quanto custa o arroz?").text, /Arroz Branco Tipo 1 5 kg é R\$\s27,90/);
  });

  test("menos vendidos", () => {
    const reply = conversation("gerente")("top 3 menos vendidos em 2025");
    const expected = unwrap(getTopProducts({ kind: "year", year: 2025, toMonth: 12 }, "quantity", 3, "asc"));
    assert.deepEqual(
      reply.details?.list?.map((item) => item.label),
      expected.map((item) => `${item.position}. ${item.product.name}`),
    );
  });

  test("só o nome do produto mostra um resumo", () => {
    const reply = conversation("gerente")("Coca-Cola 2 litros");
    assert.match(reply.text, /Resumo de Coca-Cola 2 litros/);
    assert.ok(reply.details?.metrics?.some((m) => m.label === "Saldo" && m.value === "124 un."));
  });

  test("saudação apresenta o que o perfil pode perguntar", () => {
    const reply = conversation("funcionario")("Oi");
    assert.match(reply.text, /No perfil Funcionário/);
    assert.ok(!reply.full.includes("Representatividade"));
  });
});

describe("categorias (filtro nunca pode ser ignorado)", () => {
  test("“3 mais vendidos da categoria limpeza” considera só Limpeza", () => {
    const reply = conversation("gerente")("quais são os 3 produtos mais vendidos da categoria limpeza");
    const expected = unwrap(getTopProducts(NOV_2026, "quantity", 3, "desc", "Limpeza"));
    assert.match(reply.text, /da categoria Limpeza/);
    assert.deepEqual(
      reply.details?.list?.map((item) => item.label),
      expected.map((item) => `${item.position}. ${item.product.name}`),
    );
    assert.ok(expected.every((item) => item.product.category === "Limpeza"));
  });

  test("“3 mais vendidos de cada categoria” traz uma lista por categoria", () => {
    const reply = conversation("gerente")("quais são os 3 produtos mais vendidos de cada categoria");
    const groups = reply.details?.groups ?? [];
    assert.deepEqual(groups.map((g) => g.title), listCategories());
    assert.match(reply.details?.footnote ?? "", /Padaria tem só 2 produtos na base/);
    for (const group of groups) {
      const expected = unwrap(getTopProducts(NOV_2026, "quantity", 3, "desc", group.title as never));
      assert.deepEqual(group.list.map((item) => item.label), expected.map((item) => `${item.position}. ${item.product.name}`));
    }
  });

  test("a categoria continua nas perguntas seguintes", () => {
    const ask = conversation("gerente");
    ask("3 mais vendidos da categoria limpeza");
    assert.match(ask("E em outubro?").text, /da categoria Limpeza em outubro de 2026/);
    assert.match(ask("e de higiene?").text, /da categoria Higiene em outubro de 2026/);
  });

  test("pergunta nova sem categoria volta para a loja toda", () => {
    const ask = conversation("gerente");
    ask("3 mais vendidos da categoria limpeza");
    assert.doesNotMatch(ask("Quais são os cinco produtos mais vendidos?").text, /categoria/);
  });

  test("vendas de uma categoria", () => {
    const reply = conversation("gerente")("Quanto vendemos de limpeza?");
    const expected = unwrap(getStoreSales(NOV_2026, "Limpeza")).revenue;
    assert.match(reply.text, /faturamento da categoria Limpeza/);
    assert.ok(reply.text.includes(formatCurrency(expected)));
  });

  test("faturamento por categoria soma o faturamento da loja", () => {
    const reply = conversation("gerente")("faturamento por categoria");
    assert.equal(reply.details?.list?.length, listCategories().length);
    const total = listCategories().reduce((sum, c) => sum + unwrap(getCategoryShare(c, NOV_2026)).categoryRevenue, 0);
    assert.ok(Math.abs(total - unwrap(getStoreSales(NOV_2026)).revenue) < 0.01);
  });

  test("“qual categoria vende mais?” aponta a maior", () => {
    const [top] = listCategories()
      .map((c) => unwrap(getCategoryShare(c, NOV_2026)))
      .sort((a, b) => b.categoryRevenue - a.categoryRevenue);
    assert.match(conversation("gerente")("qual categoria vende mais?").text, new RegExp(`foi ${top.category}`));
  });

  test("representatividade de uma categoria", () => {
    const share = unwrap(getCategoryShare("Bebidas", NOV_2026)).share;
    assert.ok(conversation("gerente")("representatividade da categoria bebidas").text.includes(formatPercent(share)));
  });

  test("estoque baixo filtrado por categoria", () => {
    const reply = conversation("funcionario")("estoque baixo de laticínios");
    assert.deepEqual(reply.details?.list?.map((item) => item.label), ["Manteiga com Sal 200 g"]);
  });

  test("saldo da categoria lista os produtos dela", () => {
    const reply = conversation("funcionario")("saldo da categoria limpeza");
    assert.match(reply.text, /Saldo dos produtos da categoria Limpeza/);
    assert.equal(reply.details?.list?.length, 4);
  });

  test("Funcionário: ranking por categoria liberado, total por categoria bloqueado", () => {
    const ask = conversation("funcionario");
    assert.equal(ask("3 mais vendidos de cada categoria").status, "ok");
    const blocked = ask("quanto vendemos de bebidas?");
    assert.equal(blocked.status, "unavailable");
    assert.doesNotMatch(blocked.text, /R\$/);
  });

  test("categoria inexistente é avisada, não ignorada", () => {
    const reply = conversation("gerente")("mais vendidos da categoria frios");
    assert.equal(reply.status, "unavailable");
    assert.match(reply.text, /Não encontrei "frios"/);
  });

  test("filtros que a base não tem são avisados", () => {
    for (const question of ["vendas por marca", "mais vendidos por fornecedor", "faturamento por cliente"]) {
      const reply = conversation("gerente")(question);
      assert.equal(reply.status, "unavailable", question);
      assert.match(reply.text, /não tem informações por/, question);
    }
  });

  test("período inteiro (“de sempre”) é avisado, não trocado pelo mês atual", () => {
    const reply = conversation("gerente")("mais vendidos de sempre");
    assert.equal(reply.status, "unavailable");
    assert.match(reply.text, /um mês ou um ano por vez/);
  });
});
