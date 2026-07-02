# Agent Guidance

## Cursor Cloud specific instructions

This is an Expo (SDK 54) dev-client React Native app. Dependencies install with `npm install` (see `README.md`; `package-lock.json` + `.npmrc legacy-peer-deps` are authoritative — do not use `bun` despite `bun.lock`). Node 22 (`.nvmrc`).

Running the app in the cloud VM:

- The primary on-device feature-verification path is the Revyl dev loop described below.
- Do NOT use the `npm` scripts (`npm start`, `npm run web`, `npm run ios`, `npm run android`): their `pre*` hooks run `node scripts/check-node-version.js`, but `scripts/` does not exist in the repo, so those scripts fail. Invoke `npx expo start ...` directly to bypass the missing hook.

Revyl CLI (for the on-device dev loop below):

- The `revyl` CLI is preinstalled by the startup update script to `/usr/local/bin/revyl` (already on `PATH`). If it is ever missing, reinstall with: `sudo env REVYL_INSTALL_DIR=/usr/local/bin REVYL_NO_MODIFY_PATH=1 sh -c "$(curl -fsSL https://revyl.com/install.sh)"`.
- Auth is automatic via the injected `REVYL_API_KEY` secret (`revyl auth status` shows `Auth Method: env`); no `revyl auth login` or `~/.revyl/credentials.json` is needed. If `REVYL_API_KEY` is unset, add it in the Cloud Agent Secrets panel.
- See below on how to build the app using Revyl

Checks:

- No lint or test tooling is configured (no ESLint, no test runner). The type check is `npx tsc --noEmit`.
- `npx tsc --noEmit` reports pre-existing errors ONLY in `demo/versions/*.tsx` (scratch alternate components with wrong relative import paths); these are not part of the app and can be ignored. The app code under `app/`, `components/`, `context/`, `constants/` is clean.

## Bugs Flows

**If this is a Bug report and the ticket contains Build information: FIRST record the steps to reproduce the bug using a Revyl session.**

Before implementing any changes, use Revyl to record the exact user flow dictated by the user. Use the build that is described in the ticket to start the Revyl session. **Make sure to add the link to this completed session in the PR when it gets opened up**

## Revyl Verification

When developing or changing a feature in this repo, use the Revyl dev loop to verify the behavior on a device before finishing.

First run a new build using `revyl build --remote` as this VM does not have native platform toolchains not present.

- Read and follow the local `revyl-cli-dev-loop` skill guidance before running Revyl commands.
- This is an Expo dev-client app. Start with the Revyl-managed Expo loop from the repo root, using the existing `.revyl/config.yaml` when possible:

```bash
revyl dev --context bug-bazaar --platform ios --platform-key ios-dev \
  --launch-var REVYL_AUTH_BYPASS_ENABLED \
  --launch-var REVYL_AUTH_BYPASS_TOKEN
```

- Keep `revyl dev` running in a non-blocking shell and use separate short-lived `revyl device` commands for screenshots, taps, typing, navigation, reports, and rebuilds.
- Prefer the Revyl-managed relay. Only use an Expo tunnel fallback after device evidence shows that the relay, app load, or hot reload path failed.
- For JS/TS feature changes, rely on hot reload when available. Rebuild only for native config, native modules, permissions, URL schemes, Expo SDK/native dependency changes, or when Revyl/device evidence shows the installed build is stale.
- Use the app's auth-bypass flow when a feature path requires a signed-in collector:

```bash
revyl device navigate \
  --url "bug-bazaar://revyl-auth?token=revyl-demo-token&role=collector&redirect=%2Fcheckout"
```

- Verify the user-visible outcome with device evidence, such as `revyl device screenshot`, `revyl device report --json`, or explicit interaction through `revyl device instruction`.
- Summarize Revyl verification in the final response: what path was exercised, what evidence was captured, and any issues or limitations. If Revyl cannot be run, state the concrete blocker and the fallback verification used.

## Revyl Evidence in Pull Requests

When opening or updating a PR for work where Revyl was run, include both:

- An embedded Revyl screenshot showing the verified user-visible outcome.
- A link to the Revyl report session, such as `https://app.revyl.ai/sessions/report?sessionId=<session-id>`.

