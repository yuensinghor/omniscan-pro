# BarcodesScanner Pro (OmniScan Pro)

A household and small-business inventory app. Users scan groceries with an Android phone camera or a dedicated ESP32 + GM65 barcode scanner. Inventory changes are stored in Supabase and synchronized to the phone.

> **Project status (2026-11-17): pre-release.** The app is being tested privately. It has not been published on Google Play. The current local source contains family-sharing/security changes and a new icon that are not in an already-installed APK until a new EAS build is created.

## Start here

- Mobile app entry point: `App.tsx`.
- App screens: `src/screens/`.
- Supabase Edge Functions: `supabase/functions/`.
- Supabase migrations currently in this repo: `supabase/migrations/`.
- Expo configuration: `app.json`; EAS profiles: `eas.json`.
- Selected app icon: `assets/icon.png`; Android adaptive foreground: `assets/adaptive-icon.png`.
- ESP32 firmware source is **not available** in this repository.
- The website and invite landing pages are in a separate repository, `barcodesscanner-web`.

The README is a handoff and overview. For exact behavior, inspect the current source and, when connected, the live Supabase project. Old notes elsewhere in the repository may be stale.

## 1. Product and main flows

### Inventory

- Sign in or create an account with Supabase Auth email/password.
- View products, quantities, categories, and images in the dashboard.
- Use the phone camera for **Scan In**, **Scan Out**, or **Lookup**.
- Use the dashboard `+` / `−` controls or numeric keypad to adjust stock.
- Open the activity history (latest 100 entries).
- Add/edit products and upload product photos.

### Hardware scanner

The ESP32 + GM65 scanner joins Wi-Fi after Bluetooth provisioning from the phone. During ordinary use it sends barcode, action, and device identifier to Supabase `scan-handler`; it does not use the phone as a scanning relay.

### Family inventory sharing

The owner can generate an invitation link from **Profile → Family Sharing**. A new member joins as **Viewer**. The owner can change that member to **Editor** or remove them.

| Role | Read inventory/history | Change product or quantity | Use phone scan bar | Manage scanners / invite members |
|---|---:|---:|---:|---:|
| Owner | Yes | Yes | Yes | Yes |
| Editor | Yes | Yes | Yes | No |
| Viewer | Yes | No | No | No |

The app hides controls for viewers, and Supabase Row Level Security enforces the permissions on database reads and writes. An invitation is currently a **single-use link**, expires after 7 days, and defaults to Viewer. Generate one link per family account. Family sharing is distinct from the public single-product share page.

### Sharing status to know

- Family sharing is wired through the mobile app, database policies, and membership Realtime. The latest local code and database changes have **not yet had a complete two-account device acceptance test**.
- The current UI shares an invitation by link using the phone share sheet. The `send-invite` email Edge Function exists, but the current Family Sharing screen does not call it and does not currently offer a join-code entry flow.
- The app selects the most recently joined shared workspace automatically. There is no workspace picker for switching among multiple shared workspaces.
- A link opens the app directly only if Android App Links are verified. `app.json` has the intent filter; the separate website must serve a valid `/.well-known/assetlinks.json` matching the release signing certificate. This website configuration has not been verified from this repository.
- The public item-share page depends on the separate website route and the `share-item` function. Its current Edge Function Play Store CTA uses a package ID that differs from `app.json` (`com.omniscanpro.app` versus `com.barcodesscanner.pro`); correct and test this before store release.

## 2. Architecture

```text
Phone app (Expo / React Native)
  ├─ Supabase Auth: email/password, persisted session in AsyncStorage
  ├─ Postgres Data API: inventory_summary, inventory_history, products, inventory_logs
  ├─ Realtime: inventory changes and workspace membership changes
  ├─ Storage: profile and product images
  └─ Bluetooth LE: configure scanner Wi-Fi only

ESP32 + GM65 ── Wi-Fi / HTTPS ──> scan-handler ──> Postgres
                                      └──────────> swift-action (product lookup)

Family Sharing screen ──> workspace RPCs / invite table / membership policies
Public product link ──> share-item Edge Function ──> escaped HTML product page
```

### Inventory data model

