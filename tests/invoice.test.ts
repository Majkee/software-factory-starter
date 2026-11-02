import { describe, expect, it } from "vitest";
import { computeCorrection, computeInvoice, InvoiceError, type InvoiceLine } from "../src/invoice.ts";

const book: InvoiceLine = { sku: "BOOK", quantity: 2, unitPrice: 4999, vatRate: 0.05 };
const laptop: InvoiceLine = { sku: "LAPTOP", quantity: 1, unitPrice: 350000, vatRate: 0.23 };

describe("computeInvoice", () => {
  it("adds up lines and per-line VAT", () => {
    expect(computeInvoice([book, laptop])).toEqual({
      subtotal: 359998,
      discount: 0,
      net: 359998,
      vat: 81000, // 500 (5% of 99.98, rounded) + 80500
      total: 440998,
    });
  });

  it("spreads a percentage discount across lines before VAT", () => {
    const totals = computeInvoice([book, laptop], "SAVE10");
    expect(totals.discount).toBe(36000);
    expect(totals.net).toBe(323998);
    expect(totals.total).toBe(totals.net + totals.vat);
  });

  it("caps a fixed discount at the subtotal", () => {
    const cheap: InvoiceLine = { sku: "PEN", quantity: 1, unitPrice: 500, vatRate: 0.23 };
    expect(computeInvoice([cheap], "MINUS20")).toMatchObject({ discount: 500, net: 0, vat: 0, total: 0 });
  });

  it("rejects an empty invoice", () => {
    expect(() => computeInvoice([])).toThrow(InvoiceError);
  });

  it("rejects a zero quantity", () => {
    expect(() => computeInvoice([{ ...book, quantity: 0 }])).toThrow(InvoiceError);
  });

  it("rejects a VAT rate given as a percentage", () => {
    expect(() => computeInvoice([{ ...book, vatRate: 23 }])).toThrow(InvoiceError);
  });
});

describe("computeCorrection", () => {
  const chair: InvoiceLine = { sku: "CHAIR", quantity: 3, unitPrice: 10000, vatRate: 0.23 };
  const cup: InvoiceLine = { sku: "CUP", quantity: 2, unitPrice: 150, vatRate: 0.23 };

  it("returns one unit as negative amounts", () => {
    expect(computeCorrection([chair], [{ ...chair, quantity: 2 }])).toEqual({
      subtotal: -10000,
      discount: 0,
      net: -10000,
      vat: -2300,
      total: -12300,
    });
  });

  it("takes the difference of two rounded line VATs, not the VAT of the difference", () => {
    // before: VAT 69 (300 × 0.23); after: VAT 35 (150 × 0.23 = 34.5 → 35). VAT of the difference would be −35.
    expect(computeCorrection([cup], [{ ...cup, quantity: 1 }])).toEqual({
      subtotal: -150,
      discount: 0,
      net: -150,
      vat: -34,
      total: -184,
    });
  });

  it("cancels the whole original invoice when every line drops to zero", () => {
    expect(computeCorrection([chair], [{ ...chair, quantity: 0 }])).toEqual({
      subtotal: -30000,
      discount: 0,
      net: -30000,
      vat: -6900,
      total: -36900,
    });
  });

  it("drops a line with quantity zero from the after state", () => {
    const before = computeInvoice([chair, cup]);
    const after = computeInvoice([cup]);
    expect(computeCorrection([chair, cup], [{ ...chair, quantity: 0 }, cup])).toEqual({
      subtotal: after.subtotal - before.subtotal,
      discount: 0,
      net: after.net - before.net,
      vat: after.vat - before.vat,
      total: after.total - before.total,
    });
  });

  it("is all zeros when no quantity changes", () => {
    expect(computeCorrection([chair, cup], [chair, cup])).toEqual({
      subtotal: 0,
      discount: 0,
      net: 0,
      vat: 0,
      total: 0,
    });
  });

  it("rejects a quantity above the original quantity", () => {
    expect(() => computeCorrection([chair], [{ ...chair, quantity: 4 }])).toThrow(InvoiceError);
  });

  it("rejects a negative or fractional quantity", () => {
    expect(() => computeCorrection([chair], [{ ...chair, quantity: -1 }])).toThrow(InvoiceError);
    expect(() => computeCorrection([chair], [{ ...chair, quantity: 1.5 }])).toThrow(InvoiceError);
  });

  it("rejects a changed SKU, unit price or VAT rate", () => {
    expect(() => computeCorrection([chair], [{ ...chair, sku: "TABLE" }])).toThrow(InvoiceError);
    expect(() => computeCorrection([chair], [{ ...chair, unitPrice: 9000 }])).toThrow(InvoiceError);
    expect(() => computeCorrection([chair], [{ ...chair, vatRate: 0.08 }])).toThrow(InvoiceError);
  });

  it("rejects a different number of lines than the original invoice", () => {
    expect(() => computeCorrection([chair, cup], [chair])).toThrow(InvoiceError);
    expect(() => computeCorrection([chair], [chair, cup])).toThrow(InvoiceError);
  });

  it("rejects an original invoice with a discount code", () => {
    expect(() => computeCorrection([chair], [{ ...chair, quantity: 2 }], "SAVE10")).toThrow(InvoiceError);
  });
});
