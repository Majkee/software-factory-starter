# Glossary

Domain words used in code, tests, issues and PRs. Add a term the moment a discussion settles it.

| Term              | Meaning                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Cents**         | An integer amount of the smallest currency unit. `1234` cents = 12.34 PLN. The only money type.                     |
| **Line**          | One product on an invoice: SKU, quantity, unit price (cents) and VAT rate.                                          |
| **Line value**    | `unitPrice × quantity` for one line, before discount.                                                               |
| **Subtotal**      | Sum of all line values.                                                                                             |
| **Discount**      | Cents taken off the subtotal by a discount code. Never more than the subtotal.                                      |
| **Discount code** | Text a customer enters (e.g. `SAVE10`). Maps to a percent or fixed discount.                                        |
| **Allocation**    | Spreading the discount over lines in proportion to line value; the rounding remainder goes to the last line.        |
| **Net**           | Subtotal minus discount.                                                                                            |
| **Line VAT**      | VAT computed and rounded (half away from zero) for each line on its net share. Invoice VAT is the sum of line VATs. |
| **Total**         | Net plus VAT.                                                                                                       |

## Factory words

| Term            | Meaning                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| **Trigger**     | An event that starts a run: a label, a schedule, a failed CI run, another run finishing. |
| **Run**         | One workflow job doing one task. It never waits for a human.                             |
| **Brake**       | A check that stops bad work: CI, ratchets, hooks, review, human approval.                |
| **Accelerator** | Anything that starts agents without a human: every trigger.                              |
| **Ratchet**     | A limit that may only get stricter (test count, lint rules).                             |
| **Holdout**     | Acceptance tests kept outside this repo so agents cannot see or game them.               |
