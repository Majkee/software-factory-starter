import { readFileSync } from "node:fs";
import { computeInvoice, type InvoiceLine } from "./invoice.ts";
import { formatCents } from "./money.ts";

interface InvoiceFile {
  readonly lines: InvoiceLine[];
  readonly discountCode?: string;
}

function main(argv: readonly string[]): number {
  const path = argv[0];
  if (path === undefined) {
    process.stderr.write("usage: npm run invoice -- <invoice.json>\n");
    return 2;
  }
  const input = JSON.parse(readFileSync(path, "utf8")) as InvoiceFile;
  const totals = computeInvoice(input.lines, input.discountCode);
  const rows: [string, number][] = [
    ["Subtotal", totals.subtotal],
    ["Discount", -totals.discount],
    ["Net", totals.net],
    ["VAT", totals.vat],
    ["Total", totals.total],
  ];
  for (const [label, cents] of rows) {
    process.stdout.write(`${label.padEnd(10)}${formatCents(cents).padStart(16)}\n`);
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
