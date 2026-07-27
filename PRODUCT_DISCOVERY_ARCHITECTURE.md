# Mile 27 Product Discovery and Organic Growth Architecture

Status: Phase 1–3 audit and proposed architecture  
Audit date: 25 July 2026  
Scope: Retail storefront catalogue discovery. Wholesale remains a separate, noindex surface.

## 1. Executive decision

Mile 27 should retain Spree as the source of truth for products, variants, prices,
inventory, taxonomies, taxons, options, properties and promotions. The storefront
needs a new **Landing Page Policy** layer between Spree data and Next.js routes.

That layer must determine:

- the customer's intent and page type;
- the canonical storefront URL;
- whether the page is indexable;
- whether it is eligible for the sitemap and internal navigation;
- which editable content modules are required;
- which structured data is valid;
- how filtered and paginated states behave.

This avoids duplicating catalogue business logic while preventing every imported
taxon or URL parameter from becoming an SEO landing page.

The **product entity is the centre of the discovery graph**. Categories, brands,
collections, comparisons and guides are semantic views over verified product
facts—not independent stores of duplicated marketing copy.

## 2. Repository and platform audit

### Runtime architecture

| Area | Current implementation | Finding |
|---|---|---|
| Commerce backend | Spree Commerce 5.6.0, Rails, Store API v3 and Admin API v3 | Suitable source of truth; not Spree 6 |
| Storefront | Next.js 16 App Router, React 19, TypeScript and Tailwind | Server Components and server actions are already used well |
| API client | `@spree/sdk` 1.2 | Products, categories, filters and markets are SDK-driven |
| Rendering | Server-rendered first catalogue page with streamed Suspense | Strong baseline for initial discoverability and LCP |
| Caching | Next remote cache, 10-minute product caches and longer category caches | Appropriate baseline; editorial invalidation needs explicit tags |
| Market routes | `/{country}/{locale}/...` | Canonicals and sitemaps already reflect market paths |
| Wholesale | Separate route group with `noindex, nofollow` | Correctly isolated from public organic landing pages |

### Live catalogue snapshot

The read-only Spree Admin API returned:

- 87 products;
- 90 non-root and root category/taxon records across four pages;
- 85 products assigned to AGV;
- product SEO titles and descriptions largely unset;
- category SEO fields and descriptions largely unset;
- many products currently not purchasable or out of stock;
- product `tags` arrays empty even though a large Tags taxonomy exists;
- product descriptions containing repeated templated commercial and technical
  claims that require editorial verification before publication.

The category dataset contains:

- relevant commerce categories such as Full Face Motorcycle Helmets,
  Full Face Race Helmets, Sport-Touring Helmets and Racing Suits;
- brand taxons such as AGV and Motul;
- imported generic taxonomy paths such as Home & Garden and Household Supplies;
- many near-duplicate tags such as “AGV helmet”, “AGV Helmets”,
  “AGV helmets India” and “AGV full face helmet” targeting the same product set.

This taxonomy cannot be placed wholesale into an XML sitemap.

### Current storefront route inventory

| Existing route | Current role | Main issue |
|---|---|---|
| `/{country}/{locale}` | Homepage | Editorial discovery exists |
| `/{country}/{locale}/products` | Shop and search results | Two distinct intents share one template |
| `/{country}/{locale}/products?q=` | Internal search | Canonical resolves to `/products`; no explicit noindex |
| `/{country}/{locale}/c/[...permalink]` | All category, brand and tag taxons | Every taxonomy receives the same page hierarchy |
| `/{country}/{locale}/products/[slug]` | Product detail | Strongest current SEO implementation |
| `/{country}/{locale}/wholesale/*` | B2B portal | Correctly noindexed |

### Current listing system

Strengths:

- filters and sort use URL state;
- first result page is server rendered;
- filter counts come from the Spree filters endpoint;
- product-list payloads use narrowed fields;
- mobile has a dedicated filter drawer;
- view and selection analytics already exist;
- product cards handle sale, hidden price and stock state;
- product images use responsive image infrastructure.

Gaps:

- search has no distinct route or recovery architecture;
- product discovery is a generic heading, toolbar and three-column grid;
- infinite scroll has no crawlable `page` state, history restoration or fallback;
- only the first twelve products are directly addressable in server HTML;
- product cards do not expose brand, category, variant range, meaningful
  attributes or availability context;
- no shared listing adapter distinguishes Shop, Category, Brand, Tag and Search;
- no editorial interruptions or buying modules;
- no `ItemList` or `CollectionPage` structured data;
- no explicit error boundary or useful API-failure state for listings.

### Current SEO infrastructure

Strengths:

