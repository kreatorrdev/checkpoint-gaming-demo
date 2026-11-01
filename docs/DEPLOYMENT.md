# CHECKPOINT deployment

## Local preview and checks

Use Node.js 24 or later. From the repository root:

~~~sh
npm start
npm run check
npm test
~~~

Open http://127.0.0.1:4173. No dependency installation or build step is required. The optional CHECKPOINT_DEMO_PORT environment variable selects a different local port.

## Static hosting

Publish the contents of dist/. The site uses hash-based navigation and browser-local storage. Keep app.js, data.js, demo-state.js, stylesheets, fonts and image files together. vercel.json declares the buildless dist/ output; .openai/hosting.json records the original Sites output folder.

The existing Vercel URL is https://checkpoint-gaming-demo.vercel.app. The repository README records the connected main branch and the last known Vercel access protection. Source visibility and hosted access protection are separate settings; making the repository public does not remove the site's access gate.

## Release review

Review Home, Games, a game detail, My Library and the artwork/about page. Verify search/filter URL state, saved statuses, Undo, reset, empty-state persistence and an unavailable-storage message. A library is scoped to its browser profile and origin; local and hosted libraries do not synchronize.

## Artwork

Read ../asset-sources.json and the in-product credits. Game names and artwork belong to their owners. Public source availability does not establish permission to redistribute or commercially reuse third-party artwork. Retain attribution and confirm rights before reusing assets in another publication.