- `products`: product metadata. Product identity is scoped to an owner and barcode; app upserts use `(barcode, owner_id)`.
- `inventory_logs`: signed quantity events. `quantity` is added to determine stock; `IN` is positive and `OUT` is negative. Manual quantity changes write the difference as one event.
- `inventory_summary`: view joining products and summed log quantities. Used by the dashboard.
- `inventory_history`: history view with product display name. The app queries the latest 100 rows.
- `devices`: scanner MAC address and the owner account it belongs to.
- `workspaces`, `workspace_members`, `workspace_invites`: family-sharing workspace, roles, and invitations.
- `shared_items`: separate token table for public per-product share links.
- `feedback`: profile feedback submissions.

Supabase Storage has public `avatars` and `product-images` buckets (5 MiB per file). Anyone with an object URL can read an image; signed-in users can upload/update/delete only within a folder named for their own user ID. Product-photo paths therefore remain tied to the uploader, even when the database product belongs to a shared workspace.

The two inventory views were inspected in Supabase and have `security_invoker=true`, so underlying RLS policies apply to view queries. Deleting a product in the current mobile screen deletes its matching log rows too; do not describe the history as permanently retained after product deletion.

### Mobile data ownership

The active inventory owner ID is either the signed-in user's ID or the owner ID of the selected shared workspace. Dashboard queries, history, mobile scans, product edits, and Realtime filters use this inventory owner ID. Product-photo uploads still use the signed-in user's storage folder, as required by the existing Storage policy.

### Screens and modules

| Path | Responsibility |
|---|---|
| `App.tsx` | Auth lifecycle, current workspace/role, inventory loading, deep links, Realtime, overlays, scan-result handling |
| `src/screens/AuthScreen.tsx` | Email/password sign-in and account creation |
| `src/screens/DashboardScreen.tsx` | Inventory grid, search/categories, quantity controls, keypad, undo, camera scan bar |
| `src/screens/ScanScreen.tsx` | Camera barcode scanning and manual barcode input |
| `src/screens/NewItemScreen.tsx` | Add product details and initial stock for a new barcode |
| `src/screens/EditItemScreen.tsx` | Product edit, read-only details, delete, image upload, public item share |
| `src/screens/HistoryScreen.tsx` | Recent inventory events |
| `src/screens/ProfileScreen.tsx` | Profile/avatar, history, scanner setup, family sharing, feedback and tier display |
| `src/screens/FamilySharingScreen.tsx` | Create/share invite links, view members, change roles, remove/leave workspace |
| `src/screens/ProvisioningScreen.tsx` | BLE Wi-Fi provisioning flow for ESP32 scanner |
| `src/services/EspProvisioning.ts` | Espressif provisioning protocol wrapper |
| `src/lib/supabase.ts` | Supabase client using `SUPABASE_URL` and `SUPABASE_ANON_KEY` |
| `src/i18n.ts` | English and German strings |
| `src/hooks/`, `src/components/`, `src/config/adConfig.ts` | Ad stubs/config and shared components |

## 3. Scan and inventory behavior

### Hardware scan

1. `scan-handler` validates the barcode, action (`IN` or `OUT`), and scanner identifier.
2. It finds the scanner in `devices` and resolves its `owner_id`. An unregistered scanner is rejected.
3. A rate-limit RPC limits scanner requests.
4. It calls `swift-action` for product details and uses a barcode-based fallback if lookup fails.
5. It writes product metadata when needed and inserts a signed quantity row into `inventory_logs` using the service-role key.
6. The database negative-stock trigger rejects an OUT that would take stock below zero.
7. Realtime delivers the inventory change to app clients allowed to read that owner's inventory.

### Phone scan and manual quantity changes

- A phone scan inserts directly as the signed-in user, or as the active shared workspace owner for an Editor.
- A Viewer cannot open the phone scan bar; the database also rejects Viewer writes.
- Setting stock from 2 to 50 inserts a `+48` event; it does not overwrite prior events.
- Undo inserts the inverse quantity event.
- An unknown barcode scanned IN opens the new-item form. An unknown barcode scanned OUT is rejected.

### Product lookup