- canonical helpers exist;
- product and category metadata read Spree fields;
- product, offer, review and breadcrumb JSON-LD exist;
- genuine rider review data gates AggregateRating;
- a dynamic market-aware sitemap exists;
- robots rules exclude account, cart, checkout and wholesale;
- Organization schema and branded favicon metadata exist.

Critical gaps:

1. `sitemap.ts` publishes every non-root taxon, including duplicate tags,
   low-value categories and irrelevant import paths.
2. `robots.ts` disallows sort and page parameters, but robots blocking is not a
   substitute for page-level `noindex`.
3. Internal search URLs do not emit explicit `noindex, follow`.
4. Filtered catalogue states canonicalize to the unfiltered page but remain
   indexable unless a crawler respects the robots block.
5. Client-only infinite scroll prevents crawlable deeper catalogue states.
6. Category fallback metadata is generic and nearly all live category SEO
   fields are empty.
7. There is no hreflang output despite market and locale routes.
8. There is no WebSite/SearchAction, CollectionPage or ItemList schema.
9. Empty and low-product taxons are eligible for sitemap inclusion.
10. The development fallback store URL points to port 3001, which is the API in
    this workspace. Production must set the real public storefront origin.

## 3. Proposed route architecture

Preserve existing product URLs. Introduce intent-specific public routes and
permanent redirects from legacy taxon URLs only after the landing-page registry
is populated.

| Page type | Proposed route | Source |
|---|---|---|
| Homepage | `/{country}/{locale}` | Store configuration |
| Shop | `/{country}/{locale}/products` | All eligible products |
| Search | `/{country}/{locale}/search?q=` | Spree product search |
| Category | `/{country}/{locale}/category/[...slug]` | Category taxonomy |
| Brand | `/{country}/{locale}/brand/[slug]` | Approved Brand taxons |
| Curated attribute/use case | `/{country}/{locale}/collection/[slug]` | Approved landing-page registry mapped to Spree query/taxon |
| Product | `/{country}/{locale}/products/[slug]` | Spree product |
| Legacy category | `/{country}/{locale}/c/[...permalink]` | 308 redirect when mapped; otherwise noindex until classified |

Why not make every Spree tag a `/tag/` page: “tag” is an internal data concept,
not customer language. Valuable tags should become deliberately named
`/collection/` pages. Navigation-only and low-value tags remain nonindexable.

## 4. Route and indexation matrix

| Page | Intent | Index | Canonical | H1 | Title pattern | Content requirement | Internal links | Schema | Pagination |
|---|---|---:|---|---|---|---|---|---|---|
| Homepage | Brand and top-level discovery | Yes | Self | One brand proposition | Store SEO title | Real store proposition and discovery paths | Header, sitemap | Organization, WebSite | N/A |
| Shop | Broad transactional discovery | Yes | Self | Shop motorcycle helmets, gear and accessories | Motorcycle Helmets, Riding Gear & Accessories | Category index, curated groups, brands and concise guide | Header, homepage, footer | CollectionPage, ItemList, BreadcrumbList | Crawlable `?page=N`; self-canonical |
| Search | Direct internal query | No, follow | Search URL or no canonical | Results for “query” | Search results for query | Query, counts, matches and recovery | Header search only | ItemList only; no SearchResultsPage type | URL page state; noindex |
| Category | Category transaction | Conditional yes | Self | Editable category H1 | Intent-specific category template | 40–120 word intro, subcategories, guide, related entities | Shop, parent category, products, guides | CollectionPage, ItemList, BreadcrumbList | Crawlable pages; page 1 as base canonical |
| Brand | Branded transaction | Conditional yes | Self | Brand + available product scope | Buy {Brand} helmets/gear online in India | Factual overview, available categories/models, buyer guidance | Shop, brand directory, products | CollectionPage, ItemList, BreadcrumbList, Brand entity where valid | Crawlable |
| Curated collection | Specific use case or attribute | Registry approval only | Self | Editorial H1 | Intent-specific | Verified definition, matching products and guidance | Categories, brands, guides | CollectionPage, ItemList, BreadcrumbList | Crawlable |
| Navigation-only tag | Internal grouping | No, follow | Best parent category or brand | Optional | No search template | No standalone content required | Not in primary navigation | None | N/A |
| Filtered state | Product refinement | No, follow | Unfiltered landing page | Inherit page H1 | Inherit base title | Active filter summary only | UI controls | ItemList optional | URL state retained |
| Sorted state | Product ordering | No, follow | Unsorted landing page | Inherit | Inherit | No unique SEO content | UI control | ItemList optional | URL state retained |
| Product | Exact product transaction | Yes if available and valid | Self | Product name | Product or editorial override | Genuine product data, story, specs, policies and reviews | Listings, related products, guides | Product, Offer, BreadcrumbList, genuine Review | N/A |
| Empty landing page | No customer value | No, follow | Parent or self | Accurate empty state | Noindex title | Recovery links | Parent and alternatives | None | N/A |

