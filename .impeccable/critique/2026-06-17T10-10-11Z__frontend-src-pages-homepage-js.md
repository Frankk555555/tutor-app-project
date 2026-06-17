---
target: frontend/src/pages/HomePage.js
total_score: 30
p0_count: 0
p1_count: 1
timestamp: 2026-06-17T10-10-11Z
slug: frontend-src-pages-homepage-js
---
# Critique: frontend/src/pages/HomePage.js

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dynamic tutor fetching displays `<Spinner />`, but active navigation states are basic. |
| 2 | Match System / Real World | 4 | Clear and natural Thai copy appropriate for the local student/tutor target audience. |
| 3 | User Control and Freedom | 3 | Simple linear navigation structure; clear paths forward and back. |
| 4 | Consistency and Standards | 3 | Consistent typeface and spacing, but step card icons (using emojis) feel unpolished. |
| 5 | Error Prevention | 4 | Clean, static landing page with zero complex interactive fields that could trigger errors. |
| 6 | Recognition Rather Than Recall | 3 | Key sections and featured tutors are visible on screen immediately. |
| 7 | Flexibility and Efficiency | 2 | Static layout requires navigating to `/search` to find subjects, pricing, or tutors. |
| 8 | Aesthetic and Minimalist Design | 2 | Generic template layout; use of raw emojis as step card icons cheapens visual credibility. |
| 9 | Error Recovery | 4 | N/A (no interactive forms or destructive actions present). |
| 10 | Help and Documentation | 2 | No visible help links, FAQs, or contact support guides on the home page. |
| **Total** | | **30/40** | **Good** |

## Anti-Patterns Verdict

**LLM Assessment**: The visual layout is highly template-driven (Hero -> Featured Tutors -> 3-Step Guide). The use of system emojis (`🔍`, `📅`, `🎓`) as main icons makes the interface look like a generic starter template or low-effort AI draft rather than a professional educational platform. There's a missed opportunity to build credibility on the first screen.

**Deterministic Scan**: The automated visual slop detector completed with `0` findings.

**Visual Overlays**: Skips browser visualization as the user declined/canceled the browser subagent in this session.

## Overall Impression
The home page has a clean foundation and correctly establishes the layout for a React-based tutor finder. However, it relies on generic templates and unpolished emojis that undermine visual trust. The biggest opportunity is enhancing credentials and adding direct discovery on the first screen.

## What's Working
1. **Dynamic Featured Tutors**: Fetching and showing tutor recommendations directly on the home page shows active platform life.
2. **Clear Content Chunking**: The page is split cleanly into Hero, Tutors, and Steps, reducing visual noise.

## Priority Issues
1. **[P1] Hidden Star Ratings & Verification Badges on Tutor Cards**:
   - *Why it matters*: Parents and students make search decisions based on credibility and trust. By missing stars or qualification indicators on the featured cards, users must click through each profile individually to assess quality.
   - *Fix*: Update the `TutorCard` component to show rating stars and "Verified" credentials.
   - *Suggested command*: `node .agents/skills/impeccable/scripts/polish.mjs frontend/src/components/TutorCard.js`
2. **[P2] Cheap Emoji Icons for Steps**:
   - *Why it matters*: Emojis cheapen visual authority and look amateurish.
   - *Fix*: Replace `🔍`, `📅`, `🎓` with clean, vector-based SVG icons styled in the core "Beacon Blue" palette.
   - *Suggested command*: `node .agents/skills/impeccable/scripts/typeset.mjs frontend/src/pages/HomePage.js`
3. **[P2] No Direct Search or Filter on Landing**:
   - *Why it matters*: Forcing returning users to click a CTA to load a separate page to start searching adds unnecessary friction.
   - *Fix*: Embed a simplified subject or quick-search bar directly in the Hero Section.
   - *Suggested command*: `node .agents/skills/impeccable/scripts/layout.mjs frontend/src/pages/HomePage.js`

## Persona Red Flags

**Jordan (First-Timer)**: The home page is welcoming, but doesn't show subjects (e.g. English, Math). Jordan doesn't know if the platform teaches what they need without clicking the search button first.

**Riley (Stress Tester)**: What happens if `api.getFeaturedTutors()` fails or returns an empty list? The code shows a fallback error message in the console but doesn't handle the empty state in the UI, potentially rendering a blank featured section.

**Pim (Anxious Parent - Project Specific)**: Pim wants a trusted tutor for their child. The lack of visible ratings, credentials, or tutor qualifications on the landing cards fails to build immediate confidence, leading to bounce risk.

## Minor Observations
- The hero background image uses an unsplash URL; a real target platform would benefit from custom high-quality local assets.
- No direct link to the tutor registration flow on the landing page for visiting educators.

## Questions to Consider
- What if we let users search for subjects directly in the Hero section?
- Can we show tutor ratings directly on the featured cards?
- What would a more professional set of icons look like instead of emojis?
