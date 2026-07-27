# Product Discovery Ecosystem

## Goal

Build an intent-specific, entity-driven and Spree-native discovery system in
which governed vocabularies and verified product facts power cards, filters,
comparisons, guides and indexable landing pages.

## Tasks

- [ ] Define versioned controlled vocabularies, units, eligibility rules and deprecation mappings. Verify invalid or deprecated values cannot enter new product facts.
- [ ] Build product facts, evidence, provenance and review events. Verify an unverified safety claim cannot enter filters, cards, comparisons or schema.
- [ ] Build Brand, Model Family and Model entities mapped to Spree products and variants. Verify duplicate model identities are rejected.
- [ ] Build typed compatibility and `CatalogueLandingPageRelation` records with ordering, moderation and cache invalidation. Verify unpublished or invalid targets cannot publish.
- [ ] Add role-based editorial workflows for catalogue, technical, SEO/content, media-rights and indexation approval. Verify authors cannot self-approve high-risk facts.
- [ ] Add the landing-page registry, route policy and explicit index approval. Verify an unmapped taxon stays noindex and out of the sitemap.
- [ ] Build `CataloguePageModel`, crawlable pagination and Search/Category/Brand/Collection adapters. Verify each route has distinct metadata and page intent.
- [ ] Build the ProductCard view model and contextual intelligence rules. Verify cards expose no more than three relevant, verified facts.
- [ ] Establish the unified responsive design system before implementing Shop, Category, Search, Brand and Collection compositions.
- [ ] Build Shop, Category, Search and AGV Brand Portal; add quality scoring, registry-driven sitemaps, structured data and sourced GEO/AEO modules.
- [ ] Pilot authored comparisons, guided buying and licensed media relations only after fact coverage and workflows meet their launch gates.
- [ ] Run relation integrity, permission, responsive, keyboard, crawl, metadata, schema and Core Web Vitals QA.

## Done when

- [ ] Controlled vocabularies and provenance govern every reusable product fact.
- [ ] Products are the centre of typed relations connecting brands, models, compatibility, guides, comparisons, reviews and media.
- [ ] Important products are reachable through crawlable paths and usable discovery flows.
- [ ] Search, sorting, arbitrary filters and guided-buyer states remain noindex.
- [ ] Only human-approved, high-quality landing pages enter navigation and sitemaps.
- [ ] Named editorial owners can see and resolve draft, disputed, expiring and suspended work.
- [ ] No page type is merely the same grid under a different H1.
