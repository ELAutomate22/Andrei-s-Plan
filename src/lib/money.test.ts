import { describe, expect, it } from "vitest";
import { currencyOf, formatMoney } from "./money";
import { totals } from "./metrics";
import { createSeedData } from "./seed";

describe("currency handling", () => {
  it("keeps GBP and EUR totals separate", () => {
    const data = createSeedData();
    data.income.push(
      { id: "gbp-income", amount: 800, date: "2026-08-20", source: "UK client", scope: "business", description: "", currency: "GBP" },
      { id: "eur-income", amount: 1200, date: "2026-08-21", source: "EU client", scope: "business", description: "", currency: "EUR" },
    );
    data.expenses.push(
      { id: "gbp-expense", amount: 100, date: "2026-08-20", category: "Hosting", scope: "business", description: "", currency: "GBP" },
      { id: "eur-expense", amount: 250, date: "2026-08-21", category: "Software", scope: "business", description: "", currency: "EUR" },
    );

    expect(totals(data, "GBP")).toMatchObject({ income: 800, expenses: 100, net: 700 });
    expect(totals(data, "EUR")).toMatchObject({ income: 1200, expenses: 250, net: 950 });
  });

  it("treats legacy records without a currency as GBP", () => {
    expect(currencyOf(undefined)).toBe("GBP");
  });

  it("formats both supported currencies clearly", () => {
    expect(formatMoney(1250, "GBP")).toContain("£");
    expect(formatMoney(1250, "EUR")).toContain("€");
  });
});
