# ./learn

I love learning. Whether it's a new language feature, a mental model for async code, or a tool I just discovered -- I find that the best way to truly understand something is to explain it.

**./learn** is a personal learning platform where I turn my own learning journeys into interactive, step-by-step lessons. It's not a course platform or a documentation site. It's a place where I share what I learn, the way I wish someone had explained it to me.

## What it looks like

A terminal-inspired UI with a dark theme, keyboard navigation, and interactive code blocks. Lessons are broken into digestible steps that you navigate through one at a time -- no endless scrolling.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, SSR) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 with custom design tokens |
| Validation | Zod (runtime schemas, single source of truth for types) |
| Animation | Motion (framer-motion), respects `prefers-reduced-motion` |
| Content | MDX with YAML frontmatter, step-based lesson format |
| Build | Vite |
| Package manager | pnpm |

## Architecture

The project follows a **feature-based architecture** with strict dependency rules.

```
src/
├── features/          # domain logic, one folder per feature
│   ├── lessons/       # lesson parsing, rendering, components
│   ├── progress/      # progress tracking (localStorage-backed)
│   └── home/          # landing page feature
├── shared/            # only code used by 2+ features
│   ├── components/    # ErrorBoundary, layout primitives
│   └── styles/        # design tokens, prose-terminal styles
├── routes/            # thin layer: routing + server functions only
└── router.tsx

content/
└── lessons/           # MDX lesson files with YAML frontmatter
```

### Key principles

- **Routes are thin.** They wire features to URLs. Zero business logic.
- **Dependencies flow inward:** `routes -> features -> shared`. Never the reverse. Features never import from other features.
- **Features are self-contained.** Delete the folder, delete the feature. Each one exposes a public API through an `index.ts` barrel.
- **`shared/` is earned.** Code only moves there when genuinely used by 2+ features.
- **Types are derived, not duplicated.** Zod schemas are the single source of truth; TypeScript types are inferred with `z.infer<>`.

## Content format

Lessons are MDX files in `content/lessons/`. Each lesson has YAML frontmatter (title, description, category, order) and is split into steps separated by `---`. This makes it easy to write focused, progressive content without any CMS.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## License

This is a personal project. Feel free to look around and get inspired.
