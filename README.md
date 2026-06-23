# FitMe

Mobile-first adaptive training app built with Vite, React, and local-first persistence.

## Run

```bash
pnpm install
pnpm dev --host 127.0.0.1 --port 5173
```

## Verify

```bash
pnpm lint
pnpm test
pnpm test:personas
pnpm build
```

For the full local quality gate, run:

```bash
pnpm verify
```

## Current Scope

- Quick Plan and Custom Program generation with an offline deterministic engine
- 12-week periodization, event plans, sport overlays, exercise rotation, and injury-aware filtering
- Auto-save to Library after generation
- Program detail, week feedback adjustments, exercise substitution, and persistent exclusions
- Active workout logging with weight/reps bounds validation, rest timer, PR updates, achievements, and progress stats
- Import from Social local parser placeholder for the production AI proxy
- Body measurements, JSON export, 1RM calculator, plate calculator, PWA manifest, and local account deletion
- Persona simulation coverage for beginner, advanced, sport, event, equipment-limited, older adult, and injury-aware use cases
- Local data recovery for corrupted saves, visible save-failure messaging, and backup cleanup on account deletion

## Production Hooks

The app currently stores data in `localStorage` so it can run completely offline. Production wiring should replace `src/storage.js` with Supabase Auth/Postgres queries and route AI enhancement/import parsing through a serverless Anthropic proxy.
