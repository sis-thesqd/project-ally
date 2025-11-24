# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Untitled UI starter kit for Next.js, built with:
- **Next.js 15.4** with App Router
- **React 19.1** with React Aria Components for accessible UI
- **Tailwind CSS v4.1** with custom utilities and plugins
- **TypeScript 5.9**
- **next-themes** for dark mode support

The project is based on [Untitled UI React](https://www.untitledui.com/react), a comprehensive open-source React UI component library.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev
# or
bun dev

# Build for production
npm run build

# Start production server
npm start
```

The dev server runs at http://localhost:3000

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with Inter font, Theme, and RouteProvider
│   └── page.tsx            # Entry point (exports HomeScreen)
├── components/
│   ├── base/               # Core UI components (buttons, inputs, forms, etc.)
│   ├── application/        # Application-level components (tabs, modals, charts, etc.)
│   ├── marketing/          # Marketing components (header navigation)
│   ├── foundations/        # Foundation elements (icons, logos, featured-icon)
│   └── shared-assets/      # Shared assets (illustrations, background patterns)
├── hooks/                  # Custom React hooks
│   ├── use-breakpoint.ts
│   ├── use-clipboard.ts
│   └── use-resize-observer.ts
├── providers/              # Context providers
│   ├── theme.tsx           # ThemeProvider using next-themes
│   └── router-provider.tsx # Router context provider
├── styles/
│   ├── globals.css         # Global styles with Tailwind imports
│   ├── theme.css           # Theme variables and color definitions
│   └── typography.css      # Typography styles
└── utils/
    ├── cx.ts               # Tailwind class merging utility (twMerge wrapper)
    └── is-react-component.ts
```

### Key Architectural Patterns

**Component Organization**:
- `base/` contains primitive UI components (buttons, inputs, forms)
- `application/` contains composed application-level components
- `foundations/` contains foundational elements like icons and logos
- Components are built with React Aria for accessibility

**Styling System**:
- Uses Tailwind CSS v4.1 with custom configuration
- `cx()` utility (from `@/utils/cx`) is an extended version of tailwind-merge that supports custom display text classes
- `sortCx()` helper function enables Prettier sorting of class objects
- Custom variants: `dark`, `label`, `focus-input-within`
- Custom utilities: `scrollbar-hide`, `transition-inherit-all`

**Theme Configuration**:
- Dark mode via `next-themes` with class-based strategy
- Classes: `light-mode` and `dark-mode` (not the default `light`/`dark`)
- Theme provider wraps app in `layout.tsx`
- System theme detection enabled

**Font Configuration**:
- Inter font loaded via `next/font/google` with `display: swap`
- Font variable: `--font-inter`
- Applied globally in root layout

**Import Path Aliases**:
- `@/*` maps to `src/*` for cleaner imports

## Code Style Guidelines

### Prettier Configuration

The project uses strict Prettier formatting:
- Print width: 160 characters
- Tab width: 4 spaces
- Import order plugin with specific sorting rules
- Tailwind plugin configured to recognize `cx` and `sortCx` functions

**Import Order** (auto-sorted):
1. React
2. React DOM
3. External packages
4. Internal `@/` imports
5. Relative imports

### Tailwind Class Management

Always use the `cx()` utility from `@/utils/cx` to merge Tailwind classes:

```tsx
import { cx } from "@/utils/cx";

<div className={cx("base-class", conditionalClass && "conditional", props.className)} />
```

For style objects that need sorting, use `sortCx()`:

```tsx
const styles = sortCx({
    base: "flex items-center gap-2",
    variant: {
        primary: "bg-blue-500",
        secondary: "bg-gray-500",
    },
});
```

### TypeScript Patterns

- Strict mode enabled
- Use `type` for object shapes, `interface` for extendable contracts
- Component props should be typed explicitly
- Import types with `import type` when possible

## Component Synchronization

This repository syncs components from the main [untitleduico/react](https://github.com/untitleduico/react) repository via GitHub Actions workflow:

**Workflow**: `.github/workflows/sync-components.yml`
- Manual trigger from Actions tab
- Syncs: `components`, `hooks`, `utils`, `styles` directories
- Automatically removes `"use client"` directives during sync
- Creates PR with detailed diff and commit history
- Tracks sync state in `.github/last-sync-commit`

**Sync modes**:
- `all`: Syncs all files (creates/updates)
- `existing-only`: Only updates existing files

When modifying synced components, be aware that changes may be overwritten by future syncs.

## Next.js Configuration

- Optimized package imports for `@untitledui/icons`
- App Router with TypeScript support
- Turbopack enabled for faster development builds

**Supabase**:
- Always use Supabase MCP when asked to create something or interact with anything in Supabase