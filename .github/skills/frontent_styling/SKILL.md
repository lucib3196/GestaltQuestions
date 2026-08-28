Use this skill when working on `frontend`
Prioritize the project's existing styling sources before inventing new tokens or one-off utilities:

2. Read `tailwind.config.ts` or the frontend-local equivalent to discover available colors, spacing, radii, shadows, fonts, and semantic extensions.
3. Read app-level `index.css` to find theme variables, shared component classes, and dark-mode conventions.

Use those files as the source of truth for component styling decisions. If one of those paths does not exist, locate the nearest app-level equivalent before adding new styles.


Styling Rules

- Prefer Tailwind's compact utility form for static class strings.
- Reuse existing Tailwind theme keys and CSS variables instead of hardcoding near-duplicate values.
- Preserve the current project approach for conditional classes such as `clsx`, `cn`, or `cva` if already present nearby.
- Keep component styles colocated in the TSX unless the project already uses shared CSS/component recipes for the same pattern.
- When introducing shared styling, make it semantic and reusable rather than naming it after a one-off screen state.


Light And Dark Mode

- Support both light and dark mode using the project's established theming system from `index.css`.
- Prefer semantic tokens or CSS custom properties from `index.css` over raw color literals.
- If the project uses Tailwind `dark:` modifiers, mirror that pattern consistently.
- Check contrast for message text, subtle borders, muted helper text, and status icon colors in both themes.