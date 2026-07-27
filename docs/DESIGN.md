---
version: 1.0.0
name: Mile27 Gradient Operations
description: Light gradient operating system with a floating pill navigation shell.
colors:
  canvas: "#F6F5F3"
  sidebar: "#17181A"
  surface: "#FFFFFF"
  surface-raised: "#F1F0ED"
  surface-hover: "#ECEAE6"
  line: "#E2DFDA"
  line-strong: "#CEC9C1"
  text: "#171719"
  text-muted: "#6F6D69"
  text-faint: "#A09D97"
  gradient-start: "#E21B24"
  gradient-mid: "#F36A4C"
  gradient-end: "#F6F5F3"
  signal: "#E21B24"
  signal-hover: "#F02630"
  success: "#52B788"
  warning: "#E5A84B"
  danger: "#F05252"
  info: "#6EA8FE"
typography:
  display: { fontFamily: Geist, fontSize: 32px, fontWeight: 560, lineHeight: 1.1, letterSpacing: -0.035em }
  headline: { fontFamily: Geist, fontSize: 20px, fontWeight: 560, lineHeight: 1.25, letterSpacing: -0.02em }
  body: { fontFamily: Geist, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  label: { fontFamily: Geist, fontSize: 12px, fontWeight: 520, lineHeight: 1.3, letterSpacing: 0.01em }
  data: { fontFamily: Geist Mono, fontSize: 13px, fontWeight: 480, lineHeight: 1.35, fontFeature: "tnum" }
rounded:
  xs: 3px
  sm: 5px
  md: 8px
  lg: 12px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
components:
  primary-action:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    height: 36px
  control:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    height: 36px
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 16px
---

# Mile27 Gradient Operations

## Overview

The admin is an operations instrument with an atmospheric, light visual shell. Its character comes from exact alignment, a warm Mile27 gradient, floating pill navigation, strong hierarchy, and rapid feedback. The intended operators are owners, managers, fulfilment staff, merchandisers, and support specialists working with live commerce data.

Design dials: variance 5, motion 4, density 8. The interface is compact and highly legible. Animation explains navigation, hierarchy, and state changes only.

## Colors

The default theme is light. A controlled red-to-coral-to-ivory gradient occupies the upper workspace and dissolves into a warm neutral canvas. White working surfaces remain quiet and legible. The sidebar is the sole dark structural element. Mile27 red is reserved for primary actions, focus, and critical conditions.

## Typography

Geist provides neutral precision. Geist Mono is mandatory for prices, quantities, order references, dates, SKUs, percentages, and other scan-heavy operational values. Large page titles use tight tracking; supporting labels remain sentence case.

## Layout

Desktop uses a floating 232px pill navigation rail inset 12px from the viewport and a 64px persistent floating command header. Primary page content uses a fluid workspace with 24px gutters. Tables stay dense and full-width. Mobile converts the rail to an overlay and retains complete task functionality.

## Elevation & Depth

Hierarchy is created with white surfaces, warm one-pixel borders, and restrained elevation. The gradient is limited to the page atmosphere and never sits behind dense table content. Shadows are limited to the floating shell, menus, dialogs, and transient controls.

## Shapes

Outer work panels use a 14px radius. Controls use 999px only for navigation and compact actions; data containers use 8–14px. Status indicators may be compact capsules when their silhouette materially improves scanning.

## Components

- Navigation uses a floating charcoal pill rail with icon, label, and a high-contrast active capsule.
- The command header contains breadcrumbs, global command access, context, and user actions.
- The live visitor module uses a real WebGL dot-mesh globe, approximate markers, restrained signal pulses, and an adjacent accessible location list.
- Tables use sticky headers, tabular data, visible row hover, and preserved bulk actions.
- Cards are used only for grouped operational regions. Ordinary content relies on spacing and rules.
- Inputs use dark raised surfaces, clear labels, visible error text, and a red focus ring.
- Motion uses 120–220ms transitions and directional easing. Reduced motion removes transforms and stagger.

## Do's and Don'ts

- Do preserve Spree routes, permissions, filters, forms, Turbo behavior, and analytics events.
- Do prioritize exceptions and actionable conditions over vanity metrics.
- Do show loading, empty, error, disabled, and permission-restricted states.
- Do maintain WCAG AA contrast and full keyboard operation.
- Don't fabricate operational data or imply activity that the backend did not report.
- Don't place gradients behind tables, use playful bouncing, add floating decoration, or apply excessive red.
- Don't copy the supplied reference layout or its soft card language.
