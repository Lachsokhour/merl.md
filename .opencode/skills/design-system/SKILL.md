---
name: design-system
description: Use when making visual, layout, spacing, typography, color, responsive, theme, or component changes to merl.md. Covers CSS tokens, component patterns, z-index, animations, popovers, review mode, and export HTML.
---

# merl.md Design System & UX/UI

## Design Tokens

### Colors
- `--bg`: page background (`#fafafa` light / `#0f172a` dark)
- `--surface`: card/surface background (`#ffffff` light / `#1e293b` dark)
- `--surface2`: secondary surface for hover/stats (`#f1f5f9` light / `#334155` dark)
- `--text`: primary text (`#1a1a2e` light / `#f1f5f9` dark)
- `--text2`: secondary/muted text (`#64748b` light / `#94a3b8` dark)
- `--accent`: interactive accent (`#6366f1` light / `#818cf8` dark, user-overridable)
- `--accent-hover`: computed as 85% brightness of accent
- `--border`: borders & dividers (`#e2e8f0` light / `#334155` dark)
- Theme switching via `data-theme` attribute on `<html>`, transitions on `background 0.3s, color 0.3s`

### Accent Color System
- 12 preset colors in a 2×6 grid (indigo, blue, sky, teal, emerald, lime, amber, orange, red, rose, pink, purple)
- User can pick any custom color via `<input type="color">`
- Setting `accentColor` to `null` restores the theme default
- Custom accent persists in localStorage as `merl.md.accentColor`
- On change: sets `--accent` CSS variable directly, computes `--accent-hover` as 85% brightness
- Dark mode default: `#818cf8`, Light mode default: `#6366f1`

### Typography
- `--font`: composite of `--font-english`, `--font-khmer` (set dynamically via JS)
- `--font-english`: e.g. `'Inter', system-ui, sans-serif`
- `--font-khmer`: e.g. `'Google Sans', sans-serif`
- 13 English fonts + 17 Khmer fonts available in `src/fonts.ts`
- Google Fonts loaded via single `<link id="merl-google-fonts">` element
- **Editor**: hardcoded `'Google Sans', sans-serif` (not controlled by font settings)
- **Code blocks**: fixed `var(--mono)` = `'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace`
- **Preview base size**: `var(--preview-font-size)` (12–24px, default 16px, persisted)

### Spacing Scale
- **Tight** (compact UIs): 4px, 6px, 8px
- **Standard** (padding/gaps): 10px, 12px, 14px, 16px
- **Relaxed** (preview padding): 20px, 28px
- **Preview typography** uses `em` units: heading margins `1.2em 0.3em`, paragraph `0.65em`

### Borders & Radii
- `--radius`: 12px (large cards, dialogs)
- `--radius-sm`: 8px (buttons, inputs, small containers)
- Standard `--border` color for all borders
- `--shadow`: subtle box-shadow for surfaces (`0 1px 3px ...`)
- Accent-tinted borders via `color-mix(in srgb, var(--accent) X%, var(--border))`

### Z-Index Stack
- 2: `.block-header` overlay on code/mermaid
- 10: `.toolbar` (sticky)
- 10: `.drop-overlay` (drag-and-drop)
- 500: `.review-mode` (full-screen overlay)
- 520: `.review-progress` (reading progress bar)
- 600: `.scroll-to-top`
- 1000: popover panels, `.toast`

## Layout System

### Split Pane Architecture
- `.app-root`: full viewport flex column
- `.app-container`: flex row, fills remaining height
- Two `.pane` children (editor + preview) with draggable `.pane-divider` between them
- Pane widths: 15%–85% range, default 50/50
- Each pane: flex column with `.pane-header` + content area
- `touch-action: none` on divider for touch devices

### Responsive Breakpoints
- **≥1024px**: side-by-side split panes, full toolbar labels
- **768–1023px**: side-by-side, icon-only toolbar (`.toolbar-btn-label { display: none }`)
- **<768px**: tabbed (`.app-container` becomes column, one pane visible at a time via `.mobile-hidden`, `.pane-divider` hidden, `.mobile-tabs` shown)
- **<420px**: ultra-compact (smaller buttons, padding, review controls)
- `.toolbar-stats` hidden at <1024px, `.toolbar-group` (font size) hidden at <768px
- Review mode: sidebar hidden at <1024px, bottom bar shown instead

## Component Patterns

### Toolbar Buttons (`.toolbar-btn`)
- Border + background button with `--radius-sm`
- Hover: `--surface2` background, `--accent` border and text
- `.active` state: filled `--accent` background, white text
- `.disabled`: 0.35 opacity, no hover effects
- Gap 6px between icon and label
- `.toolbar-btn-icon`: compact variant with padding `7px 8px`

### Pane Headers (`.pane-header`)
- 11px uppercase label with `.pane-header-file` for filename
- `.pane-header-clear`: 22px icon buttons, `opacity: 0.5`, hover reveals
- `.pane-header-danger`: red hover color

