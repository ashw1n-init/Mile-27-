---
version: alpha
name: Whiteout Performance Index
description: A unified white-space system for cinematic product storytelling and precision catalogue discovery.
colors:
  ink: "#0B0B0A"
  surface: "#FFFFFF"
  surface-raised: "#F4F4F0"
  surface-product: "#F0F0EC"
  paper: "#FFFFFF"
  muted: "#66645F"
  line: "#D8D8D2"
  line-strong: "#AAA9A4"
  signal: "#FF4D20"
typography:
  display: { fontFamily: Geist, fontSize: 112px, fontWeight: 620, lineHeight: 0.82, letterSpacing: -0.075em }
  headline-lg: { fontFamily: Geist, fontSize: 72px, fontWeight: 580, lineHeight: 0.9, letterSpacing: -0.055em }
  headline-md: { fontFamily: Geist, fontSize: 42px, fontWeight: 560, lineHeight: 0.96, letterSpacing: -0.04em }
  body-lg: { fontFamily: Geist, fontSize: 22px, fontWeight: 400, lineHeight: 1.45 }
  body-md: { fontFamily: Geist, fontSize: 16px, fontWeight: 400, lineHeight: 1.55 }
  product-title: { fontFamily: Geist, fontSize: 15px, fontWeight: 560, lineHeight: 1.18, letterSpacing: -0.025em }
  commerce: { fontFamily: Geist, fontSize: 14px, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.015em }
  label: { fontFamily: Geist Mono, fontSize: 11px, fontWeight: 600, lineHeight: 1.2, letterSpacing: 0.12em }
rounded: { none: 0px, sm: 2px, full: 999px }
spacing: { xs: 4px, sm: 8px, md: 16px, lg: 32px, xl: 64px, xxl: 112px, chapter: 160px }
components:
  discovery-masthead:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: 40px
  discovery-dock:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.none}"
    height: 56px
    padding: 6px
  discovery-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: 28px
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: 18px
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: 18px
  purchase-rail:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: 16px
  performance-index-grid:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: 0px
  indexed-product:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: 16px
  indexed-product-image:
    backgroundColor: "{colors.surface-product}"
    rounded: "{rounded.none}"
    padding: 16px
---

# Whiteout Performance Index

## Overview

A Mile 27 product surface should feel like a launch film connected to a living
technical catalogue. Product detail pages use cinematic isolation; discovery
pages use the Performance Index: a strict editorial field where each item reads
as an indexed piece of equipment rather than a marketplace tile. Retail and
wholesale retain their channel-specific price and cart behaviour.

Product cinema dials: variance 9/10, motion 7/10, density 5/10.
Catalogue dials: variance 8/10, motion 4/10, density 5/10. Catalogue motion
reveals state and image relationships without delaying product scanning.

## Colors

The storefront is locked to a pure white theme. Near-black is the reading colour,
graphite supports secondary information, and signal orange is reserved for
purchase actions, offers and one active state at a time. Product image fields use
a warm technical neutral. Sections and cards are separated through composition,
whitespace and fine rules rather than shadows or containers.

## Typography

Geist becomes graphic material at display sizes, with tight tracking and short
line lengths. Product-authored prose uses a calmer reading rhythm. Monospace labels
are limited to operational information such as index, stock, category, price
context and image count. Product names stay sentence case and readable.

## Layout

Desktop uses a 12-column master grid. Product cinema permits deliberate overlap,
off-axis media and sticky chapters. The Performance Index maps to 4 columns at
1024px, 5 columns from 1536px, 3 columns on tablets and 2 columns on mobile.
Catalogue gutters are formed by internal card padding; the product field itself
has no decorative gaps. Ultra-wide layouts stop at 1920px.

## Elevation & Depth

No shadows or glass. Depth comes from isolated product imagery, clipping masks,
sticky layers and scale. One-pixel neutral rules organise commercial controls
and product cells. Stronger rules mark page or catalogue boundaries only.

## Shapes

Edges are square. Circular forms are reserved for image counters and compact
directional controls. Form controls maintain a minimum 44px touch target.

## Components

