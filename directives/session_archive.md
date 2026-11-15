# CitizenScore.ie — Master Session Archive & Architectural Checkpoint
**Timestamp:** 2026-11-09T01:24:00Z  
**Project Workspace:** `c:\Users\mucho\.gemini\antigravity-ide\scratch\ISD_Scoreboard`  
**Conversation ID:** `961aaead-cc4e-4c7f-9bc3-9431ec3483bc`  
**Parent Conversation:** `be9d2192-82d8-4b5b-a868-d717527819ad`  
**Studio Signature:** Onyx & Code (`onyxandcode.com`)  

---

## 1. Product Summary & Legal Foundation
CitizenScore.ie is an immigration tech platform designed for foreign nationals applying for **Irish Citizenship by Naturalisation (Form 8)** via the Department of Justice / Immigration Service Delivery (ISD).

Every calculation, scoring rule, and document classification is calibrated against official Irish immigration directives (`irishimmigration.ie`):
1. **Identity Requirement:** Valid in-date passport = **150 points** (proven once).
2. **Residency Requirement:** Exactly **1 Type A (100 pts) + 1 Type B (50 pts) = 150 pts per year** for each reckonable year. No fictional point schemes.
3. **Reckonable Permissions:** Stamps 1, 1G, 4, 3, 5, 6 are reckonable. Stamp 2 / 2A (Student) is non-reckonable for naturalisation.
4. **Section 15C Absence Guardrails:**
   - **0–70 days absent:** Standard allowance (no explanation required).
   - **71–100 days absent:** Exceptional circumstances (health, business abroad, family emergency).
   - **>100 days absent:** Statutory hard cap warning.
5. **Statutory Windows:**
   - General Pathway: 5 reckonable years (1,825 days) within the past 9 years.
   - Spousal Pathway: 3 reckonable years (1,095 days) within the past 5 years.
   - Final Continuous Year: Continuous residence immediately preceding the application date.

---

## 2. Civic Design System & The Irish Tricolour (Bratach na hÉireann)
Per explicit user decisions, the civic branding honors the national colors of Ireland:

- **Emerald Green (🟢):** `#00875A` (light) / `#10B981` (dark). Used for primary actions, reckonable stamps, and compliance indicators.
- **Irish White / Silver (⚪):** `#FFFFFF` / `#F8FAFC`. Used for secondary actions, neutral cards, and clean typography.
- **Irish Flag Orange (🟠):** `#FF883E`. Used for the third action button, official ISD citation badges, and warning/missing document indicators.

### Systematic Tricolour Implementations:
1. **Hero Action Buttons:**
   - Button 1 (Green 🟢): `[Calculate Reckonable Days (100% Free) →]`
   - Button 2 (White ⚪): `[Watch 60-Sec Demo]` (opens interactive narrated video)
   - Button 3 (Orange 🟠): `[Open 150-Point Vault]`
2. **Top Trust Badges:**
   - Left (Green 🟢): `[Designed for Irish Naturalisation Applicants]`
   - Right (Orange 🟠): `[OFFICIAL ISD • Calibrated to ISD Form 8 Directives ↗]` (via `IsdCitation variant="orange"`, default across all pages).
3. **Higgsfield-Style Ambient Spotlight & Border Glow Shadows:**
   - **Column 1 / Card 1:** Emerald Green top border (`border-t-emerald-500`) + ambient green spotlight & shadow (`shadow-[0_-12px_28px_-4px_rgba(16,185,129,0.24)]`).
   - **Column 2 / Card 2:** White/Silver top border (`border-t-slate-300 dark:border-t-white/80`) + ambient silver spotlight & shadow (`shadow-[0_-12px_28px_-4px_rgba(148,163,184,0.35)]`).
   - **Column 3 / Card 3:** Irish Orange top border (`border-t-[#FF883E]`) + ambient orange spotlight & shadow (`shadow-[0_-12px_28px_-4px_rgba(255,136,62,0.28)]`).
   - Active on:
     - The 3 Problem Comparison Cards on Homepage.
     - The 3 Mini Dashboard Preview Cards on Homepage.
     - The 6 Bento Grid Cards in the 150-Point Vault (`ScorecardBento.tsx`).

