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
