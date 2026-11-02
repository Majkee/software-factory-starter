import { describe, expect, it } from "vitest";
import { applyRate, formatCents, MoneyError, toCents } from "../src/money.ts";

describe("toCents", () => {
  it("parses whole and decimal amounts", () => {
    expect(toCents("12")).toBe(1200);
    expect(toCents("12.3")).toBe(1230);
    expect(toCents("12.34")).toBe(1234);
  });

  it("parses negative amounts", () => {
    expect(toCents("-5.50")).toBe(-550);
  });

  it("rejects amounts with more than two decimals", () => {
    expect(() => toCents("1.234")).toThrow(MoneyError);
  });

  it("rejects text that is not a number", () => {
    expect(() => toCents("abc")).toThrow(MoneyError);
  });
});

describe("formatCents", () => {
  it("formats positive amounts with two decimals and a currency", () => {
    expect(formatCents(123456)).toBe("1234.56 PLN");
    expect(formatCents(5, "EUR")).toBe("0.05 EUR");
  });

  it("rejects fractional cents", () => {
    expect(() => formatCents(1.5)).toThrow(MoneyError);
  });
});

describe("formatCents negative amounts", () => {
  it.each([
    [-50, "-0.50 PLN"],
    [-5, "-0.05 PLN"],
    [-99, "-0.99 PLN"],
    [-100, "-1.00 PLN"],
    [-150, "-1.50 PLN"],
    [0, "0.00 PLN"],
    [50, "0.50 PLN"],
    [123456, "1234.56 PLN"],
  ])("formats %i as %s", (cents, expected) => {
    expect(formatCents(cents)).toBe(expected);
  });

  it("keeps the minus sign with another currency", () => {
    expect(formatCents(-50, "EUR")).toBe("-0.50 EUR");
  });
});

describe("applyRate", () => {
  it("rounds half away from zero", () => {
    expect(applyRate(250, 0.23)).toBe(58); // 57.5 -> 58
    expect(applyRate(-250, 0.23)).toBe(-58);
  });
});
