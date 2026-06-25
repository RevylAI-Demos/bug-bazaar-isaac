# Agent Guidance

## Revyl Verification

When developing or changing a feature in this repo, use the Revyl dev loop to verify the behavior on a device before finishing.

- Read and follow the local `revyl-cli-dev-loop` skill guidance before running Revyl commands.
- This is an Expo dev-client app. Start with the Revyl-managed Expo loop from the repo root, using the existing `.revyl/config.yaml` when possible:

```bash
revyl init --detect
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

Do not commit Revyl screenshots to the feature branch. Store PR evidence screenshots on the asset-only `demo-assets` branch and reference the raw image URL from the PR body.

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
