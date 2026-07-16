# Design system

Dark analytics UI for Profit Action — emerald accent on deep surfaces.

## Tokens

| Source | Role |
|--------|------|
| `frontend/src/design/tokens.css` | CSS SoT (`--pa-*` RGB channels, radii, shadows, light theme) |
| `frontend/src/design/mantine-theme.ts` | Mantine `paGreen` + component defaults |
| `frontend/src/design/chart-theme.ts` | Recharts hex/`rgb()` — **keep in sync** with `--pa-stop/rescue/scale/neutral` and greens |
| `frontend/src/design/surface.ts` | `paSurfaceStyle({ accent? })` shared card borders/backgrounds |

Primary accent: `--pa-green-primary` (emerald on dark surfaces).

### Segment color map

| Segment | Mantine (`segmentMeta`) | Chart (`SEGMENT_CHART_COLOR`) |
|---------|-------------------------|-------------------------------|
| `stop_spending` | `red` | `#f87171` (`--pa-stop`) |
| `rescue` | `yellow` | `#fbbf24` (`--pa-rescue`) |
| `scale` | `paGreen` | `#21f18b` (`--pa-scale`) |
| `neutral` | `gray` | `#94a3b8` (`--pa-neutral`) |

**Rule:** do not put raw brand/segment hex literals in `components/**` — use tokens, `paSurfaceStyle`, or `chart-theme`.

## Layout

Copilot workspace: header, chat (transcript + composer), analysis modal (KPIs + scatter). Catalog at `/products`. Page sections use `PageSection` for spacing and borders.

## Components

Mantine 7 + Recharts scatter. Brand mark: `frontend/public/assets/pa-mark.png` (and `pa-mark.svg`) via `BrandMark`.

Storybook (co-located `*.stories.tsx`):

```bash
cd frontend && npm run storybook
```

Gallery titles use the `Copilot/...` prefix (chart, insights, ui).
