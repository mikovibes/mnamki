# Manamki – Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** February 22, 2026  

## 1. Product Overview

**Name:** Manamki  
**Tagline:** “Our healthy recipes, made smarter together.”  

Manamki is a **private, beautiful, AI-powered shared recipe app** built exclusively for you and your girlfriend. It replaces scattered notes, screenshots, and “what should we cook?” texts with one delightful place.

- Paste any recipe (text, photo, voice) → AI instantly structures it, tags it, scores healthiness, and suggests healthy swaps.  
- One fridge QR code → instant access on any phone (PWA that feels 100 % native).  
- Shared pantry → “Ready to cook” recipes + one-tap shopping list.  
- “Made it!” with voice notes, photos, and comments that build your personal story together.  

**Core philosophy**  
- Minimalist, Apple-level polish (clean, calm, joyful).  
- Health-first by default, but never restrictive.  
- Zero friction for daily use.  
- 100 % private – only the two of you forever.

---

## 2. Vision & Success Goals

**Vision**  
Become the single source of truth and joy for every meal we cook together for the next 10+ years.

**Measurable Goals (MVP launch)**
- Both of us use it at least 4 times per week.
- 80 % of new recipes added via AI Magic Add (not manual).
- Average session < 45 seconds to find a recipe we can cook tonight.
- Net Promoter Score (informal) ≥ 9/10 after 2 weeks.

---

## 3. User Personas

**Primary Users (only two)**
- You: the one who loves discovering new recipes.
- Girlfriend: the one who values healthy, quick, and beautiful food.

**Shared Context**
- Busy couple who want to cook together 4–6 nights/week.
- Strong preference for healthy meals (high veg/protein, minimal ultra-processed).
- Love commenting, rating, and keeping memories (“Remember when we made this on our anniversary?”).

---

## 4. Functional Requirements

### 4.1 Onboarding & Access
- Fridge QR code points directly to `/` (home).
- PWA install prompt on first visit (big, beautiful banner).
- Single shared Supabase magic-link login (one Gmail, one password).
- Inside app: top-right toggle **“Cooking as → You / Her”** (persisted locally, shown on every recipe/comment).

### 4.2 AI Magic Add (core killer feature)
- Input methods: paste text, upload photo of recipe, voice dictation.
- GPT-4o (structured JSON output) extracts:
  - Title, servings, prep/cook time, ingredients (qty + unit + name), steps (numbered), tags.
  - Auto health score (1–10) + healthy substitution suggestions.
  - Categories: Fast (<30 min), Cheap, Healthy (default), Complex, Sweet, Savory, Cuisine, Dietary.
- Optional: DALL·E 3 “Generate beautiful photo” button.
- Always editable after AI processing.

### 4.3 Recipe Detail View
- Large hero image (uploaded or generated).
- Creator badge + “Cooking as” indicator.
- Color-coded tags (pill style).
- Ingredients list with tappable checkboxes (saved per user session).
- Numbered steps with “Cooking Mode” (full-screen, giant text, timers).
- Nutrition summary (AI-estimated).
- Action bar: Heart, Save to Collection, “Made it!”, Comment, Share (internal).

### 4.4 “Made it!” Feature
- Button opens modal:
  - Star rating (1–5).
  - Camera/gallery photo upload (multiple).
  - **Voice dictation button** (browser mic + OpenAI Whisper fallback) → “Tell me how it went and what you changed”.
  - Private note field.
- All “Made it!” entries appear as gallery on recipe page (chronological).

### 4.5 Pantry & Shopping (your favourite)
- Shared pantry page: quick-add ingredients (with optional expiry).
- Home screen section **“Ready to cook”**:
  - Green: 100 % ingredients in pantry.
  - Yellow: ≥80 %.
- Select any recipes → **“Generate Shopping List”**:
  - Quantities summed.
  - Grouped by aisle (Produce / Dairy / Pantry / Meat).
  - Copy to clipboard or export as text.
- Pantry syncs realtime between both phones.

