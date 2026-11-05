# Changelog

Each theme is versioned on its own and tagged `<id>/v<version>`. This file
records releases of every theme in the repo, newest first.

## 2026-11-04: monster-orange 1.1.0, schema sync

- `monster-orange` 1.1.0: light `accent-text` is burnt orange `#a34a00`
  (5.2:1 or better on every light ground), not rust `#af0900`, which is also
  `bad`. Links no longer read as errors in light mode. Dark is unchanged.
- `schemas/den.theme.v1.json` synced with Den 0.3: a theme's and a font's
  `license` share one rule, an SPDX expression; UNLICENSED, NONE and
  NOASSERTION are refused. Every theme here already complies.

## 2026-11-04: first set

First set of themes, written against `den.theme/v1`.

- `den` 2.0.0: Den's default look, now an original palette: walnut and umber
  neutrals with a moss-green accent, a moss-to-umber stripe, and a redrawn
  doorway mark. System fonts. (1.0.0 was never released; it reused GitHub's
  Primer colors, which now live in `commit`.)
- `commit` 1.0.0: homage to GitHub's interface, using Primer's MIT-licensed
  colors (credited in `themes/commit/NOTICE.txt`).
- `clay` 1.0.0: homage to the warm ivory and terracotta feel of Claude's interface.
- `graphite` 1.0.0: homage to the near-monochrome feel of ChatGPT's interface.
- `monster-orange` 1.0.0: warm whites and charcoal, Rubik and Space Mono.
- `paper` 1.0.0: paper and ink, serif headings.
- `atlas` 1.0.0: chart navy and sea green, Atkinson Hyperlegible.
- `phosphor` 1.0.0: high-contrast terminal, JetBrains Mono.
- `starter` 0.1.0: a plain theme to copy. Not meant to be installed as is.
- The three homages are unofficial and unaffiliated; see the README.
- `scripts/validate.mjs`: schema, contrast, file and id checks. Contrast: every
  text token (faint included) at 4.5:1 and accent and border-strong at 3:1, on
  all four grounds; unrounded. accent is never text.