### Index eligibility policy

A category, brand or curated collection becomes indexable only when all are true:

1. It has a stable canonical slug and one unambiguous intent.
2. It contains at least three relevant active products. The threshold is a
   default editorial gate, not a guarantee of quality.
3. It has an editable H1, concise introduction and unique metadata.
4. It is linked from at least one crawlable hub.
5. It has no approved page targeting the same intent.
6. Its products and claims have been editorially validated.
7. Its index status is explicitly approved in the landing-page registry.

Product count alone never makes a page indexable.

## 5. Canonical and parameter policy

| State | Directive | Canonical |
|---|---|---|
| Base Shop/Category/Brand/Collection | `index, follow` when approved | Self |
| `?sort=` | `noindex, follow` | Parameter-free base |
| Filter parameters | `noindex, follow` | Parameter-free base |
| Internal `?q=` or `/search?q=` | `noindex, follow` | Search route or omitted |
| `?page=1` | Redirect to parameter-free URL | Base |
| `?page=N`, N > 1 | Index only for approved catalogue pages | Self |
| Tracking parameters | Redirect or ignore; canonical clean URL | Clean base |
| Invalid filter, sort or page | Normalize or 404 where appropriate | Never index |
| Empty approved landing page | `noindex, follow` until stock/content recovers | Self |

Robots.txt should allow crawlers to fetch filtered URLs so the `noindex` signal
can be seen. Unbounded parameter discovery should instead be controlled through
internal-link discipline, URL normalization and noindex.

## 6. Taxonomy classification

### Indexable candidates after editorial review

- Full Face Motorcycle Helmets;
- Full Face Race Helmets;
- Sport-Touring Helmets;
- Racing Suits;
- AGV brand;
- AGV Pista GP RR collection, after duplicate tags consolidate into one intent.

### Navigation-only or consolidate

- Vehicles & Parts and its imported intermediate branches;
- tags used solely for merchandising;
- colour and campaign labels;
- one-product branches without unique demand.

### Remove from organic surfaces

- Home & Garden and Household Supplies import paths;
- Uncategorized;
- duplicate AGV helmet variants that return the same 85 products;
- raw importer tags such as campaign/test/internal labels;
- any empty taxon.

Do not delete source taxons during Phase 1. First classify, map redirects and
confirm they are not required by imports, promotions or navigation.

## 6A. Product entity and verification layer

The product entity must be normalised before richer discovery pages are built.
Spree properties, option types, variants and associations remain the primary
commerce primitives, with a governed vocabulary defining which fields can power
filters, cards, comparisons, schema and recommendations.

```text
Product
├── Brand
├── Model family
├── Helmet or equipment type
├── Certification records
├── Riding style and use case
├── Shell/material records
├── Declared weight and tolerance
├── Visor and Pinlock configuration
├── Intercom readiness and compatibility
├── Climate suitability
├── Fit profile
├── Technology/features
├── Price band (derived per market)
├── Variants: size, colour and stock
└── Evidence and editorial review status
```

### Fact provenance contract

Every safety, compatibility, weight or performance fact must store:

- a controlled attribute key and value;
- source type: manufacturer, homologation authority, product manual, verified
  physical inspection or approved distributor data;
- source URL or attachment where licensing allows;
- source publication/version date when available;
- market or variant scope;
- reviewer and review date;
- verification state: draft, verified, disputed or expired.

Only verified facts may appear in:

- product-card intelligence;
- comparison tables;
- filter facets;
- factual buying-guide recommendations;
- structured data;
- indexable collection definitions.

Marketing prose and imported descriptions are never a fact source by default.

### Controlled vocabularies

Controlled vocabularies must exist before product facts, landing-page queries or
filter contracts are implemented.

Each vocabulary term stores:

- stable machine key and human label;
- applicable product types and markets;
- value type and permitted unit;
- whether multiple values are allowed;
- whether the term may power filters, cards, comparisons or schema;
- validation rules and mutually exclusive values;
- deprecation/replacement mapping;
- editorial definition and authoritative source guidance.

Initial vocabulary domains:

| Domain | Examples | Notes |
|---|---|---|
| Brand and model hierarchy | AGV, Pista GP RR | Entities, not free-text properties |
| Equipment/helmet type | Full face, modular, racing suit | Controlled commerce classification |
| Certification | ECE 22.06, FIM homologation | Evidence required; market/version scoped |
| Riding style/use | Touring, track, commute | Editorially governed; not universal safety advice |
| Material | Carbon fibre, composite, thermoplastic | Manufacturer terminology normalised |
| Measurement | Declared weight in grams | Variant/size and tolerance scoped |
| Fit profile | Intermediate oval, glasses accommodation | Only when documented or physically reviewed |
| Visor/Pinlock | Included, compatible insert/model | Separate included-versus-compatible states |
| Intercom | Universal-ready, integrated-system compatibility | Exact compatibility relation preferred |
| Climate/environment | Ventilation or weather characteristics | Avoid unsupported “best for” claims |
| Technology | Manufacturer-defined named features | Source and brand ownership required |

