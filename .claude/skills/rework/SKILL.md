---
name: rework
description: Fix exactly what the latest factory review or a failed CI run reported on one pull request.
disable-model-invocation: true
---

# Rework PR $ARGUMENTS

1. `gh pr view $ARGUMENTS --comments` and check out the branch: `gh pr checkout $ARGUMENTS`.
2. Collect the work list:
   - findings from the latest `<!-- factory:review verdict=fail -->` comment, and
   - if CI failed: `gh pr checks $ARGUMENTS`, then `gh run view <run-id> --log-failed` for the failed run.
3. Fix only those items. Do not refactor, rename or "improve" anything else.
   If a finding is wrong, do not change code for it: reply to it in your summary with the reason.
4. Never weaken or delete tests to get green. Add a test when a finding is about missing coverage.
5. `npm run check` until green, commit `fix: address review on #$ARGUMENTS`, push.
6. Post a comment starting with `<!-- factory:rework -->`: each finding → what you did (or why not).
7. `gh pr edit $ARGUMENTS --remove-label needs-rework`. The push triggers a fresh review.
