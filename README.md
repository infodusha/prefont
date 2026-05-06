# prefont

Pre-measure font character widths in real browsers, then compute text widths anywhere — including Node, SSR, edge runtimes, and workers where no DOM is available.

`prefont` ships a CLI that loads your fonts in Chromium, Firefox, and/or WebKit, measures the advance width of every character you care about, and writes the result to a JSON file. A tiny client library then turns that data into pixel-accurate text widths at any font size — without touching the DOM.

## Install

```sh
npm install prefont
# or
pnpm add prefont
```

Requires Node.js >= 20.

You will also need browser binaries for the engines you measure in:

```sh
npx playwright install chromium firefox webkit
```

## Quick start

1. Create `.prefontrc.json` at the root of your project:

   ```json
   {
     "$schema": "./node_modules/prefont/schema.json",
     "browsers": ["chromium", "firefox", "webkit"],
     "symbolSets": [{ "name": "default", "chars": "0123456789. " }],
     "fonts": [
       {
         "font": "https://fonts.googleapis.com/css2?family=Inter:wght@400&display=block",
         "family": "Inter",
         "weights": [400]
       }
     ]
   }
   ```

2. Run the CLI to measure and write the data file:

   ```sh
   npx prefont
   ```

   By default this writes `prefont.json`.

3. Use the data at runtime:

   ```js
   import data from "./prefont.json" with { type: "json" };
   import { measureTextFromData } from "prefont";

   const width = measureTextFromData(data, {
     family: "Inter",
     browser: "chromium",
     weight: 400,
     text: "1.234",
     fontSize: 16,
   });
   // → pixel width matching what Chromium would render
   ```

## CLI

```
prefont [--config <path>]
```

| Flag             | Default           | Description                                                  |
| ---------------- | ----------------- | ------------------------------------------------------------ |
| `-c`, `--config` | `.prefontrc.json` | Path to the config file (relative to the working directory). |

The CLI resolves font paths relative to the config file, launches the requested browsers in parallel, measures each font/weight/symbol-set combination, and writes a single JSON file to the configured `out` path.

## Configuration

`.prefontrc.json` is validated against [`schema.json`](./schema.json), so editors with JSON Schema support get autocomplete and inline docs.

| Field        | Type                                      | Description                                                                                  |
| ------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| `out`        | `string`                                  | Output path for the generated data, relative to the config file. Defaults to `prefont.json`. |
| `browsers`   | `("chromium" \| "firefox" \| "webkit")[]` | Default browsers used to measure every font.                                                 |
| `symbolSets` | `{ name, chars }[]`                       | Reusable groups of characters to measure. Each font measures every set unless overridden.    |
| `fonts`      | `FontItem[]`                              | Fonts to measure (see below).                                                                |

### `FontItem`

| Field        | Type             | Description                                                                                                                                                                                                                                                        |
| ------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `font`       | `string`         | Local file path (`.woff2`, `.woff`, `.ttf`, `.otf`) or a URL. URLs to font files are inlined as `@font-face`; URLs to stylesheets (e.g. Google Fonts CSS) are loaded via `<link>`. Local paths are resolved relative to the config file and embedded as data URLs. |
| `family`     | `string`         | CSS `font-family` name to register and measure.                                                                                                                                                                                                                    |
| `weights`    | `number[]`       | Weights to measure (1–1000, e.g. `400`, `700`).                                                                                                                                                                                                                    |
| `browsers`   | `BrowserName[]?` | Override the top-level `browsers` for this font.                                                                                                                                                                                                                   |
| `symbolSets` | `string[]?`      | Names of top-level `symbolSets` to use for this font. Defaults to all of them.                                                                                                                                                                                     |

### Example

```json
{
  "$schema": "./node_modules/prefont/schema.json",
  "out": "prefont.json",
  "browsers": ["chromium", "firefox", "webkit"],
  "symbolSets": [
    { "name": "digits", "chars": "0123456789. " },
    {
      "name": "ascii",
      "chars": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    }
  ],
  "fonts": [
    {
      "font": "fonts/Inter-Variable.woff2",
      "family": "Inter",
      "weights": [400, 600, 700]
    },
    {
      "font": "https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=block",
      "family": "Roboto",
      "weights": [400],
      "symbolSets": ["digits"]
    }
  ]
}
```

## API

All exports are available from the package root:

```ts
import {
  measureText,
  measureTextFromData,
  measureTextFromCanvas,
} from "prefont";
```

### `measureText(opts)`

Isomorphic helper. In a browser (when `document` is defined) it measures live via `<canvas>`. In Node/SSR it falls back to the prebuilt data.

```ts
measureText({
  family: "Inter",
  weight: 400,
  text: "1.234",
  fontSize: 16,
  // required outside the browser:
  data,
  browser: "chromium",
  // optional: width to use for any character missing from the measured set
  fallback: " ",
}); // → number
```

### `measureTextFromData(data, opts)`

Pure function. Computes the width of `text` at `fontSize` using widths captured for `family` / `browser` / `weight`. Accepts an optional `fallback` character whose width substitutes for any character not present in the data.

### `measureTextFromCanvas(opts)`

Browser-only. Measures `text` using a hidden `<canvas>` for the currently loaded font. Also accepts `fallback`.

## License

Apache-2.0. See [LICENSE](./LICENSE).
