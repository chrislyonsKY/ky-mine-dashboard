# Coding Standards Guardrails

These rules apply to ALL code generated for this project, regardless of which agent is active.

## TypeScript
- Strict mode enabled (`strict: true` in tsconfig)
- No `any` types — use proper interfaces or generics
- All exported functions must have JSDoc comments
- All React components are functional with typed props interfaces
- Use `const` by default; `let` only when reassignment is required; never `var`
- All async operations wrapped in try/catch with meaningful error handling
- No bare `console.log` in production code — use a lightweight logger utility or remove

## React
- Functional components only — no class components
- Custom hooks prefixed with `use` and placed in `src/hooks/`
- Props interfaces named `{ComponentName}Props`
- No inline styles — use Calcite CSS custom properties or `dashboard.css`
- Event handlers named `handle{Event}` (e.g., `handleCountyClick`)
- Memoize expensive computations with `useMemo` and callbacks with `useCallback`

## ArcGIS JS SDK 5.0
- Web components only — NEVER instantiate deprecated widget classes
- All layer/view interactions must await `view.when()` or `layer.load()`
- Use `reactiveUtils.watch()` for property observation
- Definition expressions always start with `Type_Flag <> 'TRNS'`
- Use `StatisticDefinition` for aggregations — never fetch all records to count client-side
- Handle `exceededTransferLimit` flag when querying features

## CSS
- Use CSS custom properties from Calcite for theming
- Dashboard layout via CSS Grid
- No `!important` unless overriding third-party styles
- Class names follow BEM or component-scoped conventions