---

## 3. Interactive Video Walkthrough & Voiceover Engine
- **Component:** `src/components/DemoVideoPlayer.tsx`
- **Audio File:** `public/audio/citizenscore_voiceover.mp3` (Take 2, 961 KB / 60.0s).
- **Voice Actor:** ElevenLabs **"Seán — Warm Irish Commercial Narrator"** (`pvc_s70_sim79_v4`).
- **Features:**
  - 16:9 cinematic video player with clickable scrubber, 0:00 to 1:00 timeline, chapter skips (Scene 1: Days, Scene 2: Scorecard, Scene 3: Watermarking).
  - Live animated UI simulation synchronized to Seán's voiceover narration.
  - Active voiceover microphone badge with live jumping soundbars.
  - Sound/Mute toggle, replay button, and full-screen support.
  - Dual-mode switch to official Department of Justice / ISD Video Guide stream.
  - Complete Light Mode and Dark Mode support with real-time theme transition at 60fps.

---

## 4. Key Component Architecture
| Component | Path | Purpose |
| :--- | :--- | :--- |
| `Navbar.tsx` | `src/components/Navbar.tsx` | Frosted header, tab routing, theme toggle switch |
| `HomeLanding.tsx` | `src/components/HomeLanding.tsx` | High-converting hero, tricolour buttons/cards, demo launcher |
| `DemoVideoPlayer.tsx` | `src/components/DemoVideoPlayer.tsx` | 16:9 media player with synced ElevenLabs voiceover |
| `DaysCalculator.tsx` | `src/components/DaysCalculator.tsx` | Official ISD-style calendar `From`/`To` inputs, Section 15C rules |
| `ScorecardBento.tsx` | `src/components/ScorecardBento.tsx` | 6-card Bento grid with radial gauges and Irish spotlight borders |
| `WatermarkEngine.tsx` | `src/components/WatermarkEngine.tsx` | 100% in-browser PDF stamping engine (`pdf-lib`) |
| `RequirementsHub.tsx` | `src/components/RequirementsHub.tsx` | Official point schedule table with fixed `h-16` non-wrapping rows |
| `PricingSection.tsx` | `src/components/PricingSection.tsx` | €0 Free vs €5/mo Pro subscription tiers |
| `IsdCitation.tsx` | `src/components/IsdCitation.tsx` | Unified `h-7 rounded-full` citation chip defaulting to Irish Orange |
| `OnyxBadge.tsx` | `src/components/OnyxBadge.tsx` | Onyx & Code studio signature in bottom-right footer |

---

## 5. Annealing Rules & Quality Guardrails (from `directives/annealing_log.md`)
1. **Tailwind v4 Configuration:** Always configure variants in CSS (`@custom-variant dark (&:where(.dark, .dark *));`), never in `tailwind.config.js`.
2. **First-Paint Flash Prevention:** Inline `<script>` in `<head>` applies `.dark` before first paint.
3. **Pill & Badge Alignment:** Paired badges must share identical height (`h-7`), corner radius (`rounded-full`), and `whitespace-nowrap`.
4. **Table Row Heights:** Schedule tables must use explicit column min-widths and fixed row heights (`h-16`) to prevent text wraps stretching rows.
5. **Calendar Input Requirement:** Immigration calculations must use calendar `From`/`To` date ranges, not manual day numbers.
6. **No Fake Demo Dialogs:** If a button promises "Watch Demo Video", never show static text cards; deliver an interactive player with audio.
7. **Symmetrical Theming:** Modals and embedded video players must support Light and Dark modes symmetrically.
8. **Civic Symbolism:** Use domain-appropriate trust colors (Irish Tricolour: Green, White, Orange) to reinforce public-sector authenticity.

---

## 6. How to Resume Work in Future Sessions
- **Run dev server:** `npm run dev -- --port 3000`
- **Build check:** `npm run build`
- All files are committed and persisted directly inside the workspace repository.