Do not commit Revyl screenshots to the feature branch. Store PR evidence screenshots on the asset-only `demo-assets` branch and reference the raw image URL from the PR body. **The raw image URL should be in the following format: `https://github.com/<owner>/<repo>/blob/<branch>/<path to image>?raw=true` because this is a private repo. Do not use the raw.githubusercontent.com to post it.**

Recommended flow after capturing a screenshot:

```bash
# From the feature branch, capture a screenshot outside the repo.
revyl device screenshot --out /tmp/<pr-slug>-revyl.png -s <device-index>

# Create or update an isolated worktree for the asset branch.
git fetch origin demo-assets
git worktree add /tmp/bug-bazaar-demo-assets origin/demo-assets
cd /tmp/bug-bazaar-demo-assets
git switch -c demo-assets --track origin/demo-assets 2>/dev/null || git switch demo-assets

# Add the screenshot under a PR-specific path and push it.
mkdir -p pr-<number>
cp /tmp/<pr-slug>-revyl.png pr-<number>/<short-description>.png
git add pr-<number>/<short-description>.png
git commit -m "add PR <number> revyl screenshot"
git push origin demo-assets
```

Then embed the asset in the PR body:

```markdown
## Revyl Verification

- Report session: https://app.revyl.ai/sessions/report?sessionId=<session-id>

![Revyl verification screenshot](https://raw.githubusercontent.com/RevylAI/bug-bazaar-isaac/demo-assets/pr-<number>/<short-description>.png)
```

If the PR number is not known yet, open the draft PR first with the Revyl report link, then add the screenshot to `demo-assets/pr-<number>/...` and update the PR body.

## Cursor Cloud specific instructions

This is an Expo (SDK 54) dev-client app whose primary dev/test loop targets iOS/Android via Revyl cloud devices (see Revyl sections above). Two verification paths exist in the Cursor Cloud VM:

- **Revyl cloud device loop (primary):** `REVYL_API_KEY` is provided as a secret and the Revyl CLI is installed to `~/.revyl/bin` (already on `PATH` via `~/.bashrc`; the startup script reinstalls it if missing). The CLI auto-authenticates from `REVYL_API_KEY` (`revyl auth status` / `revyl ping` to confirm). Use it per the Revyl sections above and the `revyl-cli-dev-loop` skill. There are still **no local iOS/Android simulators**, so native builds run via EAS/Revyl, not on this VM.
- **Expo web (lightweight local check):** for quick JS/TS/UI verification without a device, run the app as web and drive it in a browser.

- **Run the app (web):** `npx expo start --web --port 8081`, then open `http://localhost:8081`. Node 22 (`.nvmrc`) matches `engines`.
- **Do NOT use the `npm run` scripts** (`start`/`web`/`ios`/`android`). Their `pre*` hooks call `node scripts/check-node-version.js`, and that file does not exist in the repo, so every `npm run` script fails immediately. Invoke `expo` directly with `npx expo ...` instead.
- **Package manager:** use `npm` (README + `package-lock.json`). A `bun.lock` also exists, so Expo/EAS auto-detect bun for `expo install`/lint; since bun is not installed here, add deps with `npm install <pkg>` directly rather than `npx expo install`.
- **Web runtime deps** (`react-dom`, `react-native-web`, `@expo/metro-runtime`) are required for `expo start --web` and are declared in `package.json`.
- **Typecheck:** `npx tsc --noEmit`. Pre-existing errors under `demo/versions/**` are a scratch folder with intentionally broken relative imports; they are unrelated to the shippable app (`app/`, `components/`, `constants/`, `context/`).
- **Lint / tests:** none are configured (no ESLint config, no lint script, no test framework). `npx expo lint` tries to auto-install ESLint via bun and fails; don't rely on it.
- **Checkout flow needs sign-in:** the auth screen is pre-filled with a demo collector account, or use the auth-bypass deep link documented above. The "Missing auth state" chip on the auth screen is the normal idle indicator, not an error.
- Web rendering of this mobile layout shows cosmetic quirks at desktop width (wide whitespace, a solid hero-banner block); these are not functional bugs.
