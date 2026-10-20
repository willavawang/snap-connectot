# Snap account connector — technical checkpoint (2026-10-19)

## Goal
Read the owner's Marvel Snap collection, card variants, currencies and collection level from an Apple-linked iPhone account, then expose a deliberately scoped, read-only snapshot to ChatGPT. No manual inventory or screenshots. General iPhone visibility is out of scope for this phase.

## Verified
- Repository: willavawang/snap-connectot; GitHub Pages hosts index.html.
- GitHub connector now has write access.
- Marvel Snap supports Sign in with Apple for game account linking: https://marvelsnap.helpshift.com/hc/en/3-marvel-snap/faq/52-how-do-i-link-my-account/
- HearthSim documents an Apple login workflow for Untapped collection syncing: https://help.hearthsim.net/en/articles/10175073-how-to-sync-my-marvel-snap-collection-on-mobile
- SnapComplete developer states their service stores an authentication token permitting reads of cards, cosmetics, currencies and collection level; independent statement, not an audited security guarantee: https://www.reddit.com/r/MarvelSnap/comments/1r5erp6/snapcomplete_update_splits_tracker_live_full/
- Apple's Sign in with Apple gives an app tokens scoped to that app, not blanket permission to read another app's account: https://developer.apple.com/documentation/signinwithapple/authenticating-users-with-sign-in-with-apple

## Unverified blockers
1. No official publicly documented Marvel Snap collection API or approved third-party developer authorization flow has been verified.
2. No evidence our own app can obtain a Marvel Snap-scoped token through its own Sign in with Apple registration.
3. No proven safe way to retrieve the full collection and currencies independently on iPhone.
4. GitHub Pages is static and cannot protect server-side secrets or refresh credentials.
5. No authenticated connection between this site and ChatGPT exists.

## Security requirements
- Do not request or paste Apple passwords, MFA codes, session cookies, access tokens, auth callback URLs, or packet captures containing credentials.
- Do not imitate Marvel Snap's Apple login or intercept another application's authentication redirect.
- Prefer documented, consent-based, revocable, read-only access. Never promise that login to our own Apple app grants Marvel Snap access.
- A backend is necessary for protected credentials if a sanctioned integration becomes available.

## Next investigation
1. Ask Second Dinner whether there is an official API, partner/developer program, or user data export that covers collection and currencies.
2. Investigate whether established trackers offer a documented user-authorized export or API (without extracting their tokens).
3. If either exists, prototype backend + authorized connection and validate a real read-only collection snapshot.
4. Otherwise explicitly label direct sync unsupported rather than present a fake login button.

## Existing site
index.html is a temporary local collection workspace, not a direct connector. Do not confuse it with proof of live sync.
