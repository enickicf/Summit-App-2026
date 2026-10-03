# Access Without Credentials

No credentials included. Original .env exists and is excluded; names in DATA_AND_SERVICES and .env.example. Do not print/source during offline restore. Codex plugin auth does not transfer automatically to Claude. Missing access means owner authentication, never replacement resources/keys.

| Service | Login/selected workspace | Safe reconnect requirements |
| --- | --- | --- |
| GitHub | https://github.com/login ; porterthevibecodegoat/Summit-App-2026 | Owner CLI/keychain/browser auth; session unverified. gh auth status read-only; never print tokens. Public HTTPS remote. Do not reuse reported shared token; rotation separately approved. |
| Vercel | https://vercel.com/dashboard ; owner team; not-alone-summit-web and summit-app-2026-admin | Web .vercel/project.json linkage exists; session unverified. vercel whoami after approved network check; owner-driven vercel login if missing. CLI secure account store remains original. |
| Supabase | https://supabase.com/dashboard/project/svertlbvvhemqiqohzmq ; Summit 2026 - ICF | Env expected original; CLI session/link unverified. Owner dashboard/CLI, no tokens printed. SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. No seed/link/migrate/reset as access repair. |
| Expo/EAS | https://expo.dev/login ; inspiring-children-foundation/not-alone-summit | ID in source; session unverified. eas whoami read-only after approved network check, owner eas login if missing. EXPO_ACCESS_TOKEN server-only; EAS_PROJECT_ID / EXPO_PUBLIC_EAS_PROJECT_ID identifiers. No casual signing regeneration. |
| Apple | https://developer.apple.com/account/ ; https://appstoreconnect.apple.com/ | Owner secure login. Signing/TestFlight incomplete; no certificates/profiles/resources/submissions created here. |
| Airtable | https://airtable.com/login ; Main NA Summit 2026, app7BHptsc1bjc3DD | Prior Codex auth interface-only, no usable pages/tables. Claude needs independently owner-approved read/tool auth. No connector tokens copied; strictly read-only. |
| Netlify RSVP | https://app.netlify.com/ ; not-alone-awards-rsvp-2026 | Owner/account/login unknown. Request original source/admin access; no replacement forms or submission exports. |
| Squarespace | https://account.squarespace.com/ ; inspiringchildren.org | Historical public reads need no login. Admin auth unverified/not needed for monorepo; no edits. |
| OpenAI | https://platform.openai.com/ ; owner project unknown ; Sept 18 key held as Netlify secret env + macOS Keychain item "not-alone-summit OPENAI_API_KEY" (value never recorded in repo/docs) | OPENAI_API_KEY, OPENAI_MODEL, ENABLE_AI server-only. Last known credits blocked model; current billing/auth unverified. Preserve deterministic fallback; no paid activation/key rotation here. |

Email/analytics/registrar/independent RSVP backend-storage identities not established; do not invent accounts/integrations. Notification/AI implementation does not authorize sends. Simulator/device caches, CLI credentials, browser sessions and operational JSON remain original secure machine. Auth status commands may contact services; none executed during migration. Offline restore uses filesystem only. Never copy cookies/tokens/keys/auth exports/private contacts/credential env into package.
