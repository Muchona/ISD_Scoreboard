# Design System: ISD Scoreboard & Document Vault (2025/2026 Edition)

## Status
**VERIFIED & APPROVED** (Agent A UI/UX Architecture Gate Passed)

---

## 1. Aesthetic Vision: Modern Bento & Civic Fintech
A hybrid high-trust platform blending **modern Bento Grid modularity** with **Stripe/Linear precision**. Designed to evoke maximum legitimacy, institutional trust, and cryptographic document security for Irish naturalisation applicants.

---

## 2. Color Tokens & Semantic Theme

### Theme A: Civic Ledger (Default Light Mode — Bank-Grade Trust)
- **Canvas / Background**: `#F8FAFC` (Slate 50 — ultra clean, glare-free)
- **Surface / Bento Cards**: `#FFFFFF` (Pure white with 1px border `border-slate-200/80`)
- **Primary / Emerald Accent**: `#00875A` (Irish National Harp Emerald — 150-pt goal completion, primary actions)
- **Primary Hover**: `#006C48`
- **Text Primary (Headings)**: `#0F172A` (Slate 900)
- **Text Secondary (Labels/Body)**: `#475569` (Slate 600)
- **Monospace Numbers**: `#0F172A` (Tabular figures for days and points)

### Theme B: Emerald Terminal (Dark Mode — High-Security Precision)
- **Canvas / Background**: `#090D16` (Deep Obsidian Slate)
- **Surface / Bento Cards**: `#111827` (Charcoal Slate with `border-slate-800` & subtle radial glow)
- **Primary / Neon Emerald**: `#10B981` (Vibrant emerald glow for active meters)
- **Text Primary**: `#F8FAFC`
- **Text Secondary**: `#94A3B8`

### Shared Semantic & Citation Tokens
- **Official Gov Citation Link**: `#2563EB` (Tailwind `blue-600` — authoritative external link to `irishimmigration.ie`)
- **Citation Badge Background**: `#EFF6FF` (Light) / `#1E293B` (Dark)
- **Goal Reached**: `#10B981` (150/150 points achieved)
- **Deficit Alert**: `#F59E0B` (Amber — points needed for year)
- **Critical / Ineligible**: `#EF4444` (Stamp 2 / >70 day absence threshold)

---

## 3. Typography & Hierarchy
- **Font Stack**: 
  - Sans: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Mono: `JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace` (strictly for reckonable days, point counts, dates)
- **Typographic Scale**:
  - `Hero Title`: 40px–48px, Tracking -0.03em, Extrabold
  - `Bento Section Headers`: 20px–22px, Tracking -0.02em, SemiBold
  - `Big Metrics / Counters`: 36px–44px, Monospace, Bold (e.g. `1,825` or `150`)
  - `Body / Descriptions`: 14px–15px, Regular, 150% Line Height
  - `Gov Citation Badges`: 12px–13px, Medium, Monospace/Pill formatting

---

## 4. Bento Grid & Component Architecture
1. **Interactive Bento Grid Dashboard**:
   - Asymmetric 6-card layout: Identity Verification Card + 5 Yearly Reckonable Score Cards (Year 1 to Year 5).
   - Each card contains an SVG radial progress gauge (0 to 150 points), badge indicator, and accepted document chips (Type A, B, C).
2. **Reckonable Days Countdown Engine**:
   - Interactive stamp timeline (Stamp 1, 1G, 4, 3, etc.).
   - Visual 70-day final-year absence gauge.
   - 1,825-day countdown with animated progress bar and milestone celebrations.
3. **Liquid Glass Anti-Theft Watermark Preview**:
   - Live interactive canvas preview showing diagonal semi-transparent security stamps:
     `FOR ISD CITIZENSHIP APPLICATION ONLY — [DATE/HASH]`
4. **Official ISD Deep-Linking Pill**:
   - Universal component `<IsdCitation link="..." title="..." rule="..." />` rendered next to every rule.

---

## 5. 3D & Micro-Interaction Performance Gate (Agent B)
- **Performance Rule**: 60fps mandatory on all interactive animations and canvas components.
- **Micro-interactions**: Hardware-accelerated CSS transforms (`transform`, `opacity`) and zero jank during watermark rendering.
