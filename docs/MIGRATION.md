# Consolidation inventory

Consolidated on 2026-09-24 into https://github.com/mguhlin/nspa.

| Source | Content preserved | New location |
|---|---|---|
| `mguhlin/creations`, `main:nspa/` | Full training series index, external slide/recording links, guides, scenarios, prompts, assessments, and seven project examples | `resources/` |
| `mguhlin/nspa3`, `main` | Office automation collection; alternate filenames retained as redirects | `resources/` |
| `mguhlin/nspaaifluency`, **`gen2`** (actual Pages source) | Live AI fluency assessment and existing illustration | `resources/ai_fluency_levels.html` |
| Supplied `2026_NSPA_PPT_Template.pptx` | Original background artwork and actual slide colors | `assets/`, `docs/DESIGN.md` |

No other repositories named for NSPA were found among the account's repositories. NSPA blog articles remain at their editorial URLs and are linked by the preserved training index. Unrelated applications in `creations` remain there.

## Redirect strategy

`redirect-map.json` lists 65 legacy URL forms, including the old standalone repositories, every HTML page in `creations/nspa/`, and the previously broken `creations/nspa3/` path. Redirects use exact resource destinations and preserve query strings and hash fragments in JavaScript. No-JavaScript visitors receive a meta refresh and a visible destination link. These are browser redirects because GitHub Pages does not provide configurable HTTP 301 rules.

The former training index goes to `resources/index.html`, preserving its session sections and original anchor IDs. The new homepage is an additional curated index, not a replacement that discards original resource links. Non-HTML legacy assets remain served at their old locations to preserve direct downloads and image embeds. Old repository history is retained.

The standalone fluency repository's `main` branch has a pre-existing redirect, but Pages serves `gen2`. Both branches are updated during cutover.

## Known inherited limitations

- Six examples use direct AI service requests without a configured service, or are source-only prototypes. They are retained and explicitly labeled. Their generation functions are not represented as working public tools.
- `vc/dreg.html` originally contained raw React source instead of a runnable HTML page. It now provides an explanatory page and download of the original source (`deadline-reminder-source.jsx`).
- The marketing assessment retains its existing Google Apps Script endpoint. This migration does not change its backend or submit test participant data.
- External slide decks, videos, articles, and third-party services remain external. Their availability and account permissions are not controlled by this repository.
- The conference page intentionally contains no invented session title, session time, presentation, or handout. These will be added after the supplemental materials arrive.

## Verification

`python3 scripts/check_site.py` checks local links/assets and every redirect destination. Browser checks cover search, topic filtering, empty results, no-JavaScript library access, representative legacy resources, and mobile overflow. Public build staging explicitly excludes supplemental resources and planning documents.

## Source snapshots

- `creations-main` / `main`: `798fa19fcfa99076a2fd81ce4c70b7881080ef72`
- `nspa3` / `main`: `e9ca7604ebb0b3ffb9d98f04177b56bf3ba4e035`
- `nspaaifluency` / `gen2`: `9380f13ca7537de2ce16c5e56bafe81ace51d32e`
