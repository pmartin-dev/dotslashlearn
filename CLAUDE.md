# dotslashlearn

Interactive dev learning platform with terminal-inspired UI. Built with TanStack Start, React 19, Tailwind CSS 4.

## Stack

- **Framework**: TanStack Start (`@tanstack/react-start`) with file-based routing on Vite
- **Language**: TypeScript 6 (strict mode)
- **Styling**: Tailwind CSS 4 via `@tailwindcss/vite`, custom design tokens in `src/shared/styles/app.css`
- **Validation**: Zod 4 for runtime schemas
- **Animation**: Motion (framer-motion) — must respect `prefers-reduced-motion` via `useReducedMotion()`
- **Package manager**: pnpm

## Architecture: Feature-based

```
src/
├── features/          ← domain logic, one folder per feature
│   ├── lessons/       ← schema, api, components
│   └── progress/      ← store interface + implementation
├── shared/            ← only code used by 2+ features
│   ├── components/
│   └── styles/
├── routes/            ← thin layer: routing + server functions only
└── router.tsx
```

### Rules

1. **Routes are thin** — they import from `features/`, call server functions, pass data down. Zero business logic in route files.
2. **Dependencies flow inward**: `routes → features → shared`. Never the reverse. A feature never imports from another feature; if they need to communicate, the route wires them together.
3. **Each feature is self-contained** — deleting the folder deletes the feature. Each feature exposes a public API via `index.ts` barrel file.
4. **`shared/` is earned** — only move code there when it's genuinely used by 2+ features. Not a dumping ground.

### Adding a new feature

1. Create `src/features/<name>/` with `schema.ts`, `api.ts` (if server-side), components, and `index.ts` barrel
2. Define types via Zod schemas, derive TypeScript types with `z.infer<>` — never maintain parallel hand-written interfaces
3. Create the route in `src/routes/` that wires the feature to the URL

## Coding conventions

### TypeScript
- Strict mode, no `any`. Use `unknown` + narrowing when type is uncertain.
- Derive types from Zod schemas (`z.infer<typeof schema>`) instead of maintaining parallel interfaces.
- Use `Pick<T, ...>` for component props that are subsets of a domain type.

### Server functions
- Use `createServerFn()` from `@tanstack/react-start` for all server-side data access.
- Validate inputs inside the domain layer (`api.ts`), not only in the route's `inputValidator`.
- Filesystem access must be wrapped in try/catch — never let an unhandled ENOENT crash the server.

### Components
- Wrap risky rendering (markdown, user content) in `<ErrorBoundary>` from `shared/components/`.
- Respect `prefers-reduced-motion` — use `useReducedMotion()` from `motion/react` and conditionally disable animations.
- Use `<Link>` from `@tanstack/react-router` for internal navigation (not `<a href>`). This enables client-side transitions and prefetching.
- Use `useState` initializer functions for synchronous reads (e.g. localStorage) instead of `setState` inside `useEffect`.

### State management
- Client state uses the `ProgressStore` interface pattern in `features/progress/store.ts`.
- New stores must implement an interface so the backend can be swapped (localStorage → API) without touching consumers.
- Always validate data read from localStorage at runtime — never trust `JSON.parse` output directly.

### Styling
- All colors are design tokens defined in `src/shared/styles/app.css` under `@theme inline`.
- Never use raw hex colors in components — always use token names (`bg-abyss`, `text-emerald-signal`).
- The `prose-terminal` class handles all lesson content styling. Add new element styles there, not inline.

### Content (lessons)
- Lessons live in `content/lessons/*.mdx` with YAML frontmatter validated by Zod.
- Steps are separated by `\n---\n`. Avoid `---` inside lesson content (use `<!-- step -->` if needed in the future).
- `draft: true` in frontmatter hides from the viewer (shown greyed out in list).

## Commands

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build
pnpm lint         # ESLint (typescript-eslint + react-hooks)
npx tsc --noEmit  # Type check
```

## Before committing

1. `npx tsc --noEmit` — zero errors
2. `pnpm lint` — zero errors
3. Test all routes manually: home, a lesson, 404, invalid slug
