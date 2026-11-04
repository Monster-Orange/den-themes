# Den themes

Themes for [Den](https://github.com/Monster-Orange/den), and the guide to making your own.

Den is a local development appliance with a web UI. A theme sets how that UI looks: its colors in
light and dark, its fonts, its corner radius and density, and the mark in the top bar. A theme is
data, not code. It is one JSON file plus the files it points to, kept in a git repo. Den fetches it,
checks it, and applies it.

## Contents

- [The themes in this repo](#the-themes-in-this-repo) (and [Homages](#homages))
- [What a theme is](#what-a-theme-is)
- [den-theme.json](#den-themejson)
- [Both modes are required](#both-modes-are-required)
- [Contrast rules](#contrast-rules)
- [Fonts](#fonts)
- [The mark](#the-mark)
- [Make your own](#make-your-own)
- [Validate](#validate)
- [Version and publish](#version-and-publish)
- [Install](#install)
- [Repo layout](#repo-layout)
- [License](#license)

## The themes in this repo

| | Theme | Install ref | Description | Fonts |
|---|---|---|---|---|
| <img src="themes/den/mark.svg" width="28" alt=""> | **Den** (`den`) | `den/v2.0.0` | Den's default: a sheltered workspace in walnut and umber neutrals with a moss-green accent. Den ships a pinned copy of this one. | System |
| <img src="themes/monster-orange/mark.svg" width="28" alt=""> | **Monster Orange** (`monster-orange`) | `monster-orange/v1.0.0` | Warm whites and charcoal, an orange-to-red stripe. | Rubik, Space Mono |
| <img src="themes/paper/mark.svg" width="28" alt=""> | **Paper** (`paper`) | `paper/v1.0.0` | Calm paper and ink: warm off-white stock, near-black ink, an indigo accent, serif headings. | System (serif headings) |
| <img src="themes/atlas/mark.svg" width="28" alt=""> | **Atlas** (`atlas`) | `atlas/v1.0.0` | Steady and navigational: deep chart navy or pale chart paper, a sea-green heading. | Atkinson Hyperlegible |
| <img src="themes/phosphor/mark.svg" width="28" alt=""> | **Phosphor** (`phosphor`) | `phosphor/v1.0.0` | High-contrast terminal: true black or bright white, amber accent, square corners, monospace throughout, compact. | JetBrains Mono |
| <img src="themes/commit/mark.svg" width="28" alt=""> | **Commit** (`commit`) | `commit/v1.0.0` | Homage: cool neutral grays and a clear blue accent. See [Homages](#homages). | System |
| <img src="themes/clay/mark.svg" width="28" alt=""> | **Clay** (`clay`) | `clay/v1.0.0` | Homage: warm ivory and charcoal, a terracotta accent, serif headings. See [Homages](#homages). | System (serif headings) |
| <img src="themes/graphite/mark.svg" width="28" alt=""> | **Graphite** (`graphite`) | `graphite/v1.0.0` | Homage: near-monochrome black and white, soft grays, pill controls. See [Homages](#homages). | System |
| <img src="starter/mark.svg" width="28" alt=""> | **Starter** (`starter`) | not published | A plain theme to copy. | System |

### Homages

Three themes are palette homages to interfaces we admire. They are **unofficial**: not affiliated
with, sponsored by, or endorsed by the companies named, and they use none of their logos, marks,
wordmarks, fonts or assets. Only the general color feel is borrowed, and the marks are original.

- **Commit** is an homage to GitHub's interface. Its colors come from
  [Primer](https://github.com/primer/primitives), GitHub's MIT-licensed design system, credited
  in [`themes/commit/NOTICE.txt`](themes/commit/NOTICE.txt) with Primer's license.
- **Clay** is an homage to the warm ivory, clay and terracotta feel of Anthropic's Claude
  interface. Its hex values are our own.
- **Graphite** is an homage to the near-monochrome black, white and soft gray feel of OpenAI's
  ChatGPT interface. Its hex values are our own.

All product and company names are trademarks of their owners and are used here only to say what
inspired each theme.

## What a theme is

A theme is a directory with a `den-theme.json` at its top:

```
my-theme/
  den-theme.json      the manifest: colors, type, shape, mark, fonts
  mark.svg            the mark shown in Den's top bar
  fonts/              optional: woff2 files and their licenses
    some-family/
      some-family-400.woff2
      OFL.txt
```

Den reads the manifest, writes the colors and type into CSS custom properties, serves the
mark and fonts itself, and does nothing else with the files. There is no theme code: no CSS, no
JavaScript, no HTML. That is what makes a theme safe to install from someone else's repo.

## den-theme.json

The format is `den.theme/v1`, defined by a JSON Schema:

<https://raw.githubusercontent.com/Monster-Orange/den/main/schemas/den.theme.v1.json>

That schema is the authority. Put its URL in `$schema` so your editor can complete and check
fields as you type. A copy lives in this repo at `schemas/den.theme.v1.json` so the validator works
offline. `v1` only ever gains optional fields; renaming or removing a field would be `v2`.

A minimal manifest (every required field, nothing else):

```json
{
  "$schema": "https://raw.githubusercontent.com/Monster-Orange/den/main/schemas/den.theme.v1.json",
  "schema": "den.theme/v1",
  "id": "my-theme",
  "name": "My Theme",
  "version": "1.0.0",
  "license": "MIT",
  "modes": {
    "light": { "bg": "#ffffff", "...": "all 17 color tokens" },
    "dark":  { "bg": "#111111", "...": "all 17 color tokens" }
  }
}
```

[`starter/den-theme.json`](starter/den-theme.json) is a complete version of this.

### Top-level fields

| Field | Required | Value |
|---|---|---|
| `$schema` | no | The schema URL above. |
| `schema` | yes | Always `"den.theme/v1"`. |
| `id` | yes | Stable identifier: lowercase letters, digits and dashes, starting with a letter, 2 to 40 characters. Unique within its repo. Do not change it after release. |
| `name` | yes | Display name, up to 60 characters. |
| `version` | yes | The theme's own semver, such as `1.2.0`. See [Version and publish](#version-and-publish). |
| `license` | yes | SPDX identifier for the theme itself (its tokens and mark), such as `MIT` or `CC0-1.0`. Fonts declare their own. |
| `description` | no | One line, up to 280 characters. Shown in the theme picker. |
| `author` | no | Up to 120 characters. |
| `homepage` | no | A URL. |
| `den` | no | The Den versions this theme supports, as a semver range (`">=0.3.0 <0.4.0"`). Leave it out to mean any Den that reads `den.theme/v1`. |
| `default_mode` | no | `"dark"` or `"light"`: the mode to use when the user's preference is "system" and the system gives none. |
| `type` | no | Font stacks. See below. |
| `shape` | no | Radius and density. See below. |
| `mark` | no | The top-bar mark. See [The mark](#the-mark). |
| `fonts` | no | Font files shipped with the theme. See [Fonts](#fonts). |
| `modes` | yes | `{ "light": {...}, "dark": {...} }`, each a full set of color tokens. |

### Color tokens (`modes.light` and `modes.dark`)

Every color is `#rrggbb`. No names, no `rgb()`, no alpha: one format, so contrast can be checked
exactly. All seventeen color tokens are required in each mode.

| Token | Used for |
|---|---|
| `bg` | The page ground. |
| `surface` | Cards, the top bar, panels. |
| `raised` | Menus and popovers. |
| `sunken` | Wells, hover fills, code. |
| `text` | Body text. |
| `muted` | Secondary text. |
| `faint` | Tertiary text and placeholders. |
| `border` | Dividers and card edges. |
| `border-strong` | Input and control borders. |
| `accent` | Focus rings, selection, the active rail item. |
| `accent-text` | Links and accent-colored text on `bg` and `surface`. |
| `accent-fill` | The primary button's fill. |
| `on-accent` | Text on `accent-fill`. |
| `ok` | Healthy, running, passed. |
| `warn` | Degraded, needs attention. |
| `bad` | Failed, stopped with an error. |
| `remote` | Remote (cloud) services, as opposed to local ones. |

Two optional tokens take a CSS value rather than a hex color:

| Token | Value |
|---|---|
| `shadow` | A `box-shadow` for popovers, such as `0 8px 28px rgb(31 35 40 / 0.14)`. |
| `bar` | The accent stripe under the top bar: a color, a `linear-gradient(...)`, or `none`. |

A CSS value may not contain `;`, `{`, `}`, `<`, `>`, `\`, `url(`, `@import` or `expression(`.
Den writes it into a single custom property and nothing more.

### `type`

| Field | Value |
|---|---|
| `sans` | The body font stack. |
| `mono` | The monospace stack, for code, logs and commands. |
| `display` | Headings and the product name. Defaults to `sans`. |
| `ja` | A fallback stack for Japanese text. |

Each is a CSS `font-family` list. Name a family from `fonts` first if you ship one, then end with
system fallbacks, so text still renders while fonts load or if a file is missing.

### `shape`

| Field | Value |
|---|---|
| `radius` | Corner radius for cards and panels: `0`, or a number with `px` or `rem` (`8px`, `0.5rem`). |
| `radius-button` | Corner radius for buttons and inputs: as above, or `50%`. |
| `density` | `"comfortable"` (default spacing) or `"compact"` (tighter rows and padding). |

## Both modes are required

Every theme defines both `light` and `dark`. Den follows the user's choice, which is often
"match the system", and the system flips between light and dark through the day. If a theme only
had one mode, Den would have to invent the other or drop the user's choice; both outcomes are
worse than asking the author. A theme that is mostly about one mode can still say so with
`default_mode`.

## Contrast rules

Den refuses to install a theme that fails any of these in either mode. Ratios are WCAG 2.x
contrast ratios (relative luminance, `(L1 + 0.05) / (L2 + 0.05)`). There is no rounding: 4.49 fails 4.5.

**4.5:1** (the WCAG AA minimum for body text): every token Den draws text in, on every ground.

| Foreground | On |
|---|---|
| `text`, `muted`, `faint`, `accent-text` | `bg`, `surface`, `raised`, `sunken` |
| `ok`, `warn`, `bad`, `remote` | `bg`, `surface`, `raised`, `sunken` |
| `on-accent` | `accent-fill` |

`faint` is text (captions, labels, timings), so it is held to 4.5:1 like the rest; tell it apart
from `muted` by weight or size rather than by contrast.

**3:1** (the WCAG minimum for non-text UI): focus rings, selection and control borders.

| Foreground | On |
|---|---|
| `accent` | `bg`, `surface`, `raised`, `sunken` |
| `border-strong` | `bg`, `surface`, `raised`, `sunken` |

**`accent` is never text.** Den draws links and accent-colored text in `accent-text`, and uses
`accent` only for rings, selection and the active rail item. That is why a bright brand color
can be the `accent` at 3:1 while `accent-text` is a darker shade of it.

`border` is deliberately unchecked: dividers are decoration, and faint dividers are a valid choice.
`border-strong` is checked because it marks where an input is.

The validator prints every failing pair with both colors and the ratio it found, for example:

```
contrast: light: accent on bg is 2.67:1, needs 3:1 (#ff7300 on #fffcfc)
```

To fix one, move the foreground's lightness away from the background (darker in light mode,
lighter in dark mode) and keep its hue. A bright brand color that cannot pass on a light ground
can still appear in `bar` and in the mark, which are not checked.

## Fonts

Fonts are optional. If you ship any:

- Use **woff2** files only, and put them inside the theme directory. Den serves them itself,
  so the theme works offline. No CDN, no `url()`, no Google Fonts links: the schema has nowhere
  to put one.
- Ship the font's **license** next to its files (`OFL.txt` or `LICENSE`). The validator checks
  for it. Fonts under the SIL Open Font License are the easy case: redistribution is allowed as
  long as the license travels with the files.
- Declare each family in `fonts` with its SPDX license and each file's weight and style:

```json
"fonts": [
  {
    "family": "Rubik",
    "license": "OFL-1.1",
    "files": [
      { "path": "fonts/rubik/rubik-latin-400-normal.woff2", "weight": "400", "style": "normal" },
      { "path": "fonts/rubik/rubik-latin-700-normal.woff2", "weight": "700", "style": "normal" }
    ]
  }
]
```

`family` must match the name you use in `type`. `weight` is one weight (`"400"`) or a range for a
variable font (`"100 900"`). Paths are relative to the theme directory and may not contain `..`.

A latin subset at 400 and 700 is usually enough and keeps a theme small. The
[@fontsource](https://fontsource.org) npm packages are a convenient source: each package has
per-subset woff2 files under `files/` and the font's license in `LICENSE`.

Or ship no fonts and use system stacks. `den`, `paper`, `commit`, `clay` and `graphite` in this repo do.

## The mark

The mark is the small logo at the left of the top bar.

```json
"mark": { "svg": "mark.svg", "shape": "rounded" }
```

| Field | Value |
|---|---|
| `svg` | Path to an SVG file in the theme. |
| `svg_dark` | Optional dark-mode variant, if the mark does not read on both grounds. |
| `text` | Up to 3 characters Den draws itself, if you have no SVG. |
| `shape` | `"square"`, `"rounded"` or `"circle"`: the clip Den applies. |

Den shows the SVG as an image (`<img>`), never inlined into the page, so it cannot run scripts or
pick up the page's styles. Keep it that way in the file too: the validator rejects an SVG with
`<script>`, `<foreignObject>`, `on*` event attributes, XML entities, or any `href` or `url()` that
points outside the file (fragment references like `url(#gradient)` are fine). Design it to read at
22 px on both your light and dark `surface`, or provide `svg_dark`.

## Make your own

1. Copy [`starter/`](starter) into a new git repo, with `den-theme.json` at the root.
   (Or, to propose a theme for this repo, copy it to `themes/<your-id>/`.)
2. Set `id`, `name`, `author`, `description` and `license`.
3. Choose your colors. Start from `bg` and `surface` in each mode, then `text`, then work down
   the token table. Validate often; the contrast output tells you exactly which pair to move.
4. Replace `mark.svg`.
5. Add fonts if you want them, with their licenses.
6. Install it locally and look at it in both modes. Contrast numbers catch unreadable text, not ugly combinations.

## Validate

In this repo:

```sh
npm install
npm run validate
```

That checks every theme here (`starter/` and `themes/*`) for:

- the JSON Schema (draft 2020-12),
- the [contrast rules](#contrast-rules), in both modes,
- that the mark and font files exist, the SVG is clean, the fonts are woff2 and have a license
  next to them,
- that each theme's `id` matches its directory name.

It prints `ok` or `FAIL` per theme with one line per problem, and exits 1 if anything fails.

To check a theme elsewhere, pass its directory. A single-theme repo's directory name is
arbitrary, so skip the id check:

```sh
node scripts/validate.mjs --no-id-check ~/src/my-theme
```

Den itself runs the same checks on install, and will run them on demand with
`<cli> theme validate <dir>`.

## Version and publish

A theme's `version` is semver. Bump the patch for a small fix (a color nudged to pass contrast),
the minor for a visible change, and the major for a change someone who liked the old look might
reasonably not want, such as a new accent hue or different fonts.

Publishing is tagging a commit in a git repo. Any git host works, public or private, as long as
the machine running Den can clone it.

- **A repo with one theme** (manifest at the root): tag `v<version>`.

  ```sh
  git tag v1.2.0 && git push origin v1.2.0
  ```

- **A repo with several themes**, like this one (each in `themes/<id>/`): tag `<id>/v<version>`.

  ```sh
  git tag paper/v1.2.0 && git push origin paper/v1.2.0
  ```

The tag's version must equal `version` in that commit's `den-theme.json`. Never move a tag once
pushed: people have pinned it.

## Install

```sh
# a theme from this repo: <repo>/<subpath>@<tag>
<cli> theme add github.com/Monster-Orange/den-themes/themes/paper@paper/v1.0.0

# a single-theme repo of your own
<cli> theme add github.com/you/my-theme@v1.2.0
```

`<cli>` is the name of your Den distribution's command. The ref after `@` is any git ref; use a
tag. Den clones that exact ref, validates it, and caches it. The install is pinned: Den does not
follow the branch or pick up a newer tag until you run `theme add` again with the new ref. Once
fetched, the theme works offline. Den bundles a pinned copy of `den`, so the default look never
needs the network.

## Repo layout

```
README.md                  this guide
LICENSE                    MIT; fonts keep their own licenses
CHANGELOG.md
package.json               devDependencies only (ajv, ajv-formats)
schemas/den.theme.v1.json  copy of the schema, for offline validation
scripts/validate.mjs       the validator
starter/                   a complete, plain theme to copy
themes/<id>/               one directory per theme
.github/workflows/validate.yml
```

## License

The themes, scripts and docs are MIT ([LICENSE](LICENSE)). Each font under `themes/*/fonts/` keeps
its own license, which sits next to its files as `OFL.txt`:

| Font | Theme | License |
|---|---|---|
| Rubik | `monster-orange` | SIL Open Font License 1.1 |
| Space Mono | `monster-orange` | SIL Open Font License 1.1 |
| Atkinson Hyperlegible | `atlas` | SIL Open Font License 1.1 |
| JetBrains Mono | `phosphor` | SIL Open Font License 1.1 |
