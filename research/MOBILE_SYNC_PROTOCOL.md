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

## Protocol refinement: loopback callback clue (verified against primary help documentation)

Untapped's official step-by-step instructions distinguish **two** callback forms:
- **Google**: an expected failed browser navigation to a loopback address similar to `127.0.0.1`, whose complete URL is submitted within 45 seconds.
- **Apple**: a redirect to an **Apple page**, whose complete URL is submitted within 45 seconds.

Source: https://help.hearthsim.net/en/articles/10175073-how-to-sync-my-marvel-snap-collection-on-mobile (lines 47–73)

This is **not a standard third-party web OAuth flow**. The Google loopback address is a strong clue that the flow reuses an authentication handoff intended for a local/native application; Untapped collects the resulting callback URL in a separate browser tab. This is an inference, not a confirmed implementation detail. The Apple callback differs and must be studied independently.

### Consequences for our implementation
- Do not substitute a generic Sign in with Apple widget. The grant is associated with the original game client, not necessarily ours.
- Do not ask users to paste complete callback URLs into our public GitHub Pages site; such URLs can carry live credentials or codes.
- A legitimate integration requires verifying that reuse of the game client's authorization grant by an independent client is permitted, or obtaining our own registered grant.
- The `/collection` bridge must remain disabled until we have a verified endpoint and authorization mechanism.

### Tested access limitation
An unauthenticated request to `https://snap.untapped.gg/en/mobile-tracker` via the available web retrieval service failed; direct runtime DNS resolution of that host also failed. No bundle source was retrieved, and the public JavaScript inspector remains unexecuted.

## Independent corroboration: multiple server-side account sync services (2026)

Three independent tracker announcements corroborate remote account reads, rather than relying on one vendor's claims:

1. **SnapComplete** developer states that after Google/Apple sign-in, its service stores an authentication token that can **read owned cards, cosmetics, currencies and collection level**, but cannot modify the game account. Crucially, Apple *game account sync* works without Apple *site account sign-in*. https://www.reddit.com/r/MarvelSnap/comments/1r5erp6/
2. **SnapVault** announced automatic game sync on 2026-02-22, including collection level, owned cards, variants, decks, and periodic refresh. https://www.reddit.com/r/MarvelSnap/comments/1rblzmc/
3. **Untapped** announced mobile collection sync on 2024-11-16 and explicitly confirmed that the method works on iOS, independent of where the game is installed. https://www.reddit.com/r/MarvelSnap/comments/1gswe56/

### Technical implication
The target response likely contains collection, cosmetic, currency and progression data accessible under a game-account-scoped token. This is independently described by a service implementer but **not** verified by observing raw game-server requests.

### What these sources do NOT establish
- The token's issuer, precise type, scope, refresh protocol, or revocation mechanism.
- The upstream game API hostname, read path, or wire format.
- Permission for third-party independent clients to reuse the existing trackers' auth handoffs.

**Avoid a false lead:** Public `marvel-snap-api` repositories offering card metadata are not authenticated account-data APIs.

### Next evidence threshold
Only configure the read bridge after finding an actual documented or openly implemented authorization protocol and read endpoint. Neither a publicly posted short-lived Apple callback URL nor another site's token should be collected.

## Game-client architecture investigation: confirmed local client state schema

GitHub code search identified a previously unexamined independent parser:
https://github.com/sergiodias25/Snap_Player_Stats/blob/main/assets/data_parser.py

Its actual Python source was fetched and inspected. It identifies game-client state paths for **Windows, Linux/Proton, and Android**. Android:
`/sdcard/Android/data/com.nvsgames.snap/files/Standalone/States/nvprod/{ProfileState,CollectionState,ShopState}.json`.

It reads nested `ServerState` objects. Verified paths in the parser include:
- `ProfileState.json -> ServerState.Account.SnapId`
- `ProfileState.json -> ServerState.Account.Name`
- `ProfileState.json -> ServerState.RankLog.CurrentRankDetails.Rank`
- `ShopState.json -> ServerState.Account.ProductPurchaseCount`

**Inference:** Marvel Snap's native client stores a locally materialized snapshot of account/server state, which is parsed independently on desktop and Android. This provides a concrete response/data model to target, but does **not** expose the network endpoint that populated it. The Android filesystem path is not an iOS path.

The publicly available PlayFab Unity SDK is **not evidence that Marvel Snap uses PlayFab**. Do not assume its hostnames or authentication methods apply to this game.

### Independent-client viability
An API-compatible reader could work if the backend accepts independently authorized clients. It could fail if the server binds sessions to registered app identities, device attestation, cryptographic signatures, or version-specific client behavior. None of these requirements has been confirmed or excluded for Marvel Snap. Avoid pretending to be the official client or attempting to bypass such protections.

### Terms caveat
Second Dinner's published June 2025 terms prohibit certain reverse engineering and automated interactions, subject to applicable legal and jurisdiction-specific exceptions:
https://global.platform.seconddinnertech.com/documents/obj/ies-hotsoon-draft-sg/Snap/snap_terms_of_service_en.html

## Client networking hypothesis tested against tracker source

Fetched and inspected:
- https://github.com/Razviar/marvelsnaptracker/blob/master/src/main.ts
- https://github.com/Razviar/marvelsnaptracker/blob/master/src/app/auth.ts

**Correction to a misleading clue:** `setCreds()` in this tracker is NOT a Marvel Snap account authorization exchange. The source shows it reads `settingsStore.getAccount()` and sends account settings to its Electron renderer, configuring hotkeys/overlay preferences. The startup function calls `createGlobalLogParser()`. This is a desktop tracker that parses client state; its `auth.ts` is tracker application state, not evidence of the game-server login protocol.

The separate open-source `Snap_Player_Stats` Android parser confirms native game state is available as JSON snapshots, but again does not show the game client's network layer.

### Client recognition question
The protocol could accept a bearer credential without strong client checks, or it could enforce device/app attestation, cryptographic request signing, version negotiation, or session-binding. **No public code examined so far establishes which applies.** Do not conclude that a standalone API client can authenticate merely from the existence of Untapped and SnapComplete.

### Next source class to inspect
A public game-client binary's network-related metadata or an independently published, permissioned network trace from a disposable test account. Tracker `auth.ts` files are false leads.