### 4.6 Discovery & Organization
- Home feed tabs: Ready to Cook | Our Favourites | New This Week | All Recipes.
- Powerful filters + multi-select:
  - Healthy (default on), Fast, Cheap, Sweet, Complex.
  - AI tags.
- Search across title, ingredients, comments, and “Made it!” notes.
- Collections: personal saved lists (“Date Night”, “Quick Lunches”, etc.).

### 4.7 Interactions & Social (just us two)
- Comments with @mentions.
- Heart (like) + total count.
- Realtime sync (thanks to Supabase).

### 4.8 Cooking Mode
- Full-screen, distraction-free.
- Giant checkboxes.
- Swipe between steps.
- Built-in timers (5/10/15/30 min presets + custom).

---

## 5. Non-Functional Requirements

**Design System (Apple-inspired minimalism)**
- Font: system-ui + Inter.
- Background: #FAF7F2 (warm off-white).
- Cards: pure white with soft pearl shadow.
- Accents: #E8B4BC (pearl pink), #A3C9A8 (sage green), #B5D8E8 (pearl blue).
- Dark mode: auto + manual toggle.
- All touch targets ≥ 48 px.
- Micro-animations (scale 0.97 on press).
- Whitespace-heavy, rounded 16 px corners.

**Performance**
- PWA: offline recipe viewing, < 2 s first paint.
- All AI calls < 6 s.

**Privacy & Security**
- Row Level Security: only the two of us.
- No analytics, no tracking.
- Photos stored in Supabase (1 GB free is plenty).

**Accessibility**
- WCAG AA.
- VoiceOver / TalkBack friendly.
- High contrast.

---

## 6. Technical Architecture

**Stack (chosen for perfect agentic development)**
- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Lucide icons.
- Backend / DB / Auth / Storage / Realtime: Supabase (Postgres).
- AI: OpenAI (GPT-4o structured outputs + DALL·E 3 + Whisper).
- Hosting: Vercel.
- PWA: next-pwa or built-in manifest.

**Database Schema (high-level)**
- `profiles` (2 rows: “You”, “Her”)
- `recipes` (title, ingredients jsonb[], steps jsonb[], image_url, ai_tags jsonb, health_score, etc.)
- `pantry_items`
- `cooked_entries` (recipe_id, profile_id, photos, voice_transcript, rating, notes)
- `comments`
- `collections`
- `shopping_list_items` (temporary)

---

## 7. User Flows (main ones)

1. **Add new recipe** → Home → + → Paste / Photo / Voice → AI processes → Review & save.
2. **Tonight’s dinner** → Open QR → “Ready to cook” → Tap recipe → Cooking mode.
3. **We made it!** → After dinner → “Made it!” → Voice + photos → Done.
4. **Shopping** → Select 3 recipes → Generate list → Copy to phone notes.

---

## 8. Development Roadmap (Agentic)

**Phase 0 – Setup (1 day)**
- Supabase project + auth + design system.

**Phase 1 – Core Recipes + AI (4 days)**
- CRUD + Magic Add + image + health swaps.

**Phase 2 – Pantry & Shopping (3 days)**

**Phase 3 – Made it! + Voice + Comments (3 days)**

**Phase 4 – Polish, Filters, PWA, QR (3 days)**

**Phase 5 – Test together + final tweaks**

Total: 10–18 evenings max.

---

## 9. Risks & Mitigations

- AI cost: capped at ~$5/month (cache aggressively).
- AI accuracy: always editable + “Regenerate” button.
- Voice quality: browser mic first, Whisper fallback.
- Scope creep: this PRD is locked until both of us say “add X”.

---

## 10. Appendix

**Exact Color Palette**
- Bg: #FAF7F2
- Primary: #E8B4BC
- Healthy: #A3C9A8
- Accent: #B5D8E8
- Text: #1F252A

**OpenAI Prompt Rules (to be used in every phase)**
- Always healthy-first.
- Output strict JSON.
- Suggest swaps with explanation.

---