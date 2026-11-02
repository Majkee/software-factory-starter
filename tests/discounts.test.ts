import { describe, expect, it } from "vitest";
import { DiscountError, discountAmount, lookupDiscount } from "../src/discounts.ts";

describe("lookupDiscount", () => {
  it("finds a known code", () => {
    expect(lookupDiscount("SAVE10")).toEqual({ kind: "percent", percent: 10 });
  });

  it("rejects an unknown code", () => {
    expect(() => lookupDiscount("FREE")).toThrow(DiscountError);
  });

  it("finds each of the other known codes", () => {
    expect(lookupDiscount("SAVE25")).toEqual({ kind: "percent", percent: 25 });
    expect(lookupDiscount("MINUS20")).toEqual({ kind: "fixed", amount: 2000 });
  });

  it("rejects the name of an inherited object property as a code", () => {
    expect(() => lookupDiscount("constructor")).toThrow(DiscountError);
    expect(() => lookupDiscount("toString")).toThrow(DiscountError);
    expect(() => lookupDiscount("__proto__")).toThrow(DiscountError);
  });
});

describe("discountAmount", () => {
  it("takes a percentage off", () => {
    expect(discountAmount(10000, { kind: "percent", percent: 10 })).toBe(1000);
  });

  it("takes a fixed amount off", () => {
    expect(discountAmount(10000, { kind: "fixed", amount: 2000 })).toBe(2000);
  });

  it("never discounts more than the subtotal", () => {
    expect(discountAmount(1500, { kind: "fixed", amount: 2000 })).toBe(1500);
  });
});