Vocabulary changes are versioned. Deprecating a term must invalidate dependent
facts, landing-page queries and comparison dimensions until they are remapped.

### Price and availability are contextual

Price range is derived from the active market and currency rather than stored as
a permanent product classification. Stock, purchasability and promotions remain
live commerce state and must not be copied into editorial records.

## 6B. Internal commerce knowledge graph

The graph is an application relationship model over Spree entities, not a second
catalogue database:

```text
Brand
  → model families
    → models
      → products
        → variants
        → compatible accessories
        → verified facts
        → media and manuals
        → rider reviews
      → comparisons
      → buying guides
      → FAQs
      → videos and editorial stories
```

Required relationship types:

| Relationship | Example | Ownership |
|---|---|---|
| Product belongs to brand | AGV K7 → AGV | Spree taxon/controlled brand mapping |
| Product belongs to model family | Pista colourway → Pista GP RR | Curated entity mapping |
| Product has verified fact | K7 → ECE 22.06 | Product fact record with source |
| Accessory compatible with product/model | Visor → supported helmet models | Explicit compatibility record |
| Product discussed by guide | K7 → sport-touring helmet guide | Editorial relation |
| Product compared with product | Pista GP RR ↔ Corsa R | Comparison record |
| Product has media | Product → manual/video/community media | Existing media plus governed media record |

Internal links should be generated from these explicit relationships. A graph
edge never makes its destination indexable by itself; the landing-page quality
gate still applies.

## 7. Keyword-to-page map

This is an intent map, not a ranking promise. Validate volume and terminology
with Search Console and a keyword research platform before editorial production.

| Query cluster | Intent | Primary page | Supporting page/content | Cannibalisation control |
|---|---|---|---|---|
| motorcycle helmets online India | Transactional | Full Face / Helmets category hub, based on actual assortment | Helmet buying guide | Shop page targets broader store discovery |
| premium motorcycle helmets India | Commercial/transactional | Helmet category hub | Premium helmet selection guide | Homepage uses brand proposition, not the same H1 |
| AGV helmets India | Branded transactional | AGV brand page | AGV model comparison guide | Consolidate all duplicate AGV tags |
| AGV Pista GP RR helmet | Model transactional | Approved Pista GP RR collection | Product pages for exact colourways | Collection targets family; products target exact SKU/model |
| full face helmets online India | Category transactional | Full Face Motorcycle Helmets | Fit and certification guide | Race Helmets targets track-specific intent |
| racing helmets India | Category/use case | Full Face Race Helmets | FIM/ECE explainer with cited sources | Do not duplicate on generic Full Face page |
| sport touring helmets | Use-case transaction | Sport-Touring Helmets | Touring helmet selection guide | Keep use-case language specific |
| motorcycle racing suits India | Category transaction | Racing Suits | Suit fit and protection guide | Product pages target exact suit |
| ECE 22.06 helmets | Attribute/commercial | Curated collection only after certification data is modelled and verified | Cited standard explainer | Never infer certification from marketing copy |
| helmets under ₹10,000 | Price transaction | Curated collection only if inventory supports it | Budget guide | Dynamic filter URL remains noindex |
| site/product model searches | Navigational | Internal Search | Exact products and matching entities | Search remains noindex |

### Search-intent classification

Every landing page and editorial record must declare one primary intent class.

| Intent class | Example | Primary destination |
|---|---|---|
| Broad commercial discovery | Premium motorcycle helmets India | Category or Shop hub |
| Branded commercial | AGV helmets | Brand portal |
| Exact transactional | Buy AGV K6 Mono Black | Exact product |
| Model-family commercial | AGV Pista GP RR helmets | Model-family collection |
| Comparative | AGV K6 vs Shoei RF-1400 | Authored comparison |
| Educational | What is ECE 22.06? | Sourced guide |
| Budget | Helmets under ₹10,000 | Curated market-aware collection |
| Problem-solving/use case | Helmet for long highway rides | Use-case collection or guided buyer |
| Navigational support | AGV K7 visor | Compatible accessory/product route |

One URL owns each primary intent. Supporting pages may link to it but must not
reuse the same H1, title promise and content scope.

## 8. Competitor snapshot and opportunity matrix

Live search sampling on 25 July 2026 surfaced Speed World, BikersBrain,
Slickshop, Motofy, Helmetwala, Throttlein and larger marketplaces. This is a
directional SERP snapshot and must be refreshed before content commissioning.

