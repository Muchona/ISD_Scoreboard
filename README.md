# CitizenScore.ie — Irish Citizenship (ISD Form 8) Scorecard & Vault

Client-side Irish naturalisation companion calibrated to **Immigration Service Delivery (ISD) Form 8** guidelines.

## Key Features

- **150-Point Citizenship Scorecard:** Tracks Identity (150 pts) and 5 continuous reckonable years (Type A 100 pts + Type B 50 pts = 150 pts/year) with non-destructive Application Filing Year switching.
- **Smart Document Reader:** In-browser PDF parsing (`pdfjs-dist`) that automatically identifies Revenue EDS, Irish Bank Statements (including Permanent TSB custom font decoding and POS volume checks), DSP/Social Welfare letters (with Type A / Type B dual-use selector), Utility bills, TV Licences, GP/Hospital letters, Peace Commissioner passport certifications, and ISD Form `Citz-009/2026` affidavits.
- **Reckonable Days & Section 15C Absence Calculator:** Calculates 1,827-day qualifying stamp periods with overlap deduplication and tracks the 70-day final-year absence rule.
- **Optional Client-Side PDF Watermarker:** `pdf-lib` diagonal security stamping with user-selectable On/Off toggles across the vault, upload modal, standalone watermarker, and dossier export.
- **Master Form 8 Dossier & Cover Letter Export:** Generates a printable 3-page PDF pack with custom applicant cover letter notes, stamp ledger, and real-time scorecard manifest.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```