`swift-action` validates input, authenticates either a signed-in app request or the private server-to-server scanner request, and applies rate limits. Source order is Open Food Facts, Open Beauty Facts, Open Products Facts, UPCitemdb, optional Go-UPC, optional BarcodeLookup, and optional Groq identification/category normalization. External provider keys belong in Supabase Edge Function secrets, never in the app.

## 4. Supabase backend

The connected project is named “Inventory with scanner”. Its project reference is intentionally omitted here; obtain it from the app's configured Supabase URL or dashboard. The local `supabase/config.toml` project ID is a CLI project name, not a service-role credential.

### Current database security behavior

The following changes are represented by migrations in this repository and have been applied to the connected Supabase project:

- Public database function execution defaults were restricted; the workspace RPCs validate the authenticated caller and retain explicit authenticated grants where needed.
- Trigger functions use a fixed empty search path and qualified object names.
- Shared product-link operations are scoped to the owner's product; HTML output escapes user-controlled values.
- Workspace membership insertion is controlled by validated owner/invite flows; self-leave and owner removal are policy constrained.
- Inventory tables permit owner access, Editor read/write access to a shared owner's rows, and Viewer read-only access through private membership-check helpers.
- The inventory views use invoker security so base-table RLS remains in force.
- Edge rate-limit state is kept in the private schema and direct client access is denied. Scanner, product lookup, and invite requests use the rate-limit RPC.
- Workspace membership is in the Realtime publication for role/member changes.
- `get_my_workspace` prefers a joined/shared workspace over an owned one, and prefers the most recently joined shared one. There is no explicit switching UI yet.

This is not a penetration test and does not prove every table/policy in the project is correctly configured. After recent database changes, Supabase Security Advisor still reported seven authenticated-callable `SECURITY DEFINER` workspace RPC warnings (review their caller checks before changing them) and the Auth setting **Leaked Password Protection Disabled**. Recheck live advisors before public release.

### Migrations

Local migration files, in order:

1. `20261117204200_secure_workspace_rpcs.sql`
2. `20261117204432_harden_current_function_defaults.sql`
3. `20261117205247_harden_trigger_function_search_paths.sql`
4. `20261117210041_tighten_share_and_membership_policies.sql`
5. `20261117210401_add_edge_rate_limits.sql`
6. `20261117210620_deny_direct_api_rate_limit_access.sql`
7. `20261117210826_limit_scan_handler_writes.sql`
8. `20261117212926_workspace_inventory_roles.sql`
9. `20261117213347_workspace_members_realtime.sql`
10. `20261117213514_prefer_shared_workspace.sql`

These are **security and behavior migrations for an existing database**, not a complete initial schema dump. `schema.sql` is still empty. A fresh Supabase project cannot be recreated from this migration folder alone. Do not run `supabase db reset` against the production project. Before future DDL, inspect the live schema, write/review a migration, apply it to the intended project, and confirm migration history and policies afterward.

### Edge Functions

| Function | Current deployed status | Purpose / authentication |
|---|---|---|
| `scan-handler` | Active, version 42, `verify_jwt=false` | Hardware endpoint; validates payload and registered device, service-role database writes. JWT is off because the ESP32 firmware does not have user JWT auth. MAC-only device identity remains a risk. |
| `swift-action` | Active, version 36, `verify_jwt=true` | Product lookup. Requires a user JWT or the internal service-role server call. |
| `send-invite` | Active, version 19, `verify_jwt=true` | Authenticated invite email sender with owner checks and rate limit; not wired to current link-share UI. |
| `share-item` | Active, version 15, `verify_jwt=false` | Public token-based HTML page for one product; token lookup is owner-scoped. |

The deployed version list was checked on 2026-11-17. Confirm live versions and compare source before deploying after future edits.

### Edge secrets

Configured in Supabase Function Secrets (names only; never commit values):

- Required backend credentials: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Optional lookup providers: `GO_UPC_API_KEY`, `BARCODE_LOOKUP_API_KEY`, `GROQ_API_KEY`.
- Email invite function: `RESEND_KEY` or `RESEND_API_KEY`; optional `INVITE_FROM_EMAIL`.

