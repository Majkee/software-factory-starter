# Factory tasks

Every task answers five questions before it exists: what triggers it, what it reads and writes, what it
triggers next, where a human comes back in, and what stops two runs doing the same work.

| Task                  | Workflow                | Trigger                              | Reads → writes                                                      | Triggers next                     | Human comes back                            | Duplicate guard                                              |
| --------------------- | ----------------------- | ------------------------------------ | ------------------------------------------------------------------- | --------------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| **Triage**            | `agent-triage.yml`      | issue labeled `needs-triage`         | issue, code → brief comment + one label                             | `ready-for-agent` → dispatch      | `needs-info`, `ready-for-human`, `wontfix`  | concurrency per issue; removes `needs-triage` first          |
| **Dispatch** (no LLM) | `agent-dispatch.yml`    | `ready-for-agent`, hourly, PR closed | open agent work → `agent:in-progress` on the oldest ready issue     | implement                         | —                                           | single global concurrency group; WIP limit `FACTORY_MAX_WIP` |
| **Implement**         | `agent-implement.yml`   | issue labeled `agent:in-progress`    | issue, code → branch + draft PR (`agent`)                           | review                            | stuck after 2 tries → `ready-for-human`     | concurrency per issue; branch `agent/<n>-*`                  |
| **Review**            | `agent-review.yml`      | agent PR opened / updated            | diff, issue, `CODING_STANDARDS.md` → review comment + verdict label | `needs-rework` or `review:passed` | `review:passed` → human approves and merges | concurrency per PR; cancels stale runs                       |
| **Rework**            | `agent-rework.yml`      | PR labeled `needs-rework`            | review findings, CI logs → commits on the PR branch                 | review (on push)                  | after 2 failed reviews → `ready-for-human`  | concurrency per PR; attempt counter                          |
| **CI doctor**         | `agent-ci-doctor.yml`   | CI failed                            | failed logs → issue (main) or `needs-rework` (agent PR)             | triage / rework                   | issue goes through triage                   | one open `ci-failure` issue per workflow+SHA                 |
| **Maintenance**       | `agent-maintenance.yml` | nightly                              | ratchet list, `npm audit`, code → one small PR or issue             | review                            | human merges                                | skips if a `factory:maintenance` PR is open                  |
| **Retro**             | `agent-retro.yml`       | weekly                               | merged agent PRs + reviews → PR to standards/AGENTS                 | — (never chains)                  | always human-reviewed                       | skips if a `factory:retro` PR is open                        |
| **Metrics** (no LLM)  | `factory-metrics.yml`   | weekly                               | GitHub API → job summary + metrics issue                            | —                                 | humans read it before opening the throttle  | —                                                            |
| **Assist**            | `agent-assist.yml`      | `@claude` comment by a maintainer    | thread → answer or commits                                          | —                                 | the human asked                             | per thread                                                   |

## Limits (repository variables)

| Variable            | Default        | Meaning                                                                                 |
| ------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `FACTORY_ENABLED`   | unset          | Kill switch. Every agent workflow runs only when this is `true`.                        |
| `FACTORY_MAX_WIP`   | `2`            | Max issues in `agent:in-progress` plus open agent PRs. Raise it only when metrics hold. |
| `FACTORY_MODEL`     | action default | Optional model override for agent runs.                                                 |
| `FACTORY_APP_ID`    | —              | GitHub App used so the factory's own events trigger the next workflow.                  |
| `FACTORY_BOT_LOGIN` | —              | The app's bot login, e.g. `my-factory[bot]` (allowed to trigger agent runs).            |
| `HOLDOUT_REPO`      | unset          | `owner/repo` with hidden acceptance tests (optional).                                   |
