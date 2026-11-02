# Labels

Labels are the factory's control panel and its memory. Create them with the "factory: setup labels"
workflow (`.github/workflows/setup-labels.yml`), which reads `.github/labels.json`.

Issue lifecycle:

```
needs-triage ─► ready-for-agent ─► agent:in-progress ─► (draft PR, label agent)
     │                 ▲
     ├─► needs-info ───┘ (human answers, re-labels needs-triage)
     ├─► ready-for-human  (a person takes it)
     └─► wontfix          (+ .out-of-scope/ note if it may come back)
```

PR lifecycle:

```
agent ─► review ─► review:passed ─► human approves + merges
            └────► needs-rework ─► rework ─► review … (2 failures ─► ready-for-human)
```

Rules:

- A run removes the label that triggered it before it starts work, so a re-run never doubles up.
- Only humans add `ready-for-agent` to issues they did not write through triage, and only humans merge.
- `factory:*` labels mark PRs the factory opened on its own (maintenance, retro).
