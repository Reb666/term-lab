# Working agreement

- This Git repository is the source of truth. Edit `public/`, not earlier exported copies or ZIPs.
- Before work, inspect `git status`, fetch origin, and preserve unrelated changes.
- Use focused branches: `feat/...`, `fix/...`, `docs/...`, or `chore/...`.
- Use Conventional Commits (`feat(ui): ...`, `fix(a11y): ...`, etc.). Keep commits focused and review staged diffs.
- Run `npm test` and `npm run build`. For UI changes, also check desktop/mobile, keyboard navigation, reset/cleanup and changed interactions.
- Open a pull request for subsequent changes and merge only after checks pass and required approval is available. Do not force-push `main` or rewrite published history.
- `main` is the production branch. A merge triggers the connected Cloudflare Pages build; other branches can have previews.
- Do not commit `dist/`, archives, credentials, personal server paths, or environment files.
- Preserve existing term IDs and storage keys. New terms need accurate Chinese definitions, an actual interactive demo, quiz, valid related/source links and, for UI terms, at least two variants and a comparison.
- Keep advanced visual effects separate from everyday UI. Reuse the existing design and accessible native controls where appropriate.
- Update README or validation notes when scope or deployment settings change. Describe exactly what was tested; do not claim deployment before verifying it.
