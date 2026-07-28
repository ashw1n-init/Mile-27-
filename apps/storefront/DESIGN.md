---
version: 1.0
name: Mile27 Spatial Commerce
description: A performance-led retail system built from atmospheric depth, tonal surfaces, and precise red signals instead of visible grids.
colors:
  canvas: "#F4F3F1"
  canvas-cool: "#ECEFF0"
  surface: "#FCFCFB"
  surface-muted: "#E8E8E5"
  surface-strong: "#DDE1E2"
  ink: "#171718"
  ink-muted: "#666A6C"
  accent: "#D4030A"
  accent-dark: "#A90006"
  focus: "#D4030A"
typography:
  display: { fontFamily: "var(--font-display)", fontSize: 72px, fontWeight: 600, lineHeight: 0.94, letterSpacing: -0.055em }
  headline-lg: { fontFamily: "var(--font-display)", fontSize: 48px, fontWeight: 600, lineHeight: 1, letterSpacing: -0.04em }
  headline-md: { fontFamily: "var(--font-display)", fontSize: 30px, fontWeight: 600, lineHeight: 1.05, letterSpacing: -0.025em }
  body-lg: { fontFamily: "var(--font-sans)", fontSize: 18px, fontWeight: 400, lineHeight: 1.55 }
  body-md: { fontFamily: "var(--font-sans)", fontSize: 15px, fontWeight: 400, lineHeight: 1.55 }
  label: { fontFamily: "var(--font-sans)", fontSize: 11px, fontWeight: 600, lineHeight: 1.2, letterSpacing: 0.1em }
rounded:
  control: 999px
  card: 18px
  island: 32px
  hero: 40px
spacing:
  xs: 6px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 56px
  section: 96px
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: 14px
  button-secondary:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: 14px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: 14px
  island:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.island}"
    padding: 32px
---

# Mile27 Spatial Commerce

## Overview

The storefront should feel engineered, calm, and materially light. Product photography remains the hero; the interface supports it with mist-like spatial gradients and floating tonal islands. The visual language is premium and performance-led, never playful or decorative.

Design dials: variance 7, motion 6, density 4. Motion communicates navigation, product state, and spatial continuity. It never obstructs purchasing.

## Colors

- **Canvas** is a cool mineral off-white, not warm craft beige.
- **Surface** is a near-white photographic plane.
- **Muted surfaces** create hierarchy without outlines.
- **Ink** is an optical near-black.
- **Mile27 red** is the only accent and is reserved for active state, focus, and decisive cues.
- Gradients blend canvas, cool mist, and subtle neutral light. They must not use purple, blue neon, or decorative rainbow color.

## Typography

Use the existing brand display and sans families. Large type is tight and decisive; body copy is compact but breathable. Small labels may use tracked uppercase only for functional metadata, not as decoration or section numbering.

## Layout

The responsive CSS grid remains an invisible alignment tool. Users should not see grid lines, repeated ruled rows, or boxed page divisions. Major content groups float as asymmetrical tonal islands with generous negative space and occasional controlled overlap.

Desktop content is constrained to 1920px. Mobile spacing starts at 16px. Major sections use 64–112px vertical rhythm depending on content density.

## Elevation & Depth

Depth is communicated with tinted ambient shadows, surface contrast, blur, and controlled gradient light. Shadows use cool neutral hues, never pure black. Product imagery receives no artificial drop shadow.

## Shapes

Major islands use 28–40px radii. Product cards use 16–22px radii. Interactive controls are pill-shaped. This distinction is intentional: islands contain, cards group, pills act.

## Components

- **Header:** a floating translucent navigation capsule with a clear active state; no vertical separators.
- **Product cards:** image-led tonal planes without outlines. Hover uses a slight lift and image scale.
- **Filters and selectors:** filled neutral controls with clear selected states, not outlined pills.
- **Forms:** tonal fields with inset depth and a high-contrast red focus ring.
- **Sections:** use whitespace by default; use an island only when it communicates a meaningful content group.
- **Footer:** a quiet tonal landing surface without a top rule.

## Do's and Don'ts

- Do use spacing, scale, surface tone, and shadow to establish hierarchy.
- Do preserve visible keyboard focus and WCAG AA text contrast.
- Do keep product photography clean and shadow-free.
- Don't add visible grid textures, divider forests, bordered rows, or table-like page framing.
- Don't apply glass effects to every surface; reserve translucency for navigation and overlays.
- Don't introduce another accent color.
- Don't trade commerce clarity for animation.
