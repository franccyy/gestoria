import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  addMonths,
  isPeriodWithin,
  monthKey,
  parseMonthKey,
  periodLabel,
  periodMonthKeys,
  previousPeriod,
  sameMonthLastYear,
  yearToDatePeriod,
} from "./periods";

describe("períodos", () => {
  test("converte mês em texto e de volta", () => {
    assert.equal(monthKey({ year: 2026, month: 3 }), "2026-03");
    assert.deepEqual(parseMonthKey("2026-03"), { year: 2026, month: 3 });
    assert.throws(() => parseMonthKey("2026-13"));
  });

  test("soma meses atravessando o ano", () => {
    assert.deepEqual(addMonths({ year: 2026, month: 1 }, -1), { year: 2025, month: 12 });
    assert.deepEqual(addMonths({ year: 2025, month: 11 }, 3), { year: 2026, month: 2 });
  });

  test("período anterior de um mês é o mês anterior", () => {
    assert.deepEqual(previousPeriod({ kind: "month", year: 2026, month: 1 }), { kind: "month", year: 2025, month: 12 });
  });

  test("período anterior de um ano parcial é o mesmo intervalo do ano anterior", () => {
    assert.deepEqual(previousPeriod({ kind: "year", year: 2026, toMonth: 11 }), { kind: "year", year: 2025, toMonth: 11 });
  });

  test("mesmo mês do ano anterior", () => {
    assert.deepEqual(sameMonthLastYear({ kind: "month", year: 2026, month: 11 }), { kind: "month", year: 2025, month: 11 });
  });

  test("lista os meses de um período anual", () => {
    const keys = periodMonthKeys(yearToDatePeriod({ year: 2026, month: 3 }));
    assert.deepEqual(keys, ["2026-01", "2026-02", "2026-03"]);
  });

  test("verifica se o período está dentro dos dados", () => {
    const first = { year: 2025, month: 1 };
    const last = { year: 2026, month: 11 };
    assert.equal(isPeriodWithin({ kind: "month", year: 2026, month: 11 }, first, last), true);
    assert.equal(isPeriodWithin({ kind: "month", year: 2026, month: 12 }, first, last), false);
    assert.equal(isPeriodWithin({ kind: "year", year: 2025, toMonth: 12 }, first, last), true);
    assert.equal(isPeriodWithin({ kind: "year", year: 2024, toMonth: 12 }, first, last), false);
  });

  test("nomes dos períodos", () => {
    assert.equal(periodLabel({ kind: "month", year: 2026, month: 11 }), "novembro de 2026");
    assert.equal(periodLabel({ kind: "year", year: 2025, toMonth: 12 }), "2025");
    assert.equal(periodLabel({ kind: "year", year: 2026, toMonth: 11 }), "2026 (jan. a nov.)");
  });
});
