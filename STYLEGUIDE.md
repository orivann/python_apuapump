# AquaPump UI Style Guide

This document captures the design system that drives the refreshed AquaPump interface.

## Brand Foundations
- **Type**: Manrope (400–800). Use 700+ for primary calls to action, 600 for nav items, and 400–500 for body copy.
- **Color System**
  - Primary: `#2563EB`
  - Primary Dark: `#1D4ED8`
  - Secondary Accent: `#22D3EE`
  - Neutral Ink: `#0F172A` (light) / `#E2E8F0` (dark)
  - Background: `#F5F8FF` (light) / `#0B1120` (dark)
  - Surfaces: `#FFFFFF` (light) / `#111827` (dark)
  - Border: `rgba(15, 23, 42, 0.08)` (light) / `rgba(148, 163, 184, 0.14)` (dark)
- **Spacing Scale**: `4px` base. Utilities exposed as CSS custom properties (`--space-xs` through `--space-2xl`).
- **Radii**: Large containers use `32px`, cards `20px`, controls `12px`, circular elements 50%.
- **Shadows**: Soft glow for hero CTA, elevated shadow for cards, heavier shadow for floating chat.

## Components
- **Navigation**: Sticky translucent bar with blur. Mobile uses slide-down sheet toggled via hamburger button. Language and theme toggles sit beside the CTA pill button.
- **Buttons**:
  - `.btn--primary`: gradient fill, white text, elevation on hover.
  - `.btn--outline`: 2px border using primary gradient mix, fills softly on hover.
  - `.btn--ghost`: subtle surface fill for secondary actions.
  - `.btn--pill`: rounded CTA used in the nav.
- **Chips**: Rounded labels for hero eyebrow and nav toggles. Accent chip uses soft white fill with blue text.
- **Cards**: `.feature` components for expertise and product listings. `.stat` for key metrics. Both share radius, border, and hover elevation.
- **Forms**: `.form` container with `.form__field` wrappers. Invalid states show red borders and helper copy. Focus uses brand-colored outline rings.
- **Chatbot**: Floating button toggles `.chatbot__window`. Messages use `.message--bot` and `.message--user` variants with timestamp metadata.

## Layout
- Containers center content at `1100px` max width with generous whitespace.
- Hero uses a 12-column grid that stacks on mobile. Media panel with glow complements hero copy.
- Sections rely on vertical spacing from the scale and use `.section__inner--split` for two-column layouts at ≥768px.
- Footer mirrors the nav blur with border and flex alignment.

## Interactivity
- Hover states lift cards and buttons by translating `-2px` to `-4px`.
- Focus states add outlines or border emphasis for keyboard users.
- Chatbot auto-responds with acknowledgement, contact form success opens the chat for continuity.
- Theme toggle switches between light and dark variable sets stored in `localStorage`.
- Language toggle swaps between English and Hebrew, updating nav labels, hero copy, and structured content.

## Accessibility
- Navigation, chat toggle, and close button expose `aria` attributes.
- Color pairs meet WCAG AA contrast in both themes.
- Typography sizes use `clamp()` for responsive scaling without media query overrides.

Adhere to this system when introducing new UI so components remain consistent and production-ready.