`SUPABASE_SERVICE_ROLE_KEY`, Resend keys, lookup provider keys, and signing credentials must never be placed in Expo client code or sent to another LLM.

## 5. Hardware scanner

- Scanner: ESP32 + GM65 module; exact board wiring/model needs confirmation.
- BLE is used for provisioning Wi-Fi; scans then travel over Wi-Fi to the Edge Function.
- Registered scanner identity in the current backend is its MAC address stored in `devices`.
- Firmware source is unavailable. Per-device secret/signature authentication cannot be implemented or verified without firmware access.
- MAC addresses are identifiers, not secrets. Since `scan-handler` is a public hardware endpoint with JWT verification disabled, an attacker who learns a registered MAC may be able to forge requests. Keep this risk open until the firmware can sign requests or use a per-device credential.
- Do not erase or reflash the scanner until firmware is recovered or a replacement image/firmware source is available.

## 6. Build and local development

### Requirements

- Node.js 20 LTS is the project's current recommended build runtime.
- npm, Git, an Expo/EAS account, and Android tooling/device for install testing.
- Supabase project access for database and Edge Function changes.
- Expo Go is not sufficient for BLE provisioning; use an EAS development-client build for native BLE work.

### Install and run

```powershell
cd D:\Projects\BarcodesScanner\apps\omniscan-pro
npm ci
Copy-Item .env.example .env
```

Edit `.env` with the plain Supabase project URL (`https://<project-ref>.supabase.co`, without `/rest/v1/`) and the project's public anon/publishable key. `.env` is ignored by Git.

```powershell
npx expo start
```

For native development-client workflows:

```powershell
eas build --platform android --profile development
npx expo start --dev-client
```

### EAS build profiles in this repo

| Profile | Android output | Use / note |
|---|---|---|
| `development` | Internal APK with development client | Native development and BLE debugging. No env block is defined in this profile. |
| `preview` | Internal APK | Current sideload/testing profile. It defines Supabase URL and public anon key in `eas.json`. |
| `production` | AAB | Intended Play Store artifact, but `eas.json` currently has no production environment variables. Configure and verify these before a production build. |

Build a new installable APK with:

```powershell
eas build --profile preview --platform android
```

The installed app does not update when source files or Supabase change. Build and install a new APK to get app-side changes and the new icon. Save or commit the exact source used for a build so it can be reproduced. The current `android.versionCode` is 1; increment it before Play Store submissions as required by release policy.

## 7. GitHub synchronization

The local repository remote is `origin` → `https://github.com/yuensinghor/omniscan-pro.git`; branch is `main`. At the time this README was refreshed, `main` was at `48d24b1` and the current app/security/icon/README changes were local and uncommitted. Nothing was committed or pushed by this README update.

For this update, stage only the intended source, documentation, icon concepts, and migrations. Do not use `git add .` or `git add -A` until local secrets and unwanted files have been reviewed.

```powershell
cd D:\Projects\BarcodesScanner\apps\omniscan-pro
git status --short
git diff --check

git add README.md .gitignore .env.example App.tsx assets/icon.png assets/adaptive-icon.png assets/icon-concepts `
  src/screens/DashboardScreen.tsx src/screens/EditItemScreen.tsx `
  src/screens/FamilySharingScreen.tsx src/screens/NewItemScreen.tsx `
  src/screens/ProfileScreen.tsx supabase/.gitignore supabase/config.toml `
  supabase/functions/scan-handler/index.ts supabase/functions/send-invite/index.ts `
  supabase/functions/share-item/index.ts supabase/functions/swift-action `
  supabase/migrations

git diff --cached --check
git diff --cached --name-only
# Review the staged file list; confirm that .env, credentials, crash logs, and local backups are absent.
git commit -m "Complete family sharing and update app icon and docs"
git fetch origin
git pull --rebase origin main
git push origin main
```

If `git pull --rebase` reports conflicts, stop and resolve them before pushing. Do not force-push `main`.