| Query/intent | Observed leader type | Their strength | Mile 27 gap | Differentiated opportunity | Priority |
|---|---|---|---|---|---:|
| Premium helmets India | Specialist retailers such as Speed World and Slickshop | Broad category/brand coverage and trust language | Narrow, mostly AGV inventory and weak category IA | Premium model-family expertise, verified fit and availability guidance | P0 |
| AGV helmets India | Helmetwala brand collection and specialist retailers | Dedicated branded landing page and model range context | AGV appears as a generic taxon with empty metadata | Authoritative AGV page with factual model comparison and live category/model index | P0 |
| Full-face helmets | Marketplaces and category retailers | Large assortments and established category pages | Generic listing and no buying architecture | Fast technical comparison by use, certification, shell and price—only from verified data | P0 |
| Riding gear/accessories | Slickshop, Motofy, BikersBrain | Breadth across gear categories | Current taxonomy is sparse and importer-led | Curated premium assortment with stronger editorial product evaluation | P1 |
| Helmet fit advice | Local specialists such as Speed World | Store/fit assistance proposition | No dedicated fit pathway in catalogue pages | Factual sizing workflow connected directly to products and support | P1 |

Reference sites:

- https://www.speedworld.co.in/
- https://slickshop.in/
- https://www.helmetwala.com/collections/agv-helmets
- https://www.motofystore.in/
- https://www.bikersbrain.in/

Do not copy their text, metadata or design.

## 9. Landing-page administration model

Use a separate Spree-owned policy record rather than overloading raw taxons with
unstructured metadata.

Proposed entity: `Spree::CatalogueLandingPage`

| Field | Purpose |
|---|---|
| `resource_type`, `resource_id` | Optional association to taxon, taxonomy or saved product query |
| `page_type` | category, brand, collection |
| `slug` | Canonical public slug |
| `h1` | Editorial page heading |
| `introduction` | Concise intent summary |
| `seo_title`, `meta_description` | Controlled metadata overrides |
| `indexable` | Explicit editorial approval |
| `canonical_override` | Exceptional use only |
| `buying_guide` | Structured/rich editorial module |
| `faq_items` | Structured questions with moderation |
| `related_resource_ids` | Approved categories/brands/collections |
| `editorial_media` | Licensed media attachment |
| `query_definition` | Validated saved Spree query for curated collections |
| `published_at`, `updated_at` | Editorial accountability |
| `reviewed_by` | Admin/editor reference |
| `primary_intent` | Controlled search-intent classification |
| `quality_score`, `quality_status` | Computed score and editorial decision |

Do not store related entities as an opaque array or generic JSON field on the
landing page.

### Typed landing-page relationships

Use a relational join model:

`Spree::CatalogueLandingPageRelation`

| Field | Purpose |
|---|---|
| `landing_page_id` | Required parent landing page |
| `relation_type` | Controlled semantic relationship |
| `related_type`, `related_id` | Polymorphic related entity |
| `position` | Stable editorial ordering |
| `context` | Optional structured display/use context |
| `editorial_note` | Internal moderation rationale |
| `published` | Independent publication control |
| `valid_from`, `valid_until` | Optional campaign or evidence window |
| `created_by`, `reviewed_by` | Accountability |
| `created_at`, `updated_at` | Cache invalidation and freshness |

Initial `relation_type` vocabulary:

- `featured_product`;
- `related_brand`;
- `related_category`;
- `supporting_guide`;
- `comparison`;
- `recommended_accessory`;
- `faq_source`;
- `evidence_source`.

Database and API rules:

- unique index on landing page, relation type and related entity where duplicates
  are not meaningful;
- indexed ordering by landing page, relation type and position;
- allowlist related entity classes per relation type;
- reject unpublished or deleted targets at publication time;
- expose typed relations through explicit Store API serializers;
- expire relevant cache tags on relation changes;
- attach analytics IDs to rendered relations without embedding tracking logic in
  the database model.

Product compatibility uses its own typed relation model because compatibility is
a product fact with variant/model scope—not merely landing-page merchandising.

Fallbacks may generate display copy, but generated content must not automatically
make a page indexable.

## 10. Shared presentation architecture

Introduce a server-side `CataloguePageModel` mapper:

```text
Spree response + Landing Page Policy + URL state
  -> page identity
  -> product-card view models
  -> facet view models
  -> indexation directives
  -> canonical/pagination links
  -> structured-data graph
  -> editorial modules
```

Visual components consume view models, not raw platform rules:

- `CatalogueIdentity`
- `DiscoveryIndex`
- `CatalogueToolbar`
- `DesktopFacetRail`
- `MobileFilterSheet`
- `ActiveFilterSummary`
- `ProductCard`
- `ProductGrid`
- `EditorialInterruption`
- `CrawlablePagination`
- `CatalogueEmptyState`
- `BuyingGuide`
- `RelatedEntities`
- `CatalogueFaq`

