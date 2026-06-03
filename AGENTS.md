# AGENTS.md — Best Practices for this project

## Commands
- Build: `npm run build` (tsc -b && vite build)
- Dev: `npm run dev`
- No test/lint/typecheck commands configured

## Code conventions
- React 19 + TypeScript, no external state library
- CSS variables for theming (`--accent`, `--bg`, `--text`, etc.)
- `color-mix(in srgb, var(--accent) X%, var(--surface))` for accent-tinted surfaces
- All user settings persisted to localStorage with `merl.md.` prefix key
- Dark/light theme via `data-theme` attribute on `<html>`
- Google Fonts loaded dynamically via a single `<link>` element with id `merl-google-fonts`
- Prefer `useCallback` for handlers, `useMemo` for derived values

## File patterns
- Components in `src/components/`, PascalCase
- CSS in `src/index.css` (single file, no modules)
- Font definitions in `src/fonts.ts`
- Version constant in `src/version.ts` (imported from `package.json` equivalence)
- Icons from `lucide-react` (tree-shakeable named imports)

## Responsive breakpoints (in sync)
- ≥1024px: side-by-side split panes, full toolbar labels
- 768–1023px: side-by-side, icon-only toolbar
- <768px: tabbed editor/preview, icon-only toolbar
- <420px: ultra-compact

## GFM Alerts
- `remark-gfm` does **not** support `> [!NOTE]` / `> [!WARNING]` / `> [!TIP]` / `> [!IMPORTANT]` / `> [!CAUTION]` — handled by custom rehype plugin (`rehypeAlert`)
- `rehypeAlert` visits `<blockquote>` hAST nodes, checks first text child for `^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]`, sets `dataAlert` property, and strips the `[!TYPE]` prefix
- CSS styles each type via `blockquote[data-alert="NOTE"]` etc., using `--alert-color` per type
- Both `src/index.css` and HTML export inline styles include the alert CSS

## Mermaid
- Custom rehype plugin (`rehypeMermaid`) transforms `<code class="language-mermaid">` to `<div class="mermaid">` in HAST tree before `rehypeHighlight`
- `mermaid.initialize()` called at **module level** (import time) with default config — ensures init runs before any component mount
- `Preview` component's `useEffect([theme])` updates `mermaid.initialize()` config when theme changes (dark vs light themeVariables)
- `MermaidBlock` (defined inline in `Preview.tsx`) handles per-block rendering: `mermaid.run({ nodes: [el] })` in its own `useEffect([tick, theme])`
- `data-source` attribute is set **once** from the initial `textContent` on first mount; never overwritten — prevents corruption when mermaid replaces element content with SVG on theme switch
- On every effect run: `textContent` is restored from `data-source` before calling `mermaid.run()` — ensures the source is always available
- On reload (tick > 0): `oldEl.replaceWith(newEl)` to bypass mermaid v11's in-memory processed-node Set, then `mermaid.run({ nodes: [newEl] })`
- Empty diagrams (`textContent` has no non-whitespace) are skipped early with a `return`
- Raw source saved to `data-source` attribute on first mount, survives theme-switch re-renders
- `Preview` wrapped in `React.memo` so it doesn't re-render on split pane resize — prevents React from resetting `.mermaid` textContent to source
- Mermaid config uses `startOnLoad: false`, `background: 'transparent'` in themeVariables

## Popovers (FontSettings, AccentPicker)
- Rendered via `createPortal()` to `document.body` to escape overflow clipping
- `position: fixed` with inline styles calculated from `getBoundingClientRect()`
- Button center relative to viewport width determines left-align vs right-align:
  - center > viewport/2 → right-align (panel right edge = button right edge)
  - center ≤ viewport/2 → left-align (panel left edge = button left edge)
- Both values clamped to viewport bounds (8px padding)
- Dismissed on mousedown outside panel or button

## Collapsible Sections
- `rehypeSectionize` plugin wraps each heading + following siblings into `<section>` elements with proper heading-level nesting
- `CollapsibleSection` component handles collapse state per-section via `useState`/`useCallback`
- Clicking any heading (h1-h6) toggles its section content (hidden via native `hidden` attribute)
- Heading hierarchy preserved: `<h2>` sections contain `<h3>` sections as nested `<section>` elements
- Collapsing a parent hides all nested child sections too
- Chevron indicator via `::before` pseudo-element (`▼` rotates 180° when collapsed)
- Collapsed section shows dashed bottom border as visual cue
- `section[data-collapsed]` attribute and `.collapsible-heading`/`.collapsed` classes drive CSS

## Code blocks (copy button)
- ReactMarkdown `components.pre` override wraps each `<pre>` in a `CodeBlock` component
- `CodeBlock` renders an absolute-positioned header overlay (`.code-block-header`) on top of the macOS dots header strip
- Language extracted from `<code>` child element's `className` (e.g., `language-typescript`)
- Copy via `navigator.clipboard.writeText()`, brief "Copied" feedback with `Check` icon (1.5s timeout)
- Header uses `pointer-events: none` on container, `pointer-events: auto` on the button to allow clicks
- CSS variables are not used inside code blocks (they have a fixed dark background `#0f172a`)

## Editor
- `forwardRef` to expose `<textarea>` for cursor-aware paste
- Drag-and-drop: `dragCounter` ref pattern to prevent enter/leave flickering on nested children; reads `.md` files via `FileReader`, clears old content
- Paste via `navigator.clipboard.readText()`, inserts at `selectionStart/selectionEnd`
- Content persisted to localStorage (`merl.md.content`) on every change via `useEffect`; empty content falls back to `DEMO_CONTENT` on reload
