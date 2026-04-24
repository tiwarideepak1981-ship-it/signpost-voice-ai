# Design Brief

## Direction
Cybernetic Precision — professional dark tech B2B SaaS dashboard for GenAI Voice Automation, optimized for dense data exploration and real-time metrics.

## Tone
Brutalist restraint with tech-forward accents: zero decoration, high-contrast legibility, function over form. Electric cyan for AI-forward identity, amber for hot alerts.

## Differentiation
Compact metric-driven layout with teal-accented card borders, monochromatic sidebar, and status-color-coded data rows. Signpost India branding through consistent dark tech aesthetic.

## Color Palette

| Token            | OKLCH              | Role                               |
|------------------|--------------------|-------------------------------------|
| background       | 0.12 0.01 260      | Near-black canvas for dense data    |
| foreground       | 0.93 0.01 260      | Light text for contrast             |
| card             | 0.165 0.015 260    | Data table & modal surfaces         |
| primary          | 0.72 0.2 190       | Electric cyan, AI/voice automation  |
| accent           | 0.68 0.18 65       | Amber/orange for hot leads, alerts  |
| destructive      | 0.62 0.2 25        | Red for failed calls, errors        |
| chart-1          | 0.72 0.2 190       | Cyan for primary metrics            |
| chart-2          | 0.65 0.2 150       | Green for success/completion        |
| chart-3          | 0.60 0.18 85       | Amber for pending/warm              |
| chart-4          | 0.68 0.18 65       | Orange for outbound/activity        |
| chart-5          | 0.55 0.16 25       | Red for missed/failed               |

## Typography
- Display: Space Grotesk — bold, geometric, tech-forward headings & section labels
- Body: DM Sans — dense, highly legible, compact tables & UI copy (text-xs/text-sm)
- Mono: Geist Mono — call IDs, phone numbers, metrics (font-mono)
- Scale: h1 `text-2xl font-bold tracking-tight`, h2 `text-lg font-semibold`, labels `text-xs uppercase tracking-widest`, body `text-sm`, table `text-xs`

## Elevation & Depth
Minimal shadows; depth via luminance layering: background (L 0.12) → card (L 0.165) → popover (L 0.2). No blur or glow effects. Borders (primary 0.72 L) on data zones for emphasis.

## Structural Zones

| Zone          | Background             | Border                | Notes                                           |
|---------------|------------------------|-----------------------|-------------------------------------------------|
| Header        | background + border-b  | primary/40            | Minimal, light label + breadcrumb               |
| Sidebar Nav   | sidebar (L 0.15)       | sidebar-border        | Compact, teal active states, no rounded radii   |
| Content Area  | background             | —                     | Dense tables, alternating row colors (card/bg)  |
| Data Cards    | card (L 0.165)         | primary/30 left       | 2px left teal accent, tight padding 0.5rem     |
| Footer/CTA    | muted/40               | border                | Utility zone, right-aligned actions             |

## Spacing & Rhythm
Tight: gap-1 (4px) within rows, gap-2 (8px) between sections, p-2 (8px) card padding. Alternating row backgrounds every other row in tables (card/background). Section stacks use gap-3 (12px) for breathing room. No decorative margin.

## Component Patterns
- Buttons: bg-primary, hover:bg-primary/80, text-primary-foreground, compact px-2 py-1, rounded-sm
- Cards: bg-card, border-l-2 border-primary, rounded-md, p-2, tight spacing within
- Badges: status-success (green), status-warning (amber), status-error (red), status-info (cyan), compact px-2 py-1
- Tables: thead bg-card text-xs font-semibold, tbody alternating bg-card/background, text-xs
- Modals: bg-popover, border border-primary/50, max-w-2xl, overlay semi-transparent
- **Contact Import Modal**: dual input tabs (pill-style, active primary blue, inactive muted), drag-drop zone (dashed primary border, card bg), status badges (Hot=red, Warm=amber, Cold=primary blue), duplicate badge (destructive red), left filter sidebar (compact, 12rem width, max-h-96 scrollable), preview table (text-xs, alternating rows), confirm/cancel buttons (primary/muted)

## Motion
- Entrance: fade-in 200ms on page load, staggered card delays (50ms increment)
- Hover: bg color shift 150ms, subtle 2px lift (transform -translate-y-0.5)
- Decorative: none; pure function (no bounces, no bloat)

## Constraints
- No gradients, no decorative images, no animations beyond hover/focus states
- Max border-radius: 0.5rem; no rounded pills for icons
- Typography strict: only Space Grotesk (display), DM Sans (body), Geist Mono (mono)
- Status colors immutable: green/amber/red/cyan for semantic meaning only
- Data table density prioritized over whitespace; row height ≤ 2rem

## Signature Detail
Teal left border accent (border-l-2 border-primary) on data cards and active navigation items—a subtle but consistent marker of AI/tech innovation, honoring Signpost India's GenAI positioning.
