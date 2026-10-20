# Disposable-account protocol capture

A browser HAR from an account you own can help identify **browser-visible** auth endpoints. It cannot reveal a tracker's private server-to-server Marvel Snap requests.

## Safety-first procedure
1. Create a separate Marvel Snap account through the game's supported guest/login flow. Do not reuse your main Apple identity.
2. In a desktop browser you control, open Developer Tools > Network and record the account-linking page before clicking login.
3. Observe **only** public redirects and request metadata. Do not submit random passwords, bypass anti-bot measures, or capture someone else's traffic.
4. If you export a HAR, **keep it on your own computer**. HAR files can contain live session cookies and short-lived authorization codes. Do not upload the raw file to ChatGPT, GitHub, or our public Pages site.
5. Run `node research/analyze-har.mjs private-test.har > public-summary.json` locally. Review the summary manually before sharing. It strips headers, cookies, bodies, timestamps, query values and sensitive query names, and masks opaque path segments.

## What can be learned
- Browser-visible hostnames, method, response status, path shape, and innocuous query parameter names.
- Which service controls the initial authentication redirect.
- Whether the visible client calls a game API directly or only its own backend.

## What cannot be inferred
- Game-service request details performed only by the tracker backend.
- Permission to reuse another app's OAuth client identity.
- Whether the game server enforces app attestation or device binding.

This experiment is **not yet executed**. No test account or HAR has been created by the assistant. It requires a user-controlled sign-in environment. Do not publish raw network traces.
