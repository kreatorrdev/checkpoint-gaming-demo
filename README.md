# CHECKPOINT — Interactive Design Prototype

Four connected screens demonstrate the approved editorial direction: Discover, Games, Game Detail, and My Library. The eight-game catalog is static; library state is saved in browser local storage.

## Run

```sh
node serve.mjs
```

Local URL: `http://127.0.0.1:4173`.

There is no install or build step. The deployable folder is `dist/`, declared in `.openai/hosting.json`. Private Sites hosting is used for design review; it does not implement CHECKPOINT user authentication.

## Files

- `dist/index.html`: accessible shell and navigation.
- `dist/styles.css`: visual tokens, layouts, components, and responsive/motion rules.
- `dist/data.js`: representative catalog metadata and original editorial summaries.
- `dist/app.js`: hash routing, filtering, sorting, library state, and feedback.
- `dist/assets/`: locally stored images and original checkpoint icon.
- `asset-sources.json`: exact artwork URLs and ownership/usage notes.
- `prepare-assets.ps1`: optional artwork refresh from official Steam listings; network access required. A refresh may change the visual content and must be reviewed.
- `serve.mjs`: local preview server and responsive-review wrapper.

## Intentional limitations

No real accounts, database, public reviews, admin operations, or cross-device persistence. Platform metadata uses broad families and does not describe every edition or device generation. Art remains the property of its respective owners; public-use permissions have not been established by this prototype.

See the parent project's functional specification and verification notes before continuing implementation.
