# CHECKPOINT — Portfolio Demo

This is the finished, buildless CHECKPOINT portfolio demo. The folder name `prototype/` is retained for source continuity. It contains Home, Games, Game Detail, My Library, and an About page for the demo and artwork. The catalog has eight curated games; the library is stored only in the current browser.

## Run and validate

Node.js 24 or later is recommended. From this folder:

```sh
npm start
npm run check
npm test
```

Open `http://127.0.0.1:4173`. No `npm install`, database, email service, or build step is needed. To use another port, set `CHECKPOINT_DEMO_PORT` before starting the server. The deployable static folder is `dist/`, declared in `.openai/hosting.json`.

## Demo journey

1. Browse the editorial Home page, the eight-game catalog, or a game detail page.
2. Use title search, genre/platform filters, and sort on Games. Catalog state is kept in the URL.
3. Select **Try demo** to load five clearly labeled sample entries, one for each status: Wishlist, Backlog, Playing, Completed, and On Hold.
4. Save games, update statuses, search/filter My Library, and remove games. The visible Undo action restores the previous library after removal, reset, or clear until another action replaces it or the message is dismissed.
5. Use **Reset demo** to restore the original five entries or **Clear library** to start from empty. A deliberately empty library remains empty on reload and when **Continue demo** is selected.

Library entries are scoped to the browser profile and site origin. They do not sync to another device, browser, or the separate local/hosted origin. Clearing browser site data removes them. If storage is unavailable, the current page can still be used but changes will not survive a reload; the UI reports that condition. A valid prior `checkpoint.library.v1` collection is imported once without overwriting the old key.

## Source map

- `dist/index.html`: page shell, navigation, and reset confirmation dialog.
- `dist/styles.css`: visual system, responsive layouts, motion rules.
- `dist/data.js`: eight game records and official store credit links.
- `dist/demo-state.js`: validated, versioned, browser-local library state.
- `dist/app.js`: routes, discovery controls, library UI, and feedback.
- `dist/assets/`: game artwork and CHECKPOINT icon.
- `tests/`: state, recovery, isolation, asset, and packaging checks.
- `asset-sources.json`: artwork origins and current usage status.
- `serve.mjs`: local static server and preview helper.

The demo deliberately omits accounts, database-backed persistence, public reviews/profiles, admin tools, articles, and community metrics. The separate `../web/` application preserves an earlier full-stack technical implementation, but the demo does not depend on it.

Artwork and game names belong to their respective owners. The included artwork is for the existing private preview. Public reuse rights have not been established; keep the deployment private until rights are confirmed or assets are replaced. See the in-product **About this demo & artwork** page for credits.
