import { discountAmount, lookupDiscount } from "./discounts.ts";
import { applyRate, assertCents, type Cents } from "./money.ts";

export interface InvoiceLine {
  readonly sku: string;
  readonly quantity: number;
  readonly unitPrice: Cents;
  /** VAT rate as a fraction, e.g. 0.23 for 23%. */
  readonly vatRate: number;
}

export interface InvoiceTotals {
  readonly subtotal: Cents;
  readonly discount: Cents;
  readonly net: Cents;
  readonly vat: Cents;
  readonly total: Cents;
}

export class InvoiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvoiceError";
  }
}

/**
 * Computes invoice totals. The discount is spread over the lines in proportion to their
 * value, and VAT is computed and rounded per line (see GLOSSARY.md: "line VAT").
 */
export function computeInvoice(lines: readonly InvoiceLine[], discountCode?: string): InvoiceTotals {
  if (lines.length === 0) {
    throw new InvoiceError("An invoice needs at least one line");
  }
  lines.forEach(validateLine);

  const lineValues = lines.map((line) => line.unitPrice * line.quantity);
  const subtotal = lineValues.reduce((sum, value) => sum + value, 0);
  const discount = discountCode === undefined ? 0 : discountAmount(subtotal, lookupDiscount(discountCode));

  const lineDiscounts = allocate(discount, lineValues);
  const vat = lines.reduce((sum, line, i) => {
    const lineNet = (lineValues[i] ?? 0) - (lineDiscounts[i] ?? 0);
    return sum + applyRate(lineNet, line.vatRate);
  }, 0);

  const net = subtotal - discount;
  return { subtotal, discount, net, vat, total: net + vat };
}

function validateLine(line: InvoiceLine): void {
  if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
    throw new InvoiceError(`Line ${line.sku}: quantity must be a positive integer`);
  }
  assertCents(line.unitPrice);
  if (line.unitPrice < 0) {
    throw new InvoiceError(`Line ${line.sku}: unit price cannot be negative`);
  }
  if (line.vatRate < 0 || line.vatRate > 1) {
    throw new InvoiceError(`Line ${line.sku}: VAT rate must be between 0 and 1`);
  }
}

/** Splits `amount` across `weights` proportionally; the rounding remainder goes to the last line. */
function allocate(amount: Cents, weights: readonly Cents[]): Cents[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (amount === 0 || total === 0) {
    return weights.map(() => 0);
  }
  const shares = weights.map((w) => Math.floor((amount * w) / total));
  const remainder = amount - shares.reduce((sum, s) => sum + s, 0);
  shares[shares.length - 1] = (shares[shares.length - 1] ?? 0) + remainder;
  return shares;
}