### Required schema dependency chain

Implementation follows this order:

```text
Controlled vocabularies
  → product fact and provenance schema
  → brand, model-family and model entities
  → compatibility and typed relationship schemas
  → landing-page registry
  → route, canonical and indexation policy
  → CataloguePageModel
  → ProductCard view model
  → unified catalogue design system
  → Shop, Category, Search, Brand and Collection experiences
```

No downstream layer should introduce temporary free-text attributes to bypass an
unfinished upstream schema.

### Grid contract

- Maximum content width: 1920px with controlled outer gutters.
- 320–480px: two columns where names/prices remain readable.
- 768–1023px: three columns.
- 1024–1439px: four columns.
- 1440px+: five columns with a maximum card width.
- Product image ratio: 4:5 by default, with `object-contain` when source
  photography requires the complete helmet silhouette.
- First row appears before long editorial content.
- Interruptions may span columns only when relevant to the current intent.

## 11. Product-card data contract

The current narrowed response must be expanded only with fields that support a
real decision:

- product and canonical product URL;
- primary image and lazy secondary image reference;
- brand entity;
- category/use case;
- current and compare-at price;
- purchasable, in-stock and backorder state;
- verified badges derived from modelled data;
- available colour/size summary when option data is present;
- genuine review summary only when published review data exists.

Do not parse certification, shell material or riding use from prose. Model these
as properties/options or curated landing-page mappings first.

### Progressive product intelligence

Cards may expose up to three contextually relevant verified facts, selected by
the current page intent rather than displaying every available badge.

Examples:

- a touring collection can prioritise declared weight, intercom readiness and
  Pinlock configuration;
- a race collection can prioritise verified homologation, shell construction and
  track-oriented fit/use;
- a compatible-accessory page can prioritise the exact compatible model range;
- a budget page can prioritise price, stock and the most decision-relevant
  verified feature.

Labels such as “Best for highway”, “Best value”, “Beginner recommendation” or
“Most popular” are editorial or analytics conclusions. They require:

- a documented scoring rule or authored rationale;
- the eligible product set;
- a review date;
- disclosure when commercial/editorial judgement is involved.

They must never be inferred from product copy or fabricated when behavioural data
is unavailable.

## 12. Pagination decision

Replace unaddressable infinite scroll with a hybrid:

1. Server render `?page=N`.
2. Emit crawlable Previous/Next and numbered anchors.
3. Enhance with “Load more” on capable clients.
4. Update browser history and URL after each loaded page.
5. Restore the loaded range and scroll position on back navigation.
6. Keep sort/filter states noindex.

This preserves the smooth experience without trapping products behind a client
observer.

## 13. Structured data graph

| Page | Markup |
|---|---|
| Global layout | Organization |
| Homepage | WebSite and valid SearchAction pointing to `/search?q={search_term_string}` |
| Shop/category/brand/collection | CollectionPage + ItemList + BreadcrumbList |
| Product | Product + Offer + BreadcrumbList + genuine Review/AggregateRating |
| Guide | Article/BlogPosting with real author and dates |
| FAQ | FAQPage only if the visible content and current eligibility rules support it |

Do not emit Brand history, certifications, offers, ratings or availability that
are not present in visible, verified data.

## 14. GEO/AEO content contract

Each approved landing page should expose a compact, factual answer layer:

- one-sentence definition of the category or use case;
- who the products are for;
- three to five decision criteria drawn from modelled product data;
- a short comparison table when enough verified differences exist;
- related brands and categories;
- concise customer questions grounded in support/search data;
- editorial reviewer and updated date for technical guides;
- citations to authoritative standards/manufacturer sources for safety claims.

No AI summary may publish without a stored source set and editorial approval.

### Required answer modules for approved collections

Modules are optional individually but the page model must support:

- Who should consider this collection?
- Who may need a different product type?
- What should buyers compare first?
- Best value, premium and beginner recommendations, only with explicit criteria;
- Frequently compared products or model families;
- Common buying mistakes;
- Compatibility or sizing cautions;
- What changed since the last editorial review?

Each recommendation stores its rationale, supporting product facts, editor and
review date. When evidence becomes stale, the module automatically returns to
draft rather than remaining published.

## 14A. Comparison engine

Comparisons are authored commercial-investigation pages, not automatically
generated combinations.

Eligibility:

1. Both products or model families have sufficient verified comparable facts.
2. The comparison represents demonstrated search, support or merchandising value.
3. Differences are material and visible to the buyer.
4. An editor supplies a conclusion by use case rather than declaring a universal
   winner.
5. Price and availability are rendered from live market data.

Comparison data model:

