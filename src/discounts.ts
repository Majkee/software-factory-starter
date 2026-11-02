import { applyRate, assertCents, type Cents } from "./money.ts";

export type Discount =
  { readonly kind: "percent"; readonly percent: number } | { readonly kind: "fixed"; readonly amount: Cents };

export class DiscountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiscountError";
  }
}

/** The discount codes customers can type at checkout. */
export const DISCOUNT_CODES: Readonly<Record<string, Discount>> = {
  SAVE10: { kind: "percent", percent: 10 },
  SAVE25: { kind: "percent", percent: 25 },
  MINUS20: { kind: "fixed", amount: 2000 },
};

export function lookupDiscount(code: string): Discount {
  // Own properties only: "constructor", "toString" and "__proto__" are inherited from Object.prototype.
  if (!Object.hasOwn(DISCOUNT_CODES, code)) {
    throw new DiscountError(`Unknown discount code: "${code}"`);
  }
  return DISCOUNT_CODES[code] as Discount;
}

/** Returns how many cents a discount takes off a subtotal. Never more than the subtotal. */
export function discountAmount(subtotal: Cents, discount: Discount): Cents {
  assertCents(subtotal);
  const raw = discount.kind === "percent" ? applyRate(subtotal, discount.percent / 100) : discount.amount;
  return Math.min(raw, subtotal);
}
