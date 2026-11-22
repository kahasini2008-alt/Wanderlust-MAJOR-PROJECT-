# Security review: deployment secrets

Reviewed on 2026-11-22.

## Summary

No committed credential values were found in tracked files or in the 83 reachable Git commits scanned for common secret patterns. The worktree was clean during the review. The local `.env` file is ignored by Git, and no environment files were found in the scanned history.

This is a scoped repository review, not a guarantee that every credential or external service configuration is safe. Keep production secrets in the hosting provider's environment settings, and rotate any credential that may have been exposed elsewhere.

## Findings

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | 🟡 MEDIUM | `.gitignore` | 1 | Only `.env` is ignored; variants such as `.env.local` and `.env.production` could be accidentally staged. | 9/10 |
| 2 | ⚪ LOW | `views/listings/show.ejs` | — | `MAP_TOKEN` is sent to the browser. This is expected for a public client-side map token; use a public token restricted to required origins and permissions, never a private token. | 8/10 |

## Configuration notes

- `app.js` and `cloudConfig.js` read the database URL, session secret, and Cloudinary API credentials from environment variables; no literal values were found there.
- Git's ignore rule does not hide files from the machine or deployment. It prevents matching untracked files from appearing as ordinary candidates for staging; it does not untrack files already committed.
- Add explicit ignore rules for environment-file variants, with an exception only for a placeholder-only example file if one is needed.
