---
name: Tutor Platform
description: A friendly and highly legible tutoring search and booking platform.
colors:
  primary: "#3498db"
  primary-hover: "#2980b9"
  accent: "#27ae60"
  neutral-ink: "#2c3e50"
  neutral-bg: "#f4f7f6"
  neutral-surface: "#ffffff"
  border: "#cccccc"
typography:
  display:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 500
    lineHeight: 1.2
  headline:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 500
  title:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
  body:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.6
  label:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  full: "50px"
spacing:
  sm: "10px"
  md: "20px"
  lg: "30px"
  xl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.full}"
    padding: "15px 40px"
  button-cta-hover:
    backgroundColor: "{colors.primary-hover}"
  card-tutor:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  card-step:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "30px"
  input-field:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.sm}"
    padding: "10px"
---

# Design System: Tutor Platform

## 1. Overview

**Creative North Star: "The Supportive Academy"**

"The Supportive Academy" visual framework provides a warm, encouraging, and highly legible learning environment for Thai students and tutors. By pairing structured layouts with clear focus cues, the system balances educational trustworthiness with modern accessibility. The visual interface prioritizes spacious interfaces to eliminate the cramped layout common to older tutoring directories, ensuring users feel guided rather than overwhelmed.

Key characteristics:
- **Clean Structure**: Information is organized into distinct, well-padded cards and grids that flow logically.
- **Friendly & Legible Typography**: High-contrast, friendly rounded-geometric font stacks suited for both English and Thai scripts.
- **Micro-Interactions**: Direct user attention through soft, responsive translations and shadow lifts on hover.

## 2. Colors

The color palette uses trust-building blues and encouraging greens, contrasted against a clean, off-white background.

### Primary
- **Beacon Blue** (#3498db): Used for primary actions, buttons, links, CTA highlights, and major focus states. It inspires academic confidence and clear guidance.

### Accent
- **Achievement Green** (#27ae60): Represents success, tutoring rates, positive ratings, and success toast states.

### Neutral
- **Deep Ink** (#2c3e50): Used for primary headings, navigation links, and brand text.
- **Soft Sage-White** (#f4f7f6): The primary background color, providing a soft, low-contrast, and comfortable canvas for reading.
- **White Surface** (#ffffff): Used for card backdrops, form containers, and navigation bars to pop against the off-white background.
- **Muted Gray** (#cccccc): Used for input borders, inactive states, and structural lines.

### Named Rules
**The Rarity Rule.** Beacon Blue is reserved strictly for primary actions, CTAs, and active states. It should occupy no more than 10% of any screen surface to preserve its focus-directing power.

## 3. Typography

**Display Font:** Chakra Petch (with sans-serif fallback)
**Body Font:** Chakra Petch (with sans-serif fallback)

The typography features a geometric, rounded, yet technical appearance that feels friendly and readable in both English and Thai scripts. Generous line height prevents Thai character overlap.

### Hierarchy
- **Display** (500, clamp(2.5rem, 5vw, 4rem), 1.2): Used for primary hero headers to grab attention with high contrast.
- **Headline** (500, 2.5rem, 1.3): Used for major page/section titles.
- **Title** (500, 1.5rem, 1.4): Used for subheadings and card headers.
- **Body** (400, 1rem, 1.6): Used for description texts, list items, and form labels.
- **Label** (500, 0.875rem, 1.4): Used for smaller contextual tags, input placeholders, and button text.

### Named Rules
**The Thai Line Height Rule.** All elements displaying Thai text must enforce a minimum line-height of 1.5 to prevent vertical overlap of vowel accents and sub-characters.

## 4. Elevation

The system uses a hybrid approach: flat by default at rest, lifting tactility through soft drop shadows upon interaction.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)`): Standard depth to distinguish cards from the Soft Sage-White background.
- **Card Hover** (`box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15)`): Applied during hover to indicate interactive feedback, combined with a vertical lift.
- **Input Border** (`border: 1px solid #ccc`): Rest state for inputs, shifting to a solid blue border focus ring.

### Named Rules
**The Responsive Lift Rule.** Any card or button utilizing a hover shadow must simultaneously apply a translation transform (`translateY(-3px)` to `-10px`) to align the visual shadow depth with physical height.

## 5. Components

Components are styled to look tactile, friendly, and structured.

### Buttons
- **Shape:** Softly curved corners (4px radius) for standard buttons, and full-pill (50px radius) for call-to-action buttons.
- **Primary:** Beacon Blue background with white text, using `padding: 12px 24px`.
- **Hero CTA:** Beacon Blue background with white text, using `padding: 15px 40px` and a pill shape.
- **Hover / Focus:** Transitions color to dark blue `#2980b9` over `0.3s ease`, with CTA button performing a `-3px` translation lift.

### Cards / Containers
- **Corner Style:** Rounded corners (8px radius for tutor profile cards, 10px for step cards).
- **Background:** Solid white (`#ffffff`).
- **Shadow Strategy:** Uses standard rest shadow, lifting on hover.
- **Internal Padding:** Generous `20px` to `30px` padding to prevent layout crowding.

### Inputs / Fields
- **Style:** Clean solid border (`1px solid #ccc`) with `4px` border radius and `10px` internal padding.
- **Focus:** Highlighted with a solid blue border (`#3498db`).

### Navigation
- **Style:** Clean white background bar with a subtle bottom shadow. Links use Deep Ink (`#2c3e50`) and shift to Beacon Blue (`#3498db`) on hover.

## 6. Do's and Don'ts

### Do:
- **Do** maintain a minimum line-height of 1.5 on all body paragraphs to accommodate Thai vowels cleanly.
- **Do** use white surfaces (#ffffff) for card containers to stand out cleanly against the Soft Sage-White (#f4f7f6) body background.
- **Do** apply smooth CSS transitions (`0.3s ease`) on all interactive hover and focus events.

### Don't:
- **Don't** use side-stripe borders (e.g. `border-left: 4px solid #3498db`) on cards or alerts to create decoration.
- **Don't** use gradient text on headers. Keep titles solid Deep Ink (#2c3e50).
- **Don't** use giant border-radii (greater than 12px) on rectangular cards or inputs. Cards should max out at 8px to 10px.
- **Don't** allow long words or headings to overflow container boundaries on mobile; use clamp scales and `word-break: break-word` if necessary.
