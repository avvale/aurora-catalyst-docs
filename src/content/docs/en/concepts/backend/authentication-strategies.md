---
title: Authentication strategies
description: The three OAUTH_STRATEGY modes — none, local-provider, aurora-hub — the BFF pattern, and how tokens flow between a hub and its satellites.
---

## Why this exists

Every Catalyst backend resolves one question at startup: **who is the identity authority?** The answer is the `OAUTH_STRATEGY` environment variable. It is read once at boot (`resolveAuthenticationMode`) and fixed for the lifetime of the process — there is no per-request switching. It has three values, and each one casts the backend in a different role.

A missing or empty value defaults to `none`, and an unrecognized value crashes the app at boot with a message listing the valid options. The default changed to `none` precisely so a fresh install boots without any identity infrastructure — but a prominent warning is logged until you choose a real provider.

## How it works

| `OAUTH_STRATEGY` | Role | What the backend does |
| --- | --- | --- |
| `none` | no authority | Every request arrives as an anonymous account with no permissions. Endpoints that declare no permission are public. A transient bootstrap state — not for production. |
| `local-provider` | **the** authority (a hub) | Issues its own tokens at `POST /api/o-auth/token` (Password, Refresh Token, and Authorization Code grants) and publishes its public key at `GET /.well-known/jwks.json` so others can verify them. |
| `aurora-hub` | a consumer (a satellite) | Issues nothing. Validates incoming Bearer tokens against an external hub's JWKS and hydrates the account from the hub. Login is delegated entirely to the hub. |

A deployment with a central identity and several delegating apps is just one hub plus one or more satellites:

```
        ┌─────────────────────────────┐
        │  HUB   OAUTH_STRATEGY =      │   issues tokens, serves JWKS,
        │        local-provider        │   owns the login UI
        └──────────────┬──────────────┘
                       │ JWKS + iamMeAccount
        ┌──────────────┴──────────────┐
        │              │              │
   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
   │satellite│    │satellite│    │satellite│   OAUTH_STRATEGY = aurora-hub
   └─────────┘    └─────────┘    └─────────┘   (delegate login to the hub)
```

### The Authorization Code flow

When a satellite delegates login it uses the OAuth 2.1 **Authorization Code flow with PKCE**. The satellite backend acts as a **Backend-for-Frontend (BFF)**: it is the confidential OAuth client, so the client secret lives only on the satellite backend and never reaches the browser.

```
SPA ─/auth/login─▶ satellite BFF ──302 /authorize?code_challenge,client_id=aurora,state─▶ HUB
                   (stashes code_verifier by state)                                        │
HUB (no session) ─302─▶ HUB /sign-in?continue=…  → user logs in → hub_session cookie set   │
HUB ──302 redirect_uri=…/callback?code=&state=─────────────────────────────────────────────┘
SPA /callback ─POST {code,state}─▶ BFF ──POST /token (form, Basic, code, redirect_uri, verifier)─▶ HUB
HUB ──{ access_token, refresh_token }──▶ BFF ──▶ SPA token store
```

Two decisions keep this safe:

- **PKCE S256 is mandatory.** The BFF generates a `code_verifier`, sends only its SHA-256 `code_challenge` to the hub, and keeps the verifier server-side keyed by `state`. The verifier never touches the browser; the hub rejects a missing or `plain` challenge.
- **The hub session is a cookie, not a token in a URL.** After login the hub sets an `httpOnly` RS256 JWT cookie (`hub_session`, ~8h) so the user is not re-prompted on the next `/authorize`. The token is POSTed to establish it — never placed in a query string.

### How a satellite reads identity

In `aurora-hub` mode the satellite issues nothing. On each request it validates the Bearer against the hub's `/.well-known/jwks.json` (RS256) and hydrates the account by calling the hub's `iamMeAccount` GraphQL query with the user's token. Authorization is then resolved from `dPermissions` — the OAuth `scope` is a cosmetic passthrough and grants nothing in this first-party model.

## When it applies

- You see the boot warning that `OAUTH_STRATEGY=none` and need to pick a real provider.
- You are wiring a new app to delegate login to an existing hub — see [Connect a satellite to an Aurora Hub](/aurora-catalyst-docs/en/tutorials/getting-started/install-satellite/).
- You are debugging a `401 invalid_client` or `400 invalid_request` during the Authorization Code round-trip.

## Trade-offs and limits

- **`none` is bootstrap-only.** It exists so a clean install boots; ship it to production and every endpoint without a declared permission is open.
- **`aurora-hub` still reads a private key at boot.** Although a satellite validates via the hub's JWKS and never signs anything, the JWT signer is constructed at startup and reads `OAUTH_PRIVATE_KEY_PATH` for any mode other than `none`. A satellite therefore needs `.keys/oauth-private.key` present or it crashes at boot — generate it with [`catalyst keys`](/aurora-catalyst-docs/en/reference/cli-commands/keys/) even in hub mode.
- **One redirect URI per client.** `OAuthClient.redirect` is a single string and is matched exactly; a client serves one satellite callback.
- **The PKCE verifier store is in-memory.** It is correct for a single-instance satellite; behind multiple replicas a verifier stashed on one instance is invisible to another, so a shared store is needed before scaling out.
- **Token revocation has a cache lag.** The hub-validation cache holds an account for a few minutes, so permission changes are not strictly instant.

## Related

- [Connect a satellite to an Aurora Hub](/aurora-catalyst-docs/en/tutorials/getting-started/install-satellite/) — the practical recipe.
- [`catalyst keys`](/aurora-catalyst-docs/en/reference/cli-commands/keys/) — generate the RSA key pair.
