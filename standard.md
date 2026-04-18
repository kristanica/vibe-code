# Probability Deck Development Standards

## 🛠️ Technology Stack
- **Frontend**: React 19 (Component-based architecture)
- **Language**: TypeScript (Strong typing required)
- **Styling**: Tailwind CSS (Utility-first CSS)
- **Animations**: Framer Motion (Smooth, physics-based transitions)
- **State Management**: Zustand (Minimalist, performant state)
- **Routing**: TanStack Router (Type-safe routing)
- **Icons**: Lucide React (Consistent iconography)
- **Build Tool**: Vite (Fast development and bundling)

## 📐 Code Standards
- **Purity**: React components and hooks must be pure and idempotent. Avoid calling impure functions like `Math.random()` or accessing `Date.now()` directly within the render cycle.
- **Type Safety**: Avoid using `any`. Define interfaces and types for all data structures (see `src/types/game.d.ts`).
- **State Management**: Use Zustand for global game state. Keep state updates concise and handle complex logic within store actions.
- **Immutability**: Treat state as immutable. Use functional updates or spread syntax to create new state objects.
- **Variables**: Prefer `const` over `let` for variables that are never reassigned.

## 🎨 Design & UI Standards
- **Visual Identity**: Modern, high-contrast, "casino-noir" aesthetic. Use deep slates (`bg-slate-950`), vibrant indigos, and neon accents.
- **Animations**: Every interaction (card play, hit, hover) should have visual feedback through Framer Motion.
- **Responsiveness**: Support screen sizes from 320px (mobile) to 2560px (desktop).
- **Accessibility**: Aim for WCAG AA compliance (contrast, labels, keyboard navigation).

## ✅ Verification Workflow
- **Linting**: All code must pass `npm run lint` (ESLint).
- **Type Checking**: All code must pass `tsc` (TypeScript compiler).
- **Build**: Ensure the project builds successfully with `npm run build`.
