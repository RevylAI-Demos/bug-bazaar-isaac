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