| Field | Purpose |
|---|---|
| `left_entity`, `right_entity` | Product or model-family subjects |
| `intent`, `slug`, `h1` | Canonical comparison purpose |
| `fact_keys` | Approved comparable dimensions |
| `editorial_summary` | Factual difference summary |
| `use_case_verdicts` | Conditional recommendations with rationale |
| `source_set` | Evidence for technical facts |
| `reviewed_by`, `reviewed_at` | Accountability and freshness |
| `indexable` | Quality-gated publication |

No comparison page is created merely because two products exist.

## 14B. Guided buying engine

The buyer is an interactive decision pathway over the same verified entity data:

```text
Budget and market
  → equipment/helmet type
  → riding style and environment
  → required certification or compatibility
  → fit, weight and material preferences
  → explainable product recommendations
```

Requirements:

- every answer changes an explicit query constraint or preference;
- recommendations explain which answers and facts produced the match;
- unavailable products remain distinguishable from eligible in-stock products;
- the resulting state has a shareable URL but remains noindex unless a curated
  collection separately owns the intent;
- users can revise any answer without restarting;
- no safety recommendation substitutes for professional fitting or manufacturer
  guidance.

## 14C. Product media and evidence hub

The product page can become the definitive product resource only through licensed
and attributable media:

- product photography and alternate views;
- optional 360-degree asset;
- manufacturer or original editorial video;
- short-form clips with source and usage rights;
- moderated rider photos and videos;
- manuals, warranty documents and fit guides;
- homologation/safety documents where public and applicable;
- related articles and buying guides;
- visible FAQs and genuine reviews.

Every media record requires type, source/owner, rights status, alt text or
transcript, locale, related entity and publication state. Heavy media is loaded
on demand and never allowed to damage initial product LCP.

## 14D. Brand portal architecture

Approved brand pages become compact brand portals assembled from graph relations:

- factual brand introduction with cited sources;
- available model families and product categories;
- verified technologies and certifications;
- current products and live availability;
- model-selection or buying guide;
- relevant comparisons;
- visible FAQs grounded in customer questions;
- genuine brand-related reviews;
- licensed media and recent editorial updates.

History, racing heritage, partnerships and technical claims require sources.
Sections disappear when verified content is unavailable; placeholders and
generic brand filler are not permitted.

## 14E. Page quality scoring and publication gate

The score supports editorial judgement; it never replaces it.

| Dimension | Weight | Minimum evidence |
|---|---:|---|
| Intent clarity and uniqueness | 20 | One declared primary intent and no competing owner |
| Product-set relevance | 15 | Sufficient active, correctly matched products |
| Original useful content | 15 | Reviewed introduction/guidance |
| Verified entity completeness | 15 | Required facts and provenance coverage |
| Internal graph links | 10 | Meaningful inbound and outbound relations |
| Structured-data validity | 5 | Markup matches visible content |
| Media quality and rights | 5 | Licensed, accessible media where required |
| Performance/accessibility | 10 | Automated thresholds and manual checks |
| Freshness/accountability | 5 | Reviewer and review date |

Publication rules:

- score below 70: draft/noindex;
- score 70–84: editorial review required and noindex by default;
- score 85 or higher: eligible for index approval, never automatically indexed;
- any critical failure—duplicate intent, unverified safety claim, empty product
  set, invalid canonical or inaccessible template—forces noindex regardless of
  score.

Scores are recalculated when inventory, content, evidence or performance status
changes. Editors approve indexability explicitly.

## 15. Architecture decisions

### ADR-001: Policy layer over raw taxons

Decision: add a landing-page policy entity mapped to Spree resources.

Trade-off: more administration and one additional API model. This is accepted
because it prevents taxonomy imports from controlling public indexation and
allows page-specific content without polluting visual components.

### ADR-002: Intent-specific routes

Decision: separate Search, Category, Brand and curated Collection routes.

Trade-off: legacy `/c/` redirects and route migration work. This is accepted
because each page type needs different metadata, content, UI and index policy.

### ADR-003: Hybrid crawlable pagination

Decision: server-addressable pagination enhanced with Load More.

Trade-off: more URL/history state than pure infinite scroll. This is accepted
because product depth must remain crawlable and recoverable.

### ADR-004: Explicit index approval

Decision: new landing pages default to noindex until editorially approved.

Trade-off: slower page publication. This is accepted to prevent thin pages,
duplicate intent and index bloat.

### ADR-005: Verified product facts as the graph core

Decision: build discovery, comparisons and recommendations from controlled
product facts with provenance.

Trade-off: data modelling and editorial verification must precede many advanced
experiences. This is accepted because extracting claims from prose would create
unsafe, inconsistent and unmaintainable outputs.

### ADR-006: Scored quality gate with human approval

