# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HTTP Cobalto 60** is an interactive educational guide to HTTP status codes where each code is explained through real, dark events and realities from Mexico. Named after the 1983 Cobalt-60 radioactive incident in Ciudad Juárez. It is a technically rigorous reference, not a comedy project.

Target audience: Spanish-speaking developers, Mexican devs, programming students.

## Commands

```bash
npm run dev        # Dev server on http://localhost:3000
npm run build      # Production build
npm run generate   # Static Site Generation (SSG) — primary deploy target
npm run preview    # Preview production build locally
npm run postinstall # Runs `nuxt prepare` (auto-runs after npm install)
```

## Tech Stack

- **Nuxt 4** (Vue 3 + Composition API) — framework
- **Vuetify 3** — UI component system (NO Tailwind CSS)
- **Shiki** — syntax highlighting
- **@vite-pwa/nuxt** — PWA support
- **@nuxtjs/seo** — SEO/meta/Open Graph
- **@vueuse/motion** — animations
- Custom styles via SCSS/CSS only (no utility-first CSS)

## Architecture

This is a Nuxt 4 project using the `app/` directory convention. The project is currently scaffolded but not yet built out. The full spec is in `COBALTO60.md`.

### Planned Structure (per COBALTO60.md)

- `app/pages/` — Routes: `/` (landing), `/codigos` (explorer), `/codigos/[code]` (individual code page), `/about`
- `app/components/` — Organized by domain: `landing/`, `code/`, `navigation/`, `ui/`
- `app/composables/` — `useCodes.ts` (filter/search logic), `useCategories.ts` (category colors/data)
- `app/data/codes.ts` — Complete HTTP code catalog with `HTTPCode` interface
- `app/data/examples/` — Code examples per language: `javascript.ts`, `python.ts`, `php-laravel.ts`, `rust.ts`, `cpp.ts`
- `app/layouts/default.vue` — Main layout with NavBar and Footer
- `app/assets/css/main.scss` — Global styles

### Key Data Structure

```typescript
interface HTTPCode {
  code: number;
  title: string;                  // Official RFC name
  mexicanContext: string;         // Mexican context name
  category: 'info' | 'success' | 'redirect' | 'client-error' | 'server-error';
  description: string;            // RFC technical definition
  mexican: string;                // Mexican context explanation
  image?: string;
  examples: {
    javascript: string;           // Express
    python: string;               // FastAPI
    phpLaravel: string;           // Laravel
    rust: string;                 // Actix Web
    cpp: string;                  // Crow
  };
  bestPractice: string;
  antiPattern?: string;
  relatedCodes?: number[];
  headers?: string[];
}
```

## Critical Rules

- **All content in Mexican Spanish.** Code comments in Spanish.
- **NO Tailwind CSS.** Vuetify handles styling; use SCSS for custom styles.
- **Dark theme only.** Background `#0C0C0C`, surfaces `#1E1E1E`, text `#B0B0B0` (never pure white). Category colors are desaturated/muted.
- **Tone: somber, direct, unflinching.** Technically rigorous. Culturally honest. Black humor is okay but never trivializes tragedies.
- **HTTP philosophy:** The HTTP status code IS the message. No wrapper objects like `{ data, message, status, success }`. Validation errors use `{ errors: { field: string[] } }` structure.
- **Code examples must be functional** (not pseudo-code), following the HTTP philosophy, 10-25 lines each, in all 5 languages.
- **SSG deployment** — the site is statically generated.
- **One URL per HTTP code** for SEO (`/codigos/[code]`).
- **Animations: subtle and slow.** No flashy effects, no parallax, no particles.

## Design Palette Reference

```
Background:    #0C0C0C / #141414 / #1A1A1A
Surfaces:      #1E1E1E
Borders:       #2A2A2A
Text:          #B0B0B0 (primary) / #6B6B6B (secondary) / #4A4A4A (muted)
Accent:        #8B7355 (ochre/adobe)

Categories:
  1xx: #5C6378   2xx: #4A6B5A   3xx: #7B6B3A
  4xx: #7B4A4A   5xx: #6B2A2A
```

## Full Spec

See `COBALTO60.md` for the complete project specification including the full HTTP code catalog, page layouts, component details, and development order.