The repository already tracks old local artifacts (`crash.log`, `package.json.backup`, `omniscan-filtered.txt`, and `supabase/.temp/cli-latest`). The new `.gitignore` prevents them from being added again if they become untracked, but ignore rules do **not** untrack files already committed. Optional cleanup that keeps local copies but removes them from the next GitHub version:

```powershell
git rm --cached -- crash.log package.json.backup omniscan-filtered.txt supabase/.temp/cli-latest
```

That cleanup should be reviewed and committed separately. Removing a file from a later commit does not erase it from earlier public Git history. The app's Supabase anon/publishable key is public client configuration, not a service-role secret; database policies still need to protect the data.

## 8. Current known gaps and release checklist

- Build/install the new preview APK and manually test family sharing with two separate accounts: invite acceptance, Viewer read-only access, Editor writes/scans, owner role changes, member removal, and owner-side live updates.
- Verify the release signing fingerprint is published in the separate website's Android `assetlinks.json` and test invitation links from browser, app-installed, and app-not-installed states.
- No workspace picker for accounts connected to more than one shared workspace.
- Email/join-code invite UI is not connected even though the Edge Function and some database RPCs exist.
- Hardware uses MAC identity; firmware unavailable means per-device request authentication remains unresolved.
- `eas.json` production profile needs Supabase environment configuration before Play Store builds.
- The public `share-item` page contains the wrong Play Store package ID in its download CTA.
- Supabase schema baseline is missing from version control. Capture and review the full schema before attempting database recreation or disaster recovery.
- `get_my_workspace` and several workspace RPCs are `SECURITY DEFINER`; their authenticated access is intentional, but keep validating caller checks and grants.
- Supabase Advisor currently reports seven authenticated-callable `SECURITY DEFINER` workspace RPC warnings and Leaked Password Protection disabled.
- Pro/Free tier is displayed from user metadata and is not secure entitlement enforcement. Payments and real subscriptions are not implemented.
- Ads/AdMob UI hooks are stubs; monetization is not active.
- iOS settings exist but iOS has not been built/tested.
- Current manual scanner smoke-test history predates the latest sharing/icon source changes. Do not assume the new APK or full sharing flow has been device-tested.

## 9. Quick manual acceptance checklist for the next APK

1. Sign in as the inventory owner. Confirm prior inventory and ESP32 scans still work.
2. Open **Profile → Family Sharing** and generate a link.
3. Open the link on another Android device/account. Sign in if prompted; confirm it joins the owner's inventory.
4. As Viewer, confirm products/history are readable and scan/add/edit/delete controls are unavailable.
5. As owner, refresh member list and switch that account to Editor.
6. Confirm the member sees the Editor role and can add/remove quantity or use the phone scan bar; confirm the owner's app receives the change.
7. Change the member back to Viewer and confirm writes are blocked. Remove the member and confirm access is revoked.
8. Test family invite links on devices with and without the app installed; this also checks website App Links configuration.
9. Confirm the new Scan Mark launcher icon appears after installation.

## 10. Notes for another coding assistant / LLM

Paste this paragraph when handing the project to another model:

> This is BarcodesScanner Pro / OmniScan Pro, an Expo React Native Android inventory app using Supabase and an ESP32 + GM65 Wi-Fi scanner. Read this README, then inspect the current source before proposing changes; some older docs or comments may be stale. The user reports the existing inventory/scanner prototype worked before recent security and family-sharing work, so preserve the owner workflow. Family roles are Owner, Editor, and Viewer; database RLS is authoritative. Supabase security migrations are already applied to the connected existing project and are mirrored under `supabase/migrations`, but those migrations are not a complete fresh-database schema. The latest app code and selected icon require a new EAS preview APK; the installed APK does not update itself. Family sharing has not yet completed a two-account device acceptance test. The ESP32 firmware source is unavailable, so do not claim device-secret authentication is solved. Never ask for or expose service-role/Resend/provider API keys. Before database DDL, inspect the live schema and make a reviewed migration; do not run `db reset` on production. Distinguish verified facts from guesses, preserve working behavior, and summarize what changed and how it was checked. Ask before pushing, force-pushing, deleting production data, changing live security policies, or publishing a release.

## 11. License

No license has been selected. Unless a license is added, all rights are reserved.
