@AGENTS.md

# WAF AI Recruiter

Demo aplikacja dla HR — AI przeszukuje internet i znajduje kandydatów na podane stanowisko.
Deployed on Vercel. Includes a Remotion video subproject for LinkedIn promotion.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **AI SDK v6** z `@ai-sdk/anthropic` (direct provider, NOT AI Gateway)
- **Claude Sonnet 4.6** — model do wyszukiwania kandydatów
- **Serper API** — web search tool
- **Tailwind CSS v4** + shadcn/ui (base-nova style)
- **Remotion v4** — subprojekt do generowania wideo LinkedIn (1080x1350, 30fps)

## Env vars (.env.local)

| Zmienna | Opis |
|---|---|
| `SERPER_API_KEY` | Klucz API do Serper.dev (Google search) |
| `MAX_SEARCHES_PER_DAY` | Limit wyszukiwań dziennie (default: 3) |
| `GOOGLE_SHEETS_WEBHOOK_URL` | URL webhooka Google Apps Script do zapisu wyników |

## Kluczowe pliki

### App Router
- `app/page.tsx` — strona główna z formularzem
- `app/wyniki/page.tsx` — strona wyników (streaming AI)
- `app/api/chat/route.ts` — endpoint AI (Claude + Serper tools, max 8 steps, maxRetries: 5)
- `app/api/save-results/route.ts` — proxy do Google Sheets webhook

### Komponenty
- `components/search-form.tsx` — formularz (imię, email, job desc, branża, seniority, LinkedIn ref)
- `components/wyniki-content.tsx` — strona wyników, parsuje `===KANDYDAT===` bloki, zapisuje do Sheets
- `components/search-results.tsx` — renderuje karty kandydatów (top 5 widoczne, reszta blurred)
- `components/blurred-candidates.tsx` — CTA "Chcesz pełną listę?" → Calendly link
- `components/candidate-card.tsx` — karta kandydata z tier badge (TOP/STRONG/GOOD)
- `components/search-progress.tsx` — postęp wyszukiwania (ostatnie 4 queries)

### Biblioteki
- `lib/prompts.ts` — system prompt (PL) instruujący Claude jak szukać kandydatów
- `lib/tools.ts` — webSearch tool (Serper API, gl:pl, top 8 wyników)
- `lib/types.ts` — SearchFormData, Candidate interfaces
- `lib/rate-limit.ts` — client-side rate limit (cookie `waf_rc`, disabled in API)

### Integracja Google Sheets
- `docs/google-apps-script.js` — Apps Script deployed jako webhook
- Zapisuje: datę, dane użytkownika, wszystkich kandydatów (JSON + czytelny format)
- Zapis triggerowany client-side w `wyniki-content.tsx` gdy `isComplete=true` i `candidates.length > 0`

## Data flow

```
User → SearchForm (localStorage) → /wyniki?params
  → useChat → POST /api/chat
    → Claude streamText + webSearch tool (Serper) × max 8 steps
    → streaming ===KANDYDAT=== blocks
  → SearchResults parses blocks → top 5 visible, rest blurred
  → On complete: POST /api/save-results → Google Sheets webhook
```

## Parser kandydatów

Bloki `===KANDYDAT===` z polami: Imię i nazwisko, Obecne stanowisko, Firma, Poprzednie firmy, LinkedIn, Dopasowanie, Tier.

Parser jest tolerancyjny — obsługuje markdown bold (`**===KANDYDAT===**`, `**Imię:**`), dashes, różne warianty formatowania. Regex: `/\*{0,2}={2,}KANDYDAT={2,}\*{0,2}/`

## Znane problemy / TODO

- **Rate limiting wyłączony** w `/api/chat` — włączyć przed publicznym launch
- **Anthropic API Overloaded (529)** — maxRetries: 5, polskie komunikaty błędów
- **Brak bazy danych** — wszystko idzie do Google Sheets

## Deployment

- Vercel, auto-deploy z repozytorium
- Project ID: `prj_fqkpTIqOWYXLkWSUes8rZ1BOrjbm`
- Org ID: `team_pPcoDtqR75Ph7VURQGPOlnwB`

## Remotion Video (subprojekt)

**Lokalizacja:** `remotion-video/` (osobny package.json, osobny npm install)

### Uruchamianie
```bash
cd remotion-video
npx remotion studio          # podgląd w przeglądarce
npx remotion render LinkedInVideo out/video.mp4   # renderowanie MP4
npx remotion still LinkedInVideo --frame=60 --output=out/still.png  # still
```

### Struktura scen (LinkedInVideo.tsx)
7 scen z fade transitions (15 frames = 0.5s):

| Scena | Plik | Czas | Treść |
|---|---|---|---|
| 1 | SceneHook.tsx | 3.5s | "10 kandydatów w 47 sekund" — duża cyfra z glow |
| 2 | SceneProblem.tsx | 4s | Problem: potrzebowałem kandydatów, poprosiłem AI |
| 3 | SceneClaude.tsx | 5s | Typewriter prompt w terminalu |
| 4 | SceneForm.tsx | 4s | Screenshot formularza z animowanym kursorem |
| 5 | SceneSearch.tsx | 5s | Search queries pojawiają się z checkmarks |
| 6 | SceneResults.tsx | 5.5s | Karty kandydatów (4 widoczne + 2 blurred) |
| 7 | SceneCTA.tsx | 6s | "Chcesz wypróbować?" + button + logo WAF |

### Design
- **Fonty:** Inter (sceny 1-6), Roboto (scena 7 CTA), JetBrains Mono (kod w scenie 3)
- **Kolory:** `styles.ts` — bg #0a1214, primary #38bdf8, accent #22d3ee, text #f1f5f9
- **Tło:** Radial gradient z subtelnymi glow
- **Karty:** Glassmorphic z inset highlight i border

### Ładowanie fontów — WAŻNE
`loadFont()` bez argumentów (Remotion v4) — ładuje wszystkie warianty i subsety w tym latin-ext (polskie znaki). NIE używać `loadFont("normal", {weights, subsets})` — to stara sygnatura, powoduje fallback na Times.

### Assets (remotion-video/public/)
- `screenshot-form-filled.png` — screenshot wypełnionego formularza
- `screenshot-landing.png` — screenshot strony głównej
- `waf-logo.png` — logo WeAreFuture

### Output
- `remotion-video/out/linkedin-video.mp4` — finalne MP4 (3.7 MB)
- `remotion-video/out/linkedin-video-light.gif` — zoptymalizowany GIF (4.4 MB, 540px, 15fps)
