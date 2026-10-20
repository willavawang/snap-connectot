# Private Marvel Snap API client prototype

This is a **server-side read-only HTTP adapter**, not a connected Marvel Snap account.

## Verified
- Apple account linking is documented by Marvel Snap.
- Third-party trackers report mobile collection syncing.
- Neither the actual Marvel Snap read endpoint nor an independent client authorization grant has been verified.

## Implemented
- Strict HTTPS and explicit hostname approval.
- GET-only request method, no redirects, JSON response validation, 10-second timeout and 2MB cap.
- No credentials embedded in source or stored in browser.
- Mock-based tests for request behavior and rejection cases.

## Run tests
`node --test research/read-client.test.mjs`

## What is still required for a real read
1. A **verified and permitted** Marvel Snap API hostname and read-only path.
2. A legitimate account authorization grant issued for this integration.
3. A backend with protected credentials and access controls. GitHub Pages cannot provide that.

Do not paste Apple sign-in redirect URLs, session cookies, authentication codes, or tokens into this repository, site, or chat. This module intentionally does not invent or probe undocumented endpoints.