The homepage opens with one session-scoped boot field. It is pure black with
the supplied Mile 27 artwork optically pinned at centre and operational metadata
locked to the bottom edge: mile27store, Kollam, Kerala, India, and est.2019. A
dim structural imprint precedes a bottom-to-top colour exposure tracked by one
signal-red registration line. The field holds for at least 2.4 seconds and until
the page is ready, accepts click or keyboard skip after one second, then exits as
one top-closing shutter. It never appears on product, collection, account,
checkout or wholesale pages, and reduced-motion mode replaces the sequence with
a short opacity transition.
The homepage hero title block is bound directly to the hero's scroll progress.
Downward travel simultaneously lowers the title, recedes it into the composition
with restrained scale and adds a perspective bend while continuously fading it
out; upward travel brings it forward through the exact inverse path, raises and
straightens it, and fades it back in. A
damped progress spring removes wheel noise
and a velocity-derived skew adds restrained inertia before returning to zero.
The block fades only near the hero boundary, remains independent from carousel
slide transitions, and is static under reduced-motion preferences.

The discovery masthead unifies shop, search, collection and brand pages. It uses
one oversized, tightly tracked title anchored by operational breadcrumbs and a
short description. Category imagery, when present, occupies a bordered plate
rather than becoming a low-contrast background. Child collections and brands
form a numbered edge-to-edge index: no pills, loose tag clouds or ornamental
containers. Hover and keyboard focus invert one index cell, shift its label and
reveal a directional arrow. On small screens the index becomes a single-column
touch list and the masthead type scales with the viewport.

The discovery dock is a single bottom-centred command surface shared by shop,
collection, brand and search listings. It exposes only Filter, Sort, result
context and contextual reset. Facets open in a wide selection matrix that keeps
the product field perceptually present; sort opens in its own compact indexed
surface. The dock condenses with downward travel, restores on upward travel or
focus, and quiets during idle time. Its 56px chassis, square geometry, fine
border and restrained elevation should read as precision hardware, never a
generic floating pill. All dock and panel motion collapses under reduced motion.
Compound equipment options use a two-step variant scale: a separate indexed size
selector controls the active row, followed by one compact colour scale. Colour
choices are square material swatches with persistent names, product counts in
accessible labels, and a precision outline for selection. Never render compound
size/colour values as pill buttons or repeat the full palette for every size.
Independent Colour facets always render as a material swatch scale. Slash-separated
finishes use hard-edged split swatches, clear/photochromic finishes use a neutral
transparency field, and every sample retains a visible name and accessible count.
Non-visual facets such as Variant and Style remain textual selectors.

The purchase rail is the commercial spine of the product page. The indexed
product sheet is the commercial atom of catalogue pages. It contains a real
position/context label, a 4:5 object-contain image field, product identity, price
and availability. It may show up to three verified context facts only when those
facts are supplied by the governed view model. Hover shifts the product image by
at most 1.5% and reveals an action rule; mobile exposes all essential information
without hover.
The homepage brand directory is a governed eight-maker edit rather than a
complete taxonomy dump. Its verified current roster includes AGV, and pairs
every name with one real catalogue product in an open white image stage.
Hover, focus and touch selection exchange that equipment through a directional
optical reveal. The outgoing product compresses into a diagonal mask while the
incoming object resolves through restrained depth, rotation and blur; one
signal-red registration line tracks the reveal edge. Motion direction follows
the user's movement through the brand index. Brand names link to their governed
category and the staged product remains directly shoppable. The stage uses no
shadow, gradient, fabricated campaign image or logo treatment.
The homepage mission is one pinned composition with a multi-viewport scroll
runway. Its heading, progress rule and statement remain fixed for the complete
word-reveal sequence, then release only after the final line has resolved.
Reduced-motion mode removes the extended runway and presents the statement in
one static viewport.
Product cinema imagery never uses CSS drop shadows. Variant media changes occur
inside one persistent gallery: the outgoing plate recedes and masks away while
the incoming plate resolves through directional clipping, restrained blur and a
single signal-orange scan line. The sequence lasts 780ms with no overshoot and
must preserve zoom, swipe and gallery navigation state. Reduced motion collapses
the sequence to a short opacity transition.

## Do's and Don'ts

- Do make each product's authored content determine the available story chapters.
- Do keep price, availability, variant selection, and add-to-cart accessible early.
- Do preserve retail and wholesale cart, hidden pricing, analytics, and SEO behavior.
- Do use real Spree category/brand assignments as identity context.
- Do keep card baselines, image ratios and price hierarchy stable across long names.
- Do omit technical intelligence when verified facts are unavailable.
- Do honor reduced motion and maintain full keyboard access.
- Don't fabricate ratings, reviews, guarantees, certifications, scarcity, or claims.
- Don't use gradients, glass panels, decorative pills, lime accents, or generic cards.
- Don't introduce dark panels or alternate between light and dark page sections.
- Don't use `object-cover` for helmets or technical equipment.
- Don't overlay multiple labels on product photography.
- Don't introduce card gaps that break the continuous index field.
- Don't animate essential copy into an unreadable initial state.
