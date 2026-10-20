# Marvel Snap mobile sync: evidence-based protocol investigation
Updated 2026-10-19

## Primary evidence
HearthSim/Untapped's own documentation: https://help.hearthsim.net/en/articles/10175073-how-to-sync-my-marvel-snap-collection-on-mobile

**Verified behavior:**
- Untapped requires a separate Untapped account.
- User selects Apple or Google as their *Marvel Snap* login method.
- User signs in to Marvel Snap and is redirected to a page.
- The user copies the **entire resulting URL** back to Untapped.
- The URL expires after about **45 seconds**.
- After linking, the user can click **Sync Now** without redoing Apple sign-in.
- Untapped provides an **Unlink Account** control.

**Architectural inferences (not independently verified):**
- The redirected URL probably carries a short-lived authorization artifact.
- Untapped likely exchanges the artifact for a longer-lived game-service credential, which enables subsequent syncs.
- The backend likely contacts a game account API, but the actual host, path, grant, and response format are not publicly documented here.
- The original redirect URL may contain a sensitive authorization code. Never request or store it for analysis.

## Negative evidence and false leads
- Official Marvel Snap account linking help documents sign-in, not third-party developer scopes: https://marvelsnap.helpshift.com/hc/en/3-marvel-snap/faq/52-how-do-i-link-my-account/
- Apple web Sign in requires *our own* Services ID and callback registration; this does not authorize our app to query Marvel Snap: https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple
- Public b-gaona/marvel-snap-api is a Kaggle-derived static card/deck dataset, not an account API: https://github.com/b-gaona/marvel-snap-api/blob/master/server/public/documentation.html
- Open-source local tracker Razviar/marvelsnaptracker reads game-client data and uploads it to its own server; not proof of remote mobile login implementation: https://github.com/Razviar/marvelsnaptracker
- Public Untapped help article reveals flow but **not source code or private backend endpoint**.

## What the private API client still needs
1. Independently verified, permitted account-service origin and read-only collection route.
2. A legitimate authorization artifact issued to this integration, with user consent and revocation.
3. Credential-safe backend deployment; GitHub Pages cannot store game credentials.
4. A live response from a test account before claiming it can retrieve a collection.

## Outcome
The login handoff and subsequent sync are **confirmed**, but its backend exchange is **not reproduced**. Do not fabricate hostnames or token grants, scrape credentials, or ask the user for Apple redirect URLs. A test with invented credentials would not establish a real authentication flow.

## Next investigative avenues
- Inspect published browser JavaScript for *non-secret* endpoint and protocol names; browser code cannot expose server-side secrets or implementation.
- Find a maintained open-source account-service client that documents the game-service protocol, distinct from local file parsers.
- Establish a registered, revocable authorization route, or an authorized export interface.

## 2026-10-19: current live-site verification

Untapped's public Mobile Tracker landing page is accessible at https://snap.untapped.gg/en/mobile-tracker and currently states:
- The mobile tracker is free.
- One-time account linking enables collection sync and match tracking across devices.
- Account linking requires logging into Untapped; the public page does not expose the protected linking screen.
- It explicitly distinguishes mobile remote tracking from the PC companion's overlay.

Source: https://snap.untapped.gg/en/mobile-tracker

### Investigation limitations
- Public web retrieval of this landing page exposes content but no verified backend endpoint, OAuth client registration, or executable protocol.
- Direct source download from this execution environment failed at DNS resolution, so no JavaScript bundle inspection was performed. Do **not** claim to have reverse-engineered Untapped's client code.
- The public card/deck APIs found in search are static card metadata services, not player-account endpoints.
- A dummy authentication attempt against a guessed game host would not establish which grant Untapped uses.

### Concrete next evidence required
- A public source map / frontend bundle containing *nonsecret* account-link route identifiers, or
- A documented game-account grant supported for independent clients, or
- A legitimate account-data export route.

**No private account connection exists yet.** The repo's server is a generic read-only scaffold with no configured upstream.