### Popovers (FontSettings, AccentPicker)
- Rendered via `createPortal()` to `document.body` to escape overflow clipping
- `position: fixed` with inline styles from `getBoundingClientRect()`
- Smart viewport alignment: button center > viewport/2 → right-align, otherwise left-align
- Clamped to viewport bounds with 8px padding
- Flip above button when `below + panelHeight > viewportHeight && above space available`
- Dismissed on `mousedown` outside panel or trigger button
- `.font-panel`: card with `--radius`, `--shadow`, 14px 16px padding, flex column, 10px gap

### Review Mode
- Full-screen fixed overlay (z-index 500)
- `.review-body`: max-width 1200px, centered, flex row (content | sidebar)
- `.review-progress`: fixed 3px bar at top (z-index 520)
- `.review-content-wrap`: `min-width: 0` for flex shrinkage
- `.review-sidebar`: flex column, `.review-sidebar-inner` has border + surface background
- `.review-sidebar-btn`: 38px icon buttons, `--radius`: 8px
- `.review-bottom-bar`: shown at <1024px, horizontal button row, border-top, overflow-x: auto
- `.review-bottom-btn`: 34px icon buttons
- `.review-bottom-sep`: 1px vertical divider
- Escape key exits review mode

### Code Blocks
- `.code-block-wrap`: relative wrapper for `<pre>` + overlay header
- `<pre>`: dark background `#0f172a`, 48px top padding (for header), 12px radius, macOS dots via `::before`
- `.block-header`: absolute overlay, 36px height, `padding: 0 12px 0 58px` (avoid dots), `pointer-events: none` on container, `pointer-events: auto` on copy button
- `.code-lang`: language label, 11px uppercase
- `.code-copy-btn`: subtle border + background on dark surface
- `[data-theme='dark'] pre` background: `#0b1120`

### Mermaid Diagrams
- `.mermaid-wrap`: border + card, accent-tinted background/border
- `.mermaid-header`: in-flow flex row (not absolute), 36px, macOS dots via `::before`
- `.mermaid`: centered diagram area with dot-grid background pattern (22px spacing)
- Each diagram rendered independently via `MermaidBlock` component
- `data-source` attribute preserved across re-renders (theme switches)
- Reload button triggers re-render by incrementing tick counter
- Error state: `.mermaid.mermaid-error` (red text, monospace)

### GFM Alerts
- `<blockquote data-alert="NOTE|TIP|IMPORTANT|WARNING|CAUTION">`
- Per-type `--alert-color` variable
- Alert icon: 18px SVG via `background-image` on `.alert-icon` span
- `.alert-title` paragraph: `font-weight: 700`, `text-transform: uppercase`, `0.7em`
- Left border: 4px solid `var(--alert-color)`
- Background: `color-mix(in srgb, var(--alert-color) 6%, var(--surface))`
- In hAST: `rehypeAlert` plugin sets `alertType` property (camelCase → `data-alert` in React)

### Collapsible Sections
- `rehypeSectionize` wraps headings + siblings in `<section>`s with heading-level nesting
- `<section data-collapsed>` toggles `.section-content[hidden]`
- ChevronDown icon: `transform: rotate(-90deg)` when collapsed (`.collapse-icon.collapsed`)
- Collapsed section shows dashed bottom border
- Heading click handler on `.collapsible-heading` class

### Toast Notifications
- Portaled to `document.body`, fixed bottom-center
- 2s auto-dismiss via `setTimeout` in `useEffect`
- Slide-up animation (`toast-in`)
- Black background with inverted text
- `pointer-events: none` (non-interactive)

### Scroll to Top
- Separate component with own scroll state (prevents re-rendering Preview)
- Shows when `scrollTop > 300px`
- Portaled to `document.body`, z-index 600
- 40px circle with border + shadow, hover fills accent

## Text Selection
- `::selection` uses `color-mix(in srgb, var(--accent) 70%, transparent)`
- Preview has slightly stronger selection: 75% opacity

## Animation Patterns
- Duration: 0.15s for most interactions, 0.2s for hover effects, 0.3s for theme transitions
- Easing: `ease-out` for entrances, `ease-in-out` for decorative animations
- Drop overlay: `drop-fade-in 0.15s ease-out`
- Toast: `toast-in 0.25s ease-out`
- Brand gradient: `brand-shift 8s ease-in-out infinite`
- Brand separator: `sep-pulse 2.5s ease-in-out infinite`
- Heading anchor highlight: `heading-highlight 2s ease-out`
- Collapse icon rotation: `transform 0.2s`
- Scroll to top hover: `translateY(-2px)`

## Custom Properties Pattern
Use `color-mix(in srgb, var(--accent) X%, var(--surface))` for:
- Tinted backgrounds (X=3-10%)
- Tinted borders (X=14-30%)
- Hover states (X=8-12%)
- Active states (X=100%)

## Export HTML
- Strips `.block-header`, `.scroll-to-top`, `.collapse-icon` from clone
- Unwraps `.mermaid-wrap` (hoists `.mermaid` div, removes outer wrap)
- No UI controls in export (no copy buttons, reload buttons, collapse icons)
- Inline `<style>` with theme-appropriate color values
- Same alert, table, code block CSS as preview
- `max-width: 800px` centered content
