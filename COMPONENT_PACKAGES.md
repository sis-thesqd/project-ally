# Component Package Development Guide

This guide helps AI agents (Claude Code, Cursor) build and integrate new component packages following established patterns.

## Table of Contents
1. [Project Initialization](#project-initialization)
2. [GitHub Package Setup](#github-package-setup)
3. [Architecture Overview](#architecture-overview)
4. [Theming & Styling](#theming--styling)
5. [Complete Pattern Reference](#complete-pattern-reference)
6. [Dashboard Integration](#dashboard-integration)
7. [Supabase & Logging](#supabase--logging)
8. [Full Worked Example](#full-worked-example)
9. [Integration Checklist](#integration-checklist)
10. [Existing Packages Reference](#existing-packages-reference)

---

## Project Initialization

### Step 1: Create New Project with Untitled UI

```bash
npx untitledui@latest init COMPONENT-NAME-HERE --nextjs
```

This creates a Next.js project with:
- Full Untitled UI component library (`src/components/base/`, `src/components/application/`)
- Tailwind CSS v4.1 with theme.css (900+ CSS variables)
- React Aria for accessibility
- `cx()` utility for class merging
- Typography and styling presets

### Step 2: Clean Up for Package Use

After initialization, modify for package distribution:

1. **Remove unnecessary files:**
   - Delete `src/app/` (pages not needed for packages)
   - Keep `src/components/`, `src/styles/`, `src/utils/`, `src/hooks/`

2. **Create package structure:**
```
src/
├── index.ts                        # Package exports (create this)
├── components/prf/{feature}/       # Your feature components
├── context/                        # Context providers
├── store/                          # Zustand stores
├── services/api/                   # API service functions
├── types/                          # Type definitions
└── config/                         # Default configuration
```

3. **Add tsup.config.ts:**
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: { compilerOptions: { incremental: false } },
    sourcemap: true,
    clean: true,
    esbuildOptions(options) {
        options.banner = { js: '"use client";' };
    },
    external: [
        'react', 'react-dom', 'next', 'react-aria-components',
        '@radix-ui/*', '@tanstack/react-query', 'zustand',
        'lucide-react', 'motion', 'tailwind-merge',
    ],
    treeshake: true,
    splitting: false,
    minify: false,
});
```

4. **Install tsup:**
```bash
npm install -D tsup
```

---

## GitHub Package Setup

### Package.json Configuration

```json
{
  "name": "@sis-thesqd/{package-name}",
  "version": "1.0.0",
  "private": false,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "src/components/prf",
    "src/types/{feature}.ts"
  ],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/sis-thesqd/{package-name}.git"
  },
  "scripts": {
    "build:package": "tsup",
    "prepublishOnly": "npm run build:package"
  }
}
```

### Publishing to GitHub Packages

1. **Create GitHub repo** under `sis-thesqd` organization
2. **Authenticate:**
```bash
npm login --registry=https://npm.pkg.github.com
# Use GitHub username and Personal Access Token with `write:packages` scope
```

3. **Build and publish:**
```bash
npm run build:package
NPM_TOKEN={your-token} npm publish
```

### Installing in project-ally

```bash
npm install @sis-thesqd/{package-name}
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  project-ally (Consumer App)                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Props: accountId, memberId, userId, apiConfig      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  @sis-thesqd/prf-{feature}                          │   │
│  │  - Context Provider (config)                         │   │
│  │  - Zustand Store (state)                             │   │
│  │  - API Service (data fetching)                       │   │
│  │  - Feature Components                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  mmq-api-vercel (Vercel Functions)                   │   │
│  │  /api/{feature}/*                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Theming & Styling (CRITICAL)

### The @source Directive

**This is essential for Tailwind to pick up your component's classes.**

In project-ally's `src/styles/globals.css`, add:

```css
@source "../../node_modules/@sis-thesqd/{package-name}/dist/**/*.{js,mjs}";
```

This tells Tailwind v4 to scan your package's dist folder for class usage.

### Theme CSS Variables

All packages MUST use Tailwind utility classes that map to CSS variables defined in project-ally's `theme.css`.

**DO use semantic classes:**
```tsx
// ✅ Correct - uses CSS variable-backed classes
<div className="bg-primary text-secondary border-primary" />
<button className="bg-brand-solid text-white hover:bg-brand-solid_hover" />
<span className="text-tertiary" />
```

**DON'T hardcode colors:**
```tsx
// ❌ Wrong - hardcoded colors won't respect theme
<div className="bg-white text-gray-900" />
<button className="bg-purple-600" />
```

### Key Semantic Color Classes

| Class Pattern | Light Mode | Dark Mode |
|---------------|------------|-----------|
| `bg-primary` | white | gray-900 |
| `bg-secondary` | gray-50 | gray-800 |
| `text-primary` | gray-900 | white |
| `text-secondary` | gray-700 | gray-300 |
| `text-tertiary` | gray-600 | gray-400 |
| `border-primary` | gray-300 | gray-700 |
| `bg-brand-solid` | purple-600 | purple-500 |
| `text-error-primary` | error-600 | error-400 |

### Dark Mode

Uses class-based theming with custom class names:
- Light: `.light-mode`
- Dark: `.dark-mode`

Components automatically adapt - no special handling needed if using semantic classes.

### Scrollbar Utilities

```tsx
// Hide scrollbar completely
<div className="scrollbar-hide overflow-auto" />

// Auto-show on hover (subtle)
<div className="scrollbar-auto overflow-auto" />
```

### The cx() Utility

Always use `cx()` for class merging:

```typescript
import { cx } from '../utils/cx';

<div className={cx(
  "base-classes",
  condition && "conditional-class",
  props.className
)} />
```

### Using Untitled UI Components

Only use components from the Untitled UI library:
- Browse: https://www.untitledui.com/react/components
- Components are in `src/components/base/` and `src/components/application/`

```tsx
// ✅ Correct - use existing components
import { Button } from '../base/buttons/button';
import { Input } from '../base/input/input';
import { Modal } from '../application/modals/modal';
```

---

## Complete Pattern Reference

### 1. Directory Structure

```
src/
├── index.ts                        # Package exports
├── components/prf/{feature}/       # Feature components
│   ├── {Feature}.tsx               # Main component
│   ├── {Feature}Skeleton.tsx       # Loading state
│   └── {SubComponent}.tsx          # Sub-components
├── context/
│   └── {Feature}Context.tsx        # Context + Provider
├── store/
│   └── {feature}Store.ts           # Zustand store
├── services/api/
│   ├── index.ts                    # Combined exports
│   └── {resource}.ts               # API functions
├── types/
│   └── {feature}.ts                # All types
└── config/
    └── {feature}.ts                # Default config
```


### 2. Props Interface (Full Example)

```typescript
// src/types/{feature}.ts
export interface {Feature}Props {
  // === User Context ===
  accountId: number;        // Note: MMQ uses accountNumber
  memberId: number;
  userId: string;

  // === API Configuration ===
  apiConfig: {Feature}ApiConfig;

  // === State ===
  initialState?: Partial<{Feature}State>;

  // === Callbacks ===
  onStateChange?: (state: {Feature}State) => void;
  onError?: (error: Error | string) => void;
  onSuccess?: (result: unknown) => void;

  // === UI Configuration ===
  className?: string;
  showValidation?: boolean;

  // === Analytics (Optional) ===
  trackEvent?: (event: string, props: Record<string, unknown>) => void;
}

export interface {Feature}ApiConfig {
  baseUrl?: string;
  {resource}Endpoint?: string;
  // Add more endpoints as needed
}
```


### 3. Context Provider (Full Example)

```typescript
// src/context/{Feature}Context.tsx
"use client";

import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';

interface {Feature}ContextValue {
  apiConfig: {Feature}ApiConfig;
  data: DataType[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const {Feature}Context = createContext<{Feature}ContextValue | null>(null);

export function {Feature}Provider({
  children,
  apiConfig,
  memberId,
}: {Feature}ProviderProps) {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await fetch{Resource}(apiConfig, memberId);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) refresh();
  }, [memberId]);

  const value = useMemo(() => ({
    apiConfig, data, loading, error, refresh
  }), [apiConfig, data, loading, error]);

  return (
    <{Feature}Context.Provider value={value}>
      {children}
    </{Feature}Context.Provider>
  );
}

export function use{Feature}Context() {
  const context = useContext({Feature}Context);
  if (!context) {
    throw new Error('use{Feature}Context must be used within {Feature}Provider');
  }
  return context;
}
```


### 4. Zustand Store (Full Example)

```typescript
// src/store/{feature}Store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface {Feature}StoreState {
  // State
  formState: {Feature}State;

  // Actions
  updateFormState: (updates: Partial<{Feature}State>) => void;
  resetFormState: () => void;
  setFormState: (state: {Feature}State) => void;
}

const initialState: {Feature}State = {
  // Default values
};

export const use{Feature}Store = create<{Feature}StoreState>()(
  persist(
    (set) => ({
      formState: initialState,

      updateFormState: (updates) =>
        set((state) => ({
          formState: { ...state.formState, ...updates },
        })),

      resetFormState: () =>
        set({ formState: initialState }),

      setFormState: (formState) =>
        set({ formState }),
    }),
    {
      name: 'prf-{feature}-store', // localStorage key
    }
  )
);
```


### 5. API Service (Full Example)

```typescript
// src/services/api/{resource}.ts
import type { {Resource}, {Feature}ApiConfig } from '../../types/{feature}';

export async function fetch{Resource}s(
  config: {Feature}ApiConfig,
  memberId: number | string
): Promise<{ data: {Resource}[] | null; error: string | null }> {
  try {
    const url = new URL(
      config.{resource}Endpoint || '/api/{feature}/{resource}',
      config.baseUrl || window.location.origin
    );
    url.searchParams.set('memberId', String(memberId));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    return { data: json.data || json.{resource}s || [], error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
```


### 6. Main Component (Full Example)

```typescript
// src/components/prf/{feature}/{Feature}.tsx
"use client";

import React from 'react';
import { {Feature}Provider } from '../context/{Feature}Context';
import { {Feature}Form } from './{Feature}Form';
import type { {Feature}Props } from '../../../types/{feature}';

export function {Feature}({
  accountId,
  memberId,
  userId,
  apiConfig,
  initialState,
  onStateChange,
  onError,
  className,
}: {Feature}Props) {
  return (
    <{Feature}Provider
      apiConfig={apiConfig}
      memberId={memberId}
    >
      <div className={className}>
        <{Feature}Form
          initialState={initialState}
          onStateChange={onStateChange}
          onError={onError}
        />
      </div>
    </{Feature}Provider>
  );
}
```


### 7. Package Exports (Full Example)

```typescript
// src/index.ts
// Main components
export { {Feature} } from './components/prf/{feature}/{Feature}';
export { {Feature}Skeleton } from './components/prf/{feature}/{Feature}Skeleton';

// Context
export { {Feature}Provider, use{Feature}Context } from './context/{Feature}Context';

// Store
export { use{Feature}Store } from './store/{feature}Store';

// Types
export type {
  {Feature}Props,
  {Feature}ApiConfig,
  {Feature}State,
  {Resource},
} from './types/{feature}';
```

---

## Dashboard Integration

### Layout Hierarchy

Components are embedded within project-ally's dashboard layout:

```
app/
├── layout.tsx                    # Root: Theme, Fonts, global providers
├── (dashboard)/
│   ├── layout.tsx               # Dashboard: Sidebar, Header, auth check
│   └── projects/
│       ├── layout.tsx           # Projects layout wrapper
│       └── page.tsx             # Renders component packages
```

### Provider Wrapping Pattern

In project-ally pages, wrap components with their providers:

```tsx
// app/(dashboard)/projects/page.tsx
"use client";

import { GeneralInfo, GeneralInfoProvider } from '@sis-thesqd/prf-general-info';
import { ProjectSelection, SelectionProvider } from '@sis-thesqd/prf-project-selection';

export default function ProjectsPage() {
  const { user } = useAuth();  // Your auth context

  const apiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    ministriesEndpoint: '/api/ministries',
    projectTypesEndpoint: '/api/project-types',
  };

  return (
    <div className="flex flex-col gap-8">
      <ProjectSelection
        accountId={user.accountId}
        memberId={user.memberId}
        userId={user.id}
        apiConfig={apiConfig}
        onSelectionChange={handleSelectionChange}
      />

      <GeneralInfo
        apiConfig={apiConfig}
        selectedProjectIds={selectedIds}
        showValidation={showValidation}
      />
    </div>
  );
}
```

### URL Routing for PRF Components

PRF (Project Request Form) components use URL paths for multi-step flows:

```
/projects                     # Project selection step
/projects/details            # General info step
/projects/review             # Review & submit step
```

State is persisted via Zustand stores, allowing users to navigate between steps without losing data.

### Component Dimensions

- **Full width**: Components expand to fill available width
- **Max heights**: Use `max-h-[600px] overflow-auto` for scrollable sections
- **Responsive**: All components must work on mobile (sm:, md:, lg: breakpoints)

---

## Supabase & Logging

### Current State

Activity logging is currently **console-based only**:

```typescript
// Current pattern in components
console.log('Action performed:', { action, userId, timestamp });
```

### Future: Supabase Activity Logging

When implementing Supabase logging:

```typescript
// src/services/api/activity.ts
import { createClient } from '@supabase/supabase-js';

export async function logActivity(
  supabaseClient: SupabaseClient,
  activity: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await supabaseClient
    .from('activity_logs')
    .insert({
      user_id: activity.userId,
      action: activity.action,
      resource_type: activity.resourceType,
      resource_id: activity.resourceId,
      metadata: activity.metadata,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to log activity:', error);
  }
}
```

### Passing Supabase Client

Components should accept an optional `supabaseClient` prop for logging:

```typescript
interface FeatureProps {
  // ... other props
  supabaseClient?: SupabaseClient;  // Optional for activity logging
}
```

### Activity Types to Log

| Action | Resource Type | When |
|--------|--------------|------|
| `view` | `project_selection` | Component mounted |
| `select` | `project_type` | User selects a project |
| `submit` | `project_request` | Form submitted |
| `update` | `form_field` | Important field changes |
| `error` | `api_call` | API errors occur |

### Error Tracking

Use optional `onError` callback for error handling:

```tsx
<GeneralInfo
  onError={(error) => {
    // Log to error tracking service
    Sentry.captureException(error);
    // Show user-friendly message
    toast.error('Something went wrong');
  }}
/>
```

---

## Full Worked Example

See the actual implementations in these packages:

### prf-general-info
- Main component: `src/components/prf/general-info/GeneralInfo.tsx`
- Context: `src/components/prf/context/GeneralInfoContext.tsx`
- Store: `src/store/generalInfoStore.ts`
- Types: `src/types/generalInfo.ts`

### prf-project-selection
- Main component: `src/components/prf/selection/ProjectSelection.tsx`
- Context: `src/context/SelectionContext.tsx`
- Store: `src/store/selectionStore.ts`
- Services: `src/services/api/`
- Types: `src/types/prf.ts`

### mmq-component (simpler pattern)
- Main component: `src/components/mmq/MMQ.tsx`
- Types: `src/types/mmq.ts`
- Uses useState instead of Zustand (legacy)

---

## Integration Checklist

### Package Setup
- [ ] Initialize with `npx untitledui@latest init {name} --nextjs`
- [ ] Remove `src/app/` directory
- [ ] Create package structure (context, store, services, types)
- [ ] Add tsup.config.ts
- [ ] Update package.json with @sis-thesqd scope and publishConfig

### Component Development
- [ ] Create main component with Provider wrapper
- [ ] Create Context with API config
- [ ] Create Zustand store with persist middleware
- [ ] Create modular API service functions
- [ ] Create Skeleton loading component
- [ ] Use only semantic color classes (no hardcoded colors)
- [ ] Use `cx()` for all class merging

### Publishing
- [ ] Run `npm run build:package`
- [ ] Verify dist folder contains .js, .mjs, and .d.ts files
- [ ] Run `NPM_TOKEN={token} npm publish`

### Integration in project-ally
- [ ] Install package: `npm install @sis-thesqd/{package}`
- [ ] Add @source directive to globals.css:
      `@source "../../node_modules/@sis-thesqd/{package}/dist/**/*.{js,mjs}";`
- [ ] Import and use component with required props
- [ ] Verify theming works in both light and dark modes

---

## Existing Packages Reference

| Package | Purpose | Key Props |
|---------|---------|-----------|
| @sis-thesqd/mmq-component | Queue management | accountNumber*, viewType |
| @sis-thesqd/prf-project-selection | Project type selection | accountId, memberId, userId, apiConfig |
| @sis-thesqd/prf-general-info | Request form details | apiConfig, selectedProjectIds |

*Note: MMQ uses `accountNumber` for legacy reasons; new packages should use `accountId`

---

## Critical Gotchas (MUST READ)

### 1. Always Import React Explicitly

**JSX requires React to be in scope.** Even with modern JSX transform, bundled packages need explicit imports.

```tsx
// ❌ WRONG - Will cause "React is not defined" runtime error
"use client";

import { useState, useEffect } from 'react';

export function MyComponent() {
  return <div>Hello</div>;  // ERROR: React not defined
}

// ✅ CORRECT - Always import React
"use client";

import React, { useState, useEffect } from 'react';

export function MyComponent() {
  return <div>Hello</div>;  // Works!
}
```

### 2. Headers Rendered by project-ally, NOT Components

**Components should NOT include their own headers.** The consuming app (project-ally) renders headers for consistency.

```tsx
// ❌ WRONG - Component with built-in header
export function DesignStyle({ onBack }) {
  return (
    <div>
      {/* Don't do this - header belongs in project-ally */}
      <div className="flex items-center gap-3">
        <Button onClick={onBack} iconLeading={ArrowLeft} />
        <h1>Design Style</h1>
        <p>Choose a design style...</p>
      </div>
      {/* Component content */}
    </div>
  );
}

// ✅ CORRECT - Component without header
export function DesignStyle({ onBack, onContinue }) {
  return (
    <div className="flex flex-col pb-8">
      {/* Just the content */}
      <div className="pb-12">
        {/* Feature content here */}
      </div>
      {/* Footer with Back/Continue */}
      <Footer onBack={onBack} onContinue={onContinue} />
    </div>
  );
}

// In project-ally step page:
if (step === "3") {
  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      {/* Header rendered by project-ally */}
      <div className="pb-8 max-w-7xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl font-semibold text-primary">Design Style</h1>
        <p className="text-secondary mt-1 text-sm sm:text-base">
          Choose a design style that best matches your vision.
        </p>
      </div>

      {/* Component centered */}
      <div className="max-w-7xl mx-auto w-full">
        <DesignStyle ... />
      </div>
    </main>
  );
}
```

### 3. Footer Pattern - Simple Back/Continue

Use a simple footer with `flex justify-between gap-3`, matching GeneralInfo's pattern:

```tsx
// ✅ CORRECT Footer pattern
function FeatureFooter({
  onBack,
  onContinue,
  isContinueDisabled = false,
  isLoading = false,
}: FeatureFooterProps) {
  return (
    <div className="flex justify-between gap-3">
      <Button
        color="secondary"
        size="md"
        onClick={onBack}
        iconLeading={ArrowLeft}
      >
        Back
      </Button>
      <Button
        color="primary"
        size="md"
        onClick={onContinue}
        isDisabled={isContinueDisabled}
        isLoading={isLoading}
        iconTrailing={ArrowRight}
      >
        Continue
      </Button>
    </div>
  );
}

// Main component structure
export function Feature({ onBack, onContinue, className }) {
  return (
    <div className={cx('flex flex-col pb-8', className)}>
      {/* Content */}
      <div className="pb-12">
        {/* Feature content */}
      </div>

      {/* Footer */}
      <FeatureFooter
        onBack={onBack}
        onContinue={onContinue}
        isContinueDisabled={isSubmitting}
        isLoading={isSubmitting}
      />
    </div>
  );
}
```

### 4. Use @untitledui/icons, NOT lucide-react

Icons should come from the Untitled UI icons package:

```tsx
// ❌ WRONG - Don't use lucide-react
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

// ✅ CORRECT - Use @untitledui/icons
import { ArrowLeft, ArrowRight } from '@untitledui/icons';
```

### 5. Component Layout Class Pattern

Components should use this layout pattern for consistency:

```tsx
// ✅ CORRECT layout structure
<div className={cx('flex flex-col pb-8', className)}>
  {/* Content with bottom padding for footer spacing */}
  <div className="pb-12">
    {/* Feature content */}
  </div>

  {/* Footer */}
  <Footer ... />
</div>
```

**DON'T use:**
- `min-h-screen` (parent controls height)
- Fixed position footers (use flow layout)
- Background colors (inherit from parent)

---

## Troubleshooting

### React is not defined
**Cause:** Missing React import in component file.
**Fix:** Add `import React from 'react';` at the top of every component file that uses JSX.

### Styles Not Applying
1. Check that `@source` directive is in globals.css
2. Verify the path points to `dist/**/*.{js,mjs}`
3. Restart the dev server after adding @source

### Dark Mode Not Working
1. Ensure you're using semantic classes (bg-primary, text-secondary)
2. Don't hardcode colors (bg-white, text-gray-900)
3. Check that the parent has `.light-mode` or `.dark-mode` class

### Build Errors
1. Check that all external dependencies are listed in tsup.config.ts
2. Verify `"use client"` banner is being added
3. Run `npm run build:package` and check for TypeScript errors

### Package Not Found After Publishing
1. Wait 1-2 minutes for GitHub Packages to index
2. Check you're authenticated with `npm login --registry=https://npm.pkg.github.com`
3. Verify the package is visible at github.com/orgs/sis-thesqd/packages