Decision: compute page quality but retain explicit editorial approval.

Trade-off: publication is slower and requires operational ownership. This is
accepted because a numeric score cannot detect every factual, legal or
cannibalisation risk.

### ADR-007: Typed relations over opaque entity arrays

Decision: model landing-page, compatibility, editorial and evidence relations as
typed relational records with explicit ordering and moderation.

Trade-off: more tables, serializers and validation code than a JSON field. This
is accepted because typed relations provide referential integrity, targeted
cache invalidation, auditable moderation, stable API contracts and meaningful
analytics.

## 15A. Editorial governance and operations

This architecture requires named operational owners. Development completion alone
does not make the catalogue publishable.

### Roles and approval boundaries

| Role | Owns | Cannot approve alone |
|---|---|---|
| Catalogue editor | Product/entity mapping, variants, taxonomy hygiene and merchandising relations | Safety/technical fact verification |
| Technical fact reviewer | Evidence, units, certification, compatibility and disputed facts | SEO indexation or media rights |
| SEO/content editor | Intent ownership, H1, metadata, buying content and cannibalisation review | Unverified technical claims |
| Media rights reviewer | Ownership/licence, consent, transcript and usage scope | Product facts or indexation |
| Final indexation approver | Quality score review, canonical, robots, sitemap and publication decision | Cannot waive critical failures |
| Platform administrator | Permissions, vocabulary configuration and workflow integrity | Editorial/technical approval by default |

One person may hold multiple roles in a small team, but the system records which
approval capacity was used. High-risk safety and compatibility facts require a
review event distinct from the original authoring event.

### Workflow states

```text
Draft
  → evidence pending
  → technical review
  → content/SEO review
  → media-rights review when applicable
  → ready for indexation review
  → published
```

Alternative transitions:

- any review → changes requested;
- any fact → disputed;
- published → expired when evidence or review freshness lapses;
- published → suspended for legal, factual, stock-set or canonical failure;
- retired → redirected or archived according to route policy.

### Operational requirements

- role-based permissions in Spree Admin;
- immutable review/audit events;
- configurable review and expiry targets by fact/page risk;
- queues for draft, disputed, expiring and suspended records;
- notifications to the assigned owner;
- bulk taxonomy classification without bulk index approval;
- source attachment retention and version history;
- preview of cards, filters, schema and landing pages before publication;
- a publication checklist that shows unresolved critical failures;
- reporting for time in state, expiry backlog and rejected publication reasons.

No automated job may resolve a disputed fact or grant final index approval.

## 16. Delivery priorities

### P0 — vocabularies, entities and shared systems

1. Define versioned controlled vocabularies and governance.
2. Add product fact, evidence and provenance schema.
3. Add Brand, Model Family and Model entities with Spree product mappings.
4. Add compatibility and typed relationship schemas.
5. Add editorial roles, review events and workflow permissions.
6. Add the landing-page registry and admin fields.
7. Classify all existing taxons; block sitemap inclusion by default.
8. Add route, canonical, page-level robots and indexation policy.
9. Build `CataloguePageModel` and hybrid crawlable pagination.
10. Build the shared ProductCard view model and intelligence selection rules.
11. Establish the unified catalogue design system before individual page builds.
12. Add page quality scoring and explicit index approval.
13. Fix production public URL configuration and add hreflang policy.
14. Audit and moderate repeated product claims.

### P1 — page experiences and organic modules

1. Build Shop, Category and Search experiences from the unified system.
2. Build AGV as the first sourced brand portal.
3. Consolidate Pista GP RR duplicate tags into one model-family collection.
4. Add CollectionPage/ItemList/WebSite schema and internal graph links.
5. Build zero-result search recovery from real categories and brands.
6. Add sourced GEO/AEO answer modules and relevant buying guides.

### P2 — scale and optimisation

1. Build the comparison engine with a small editorially selected launch set.
2. Build the guided buying engine from verified product facts.
3. Expand the product media/evidence hub.
4. Expand approved brands and use-case collections.
5. Add search-query, comparison and zero-result analytics.
6. Measure CWV, funnel progression and organic landing-page quality.

## 17. Phase exit criteria

Architecture is ready for implementation when:

- every live taxon has a classification;
- each indexable page has one primary intent and canonical route;
- sitemap inclusion is registry-driven;
- search and filter states emit explicit robots directives;
- page-two products are accessible without client JavaScript;
- the admin workflow owns landing-page content and index approval;
- named catalogue, technical, SEO/content, media-rights and indexation owners are
  assigned;
- typed relations have integrity, ordering, moderation and invalidation tests;
- the product fact vocabulary, provenance and expiry rules are approved;
- page quality scoring cannot bypass editorial approval;
- product claims selected for catalogue modules are verified;
- production site origin, market and locale policy are confirmed.
