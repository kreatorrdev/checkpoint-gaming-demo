# Contributing to CHECKPOINT

Project documentation and contribution descriptions are maintained in English. Literal interface labels, identifiers and recorded output may retain their original language when needed for accuracy.

## Set up a working copy

No dependency installation, build, database or account setup is required. Use Node.js 24 or later and run `npm start`; open http://127.0.0.1:4173.

Run project commands from the repository root.

## Make and validate a change

1. Create a focused branch from the current default branch and read the relevant specification and current status.
2. Make the change and update the affected English documentation.
3. For application changes, run the applicable checks below and inspect the affected experience.
4. Review the diff and open a pull request describing the problem, resulting behavior and checks actually performed. For documentation-only changes, verify links, paths and commands; a full application build is needed only if the change affects it.

~~~sh
npm run check
npm test
~~~

Check catalog search, filters, sorting, game details, all five library statuses, Undo, reset, empty-library persistence and storage failure feedback. Keep browser-local demo data separate from any account-backed product.

## Content and configuration

Game artwork and names belong to their respective owners. Read `asset-sources.json` and the in-product artwork disclosure before changing or reusing them. A public repository does not establish artwork reuse rights.

Use your own local configuration. Commit configuration templates with placeholders; keep real credentials, runtime databases, personal records and generated build caches out of Git. Do not add a license or claim redistribution rights for third-party material without the owner's decision.

## Release notes

The deployable directory is `dist/`; there is no build step. See [deployment](docs/DEPLOYMENT.md).

Report dated verification honestly. Existing historical PASS records describe their recorded environment and do not establish that a new checkout or deployment has passed the same checks.
