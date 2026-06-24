# Bug Bazaar

Bug Bazaar is a richer Expo sample app for dogfooding Revyl flows against a real product shape: search, product detail pages, cart, checkout, account state, and a first-party auth screen.

It is also the reference app for Revyl auth-bypass deep links.

## Auth Bypass Deep Link Sample

The sample demonstrates the pattern we recommend for customer cloud-agent runs:

1. Start the Expo development client through Revyl.
2. Attach launch vars that gate or configure auth bypass.
3. Send a test-only deep link that signs in and routes to the target screen.

The normal auth screen lives in `app/auth.tsx`. The auth-bypass handler lives in `context/AuthBypassContext.tsx`, the Expo Router backstop route lives in `app/revyl-auth.tsx`, the provider is wired in `app/_layout.tsx`, and the Account tab shows idle, accepted, and rejected states.

The route backstop matters for Expo Router: `bug-bazaar://revyl-auth?...` can otherwise fall through to the unmatched-route screen while the development client is already running. The route calls the same auth-bypass handler and sends rejected links back to the auth screen so the failure reason stays visible.

## Local Setup

```bash
npm install
```

Create the launch vars once:

```bash
revyl global launch-var create REVYL_AUTH_BYPASS_ENABLED=true
revyl global launch-var create REVYL_AUTH_BYPASS_TOKEN=revyl-demo-token
```

Start the Expo tunnel:

```bash
npx expo start --tunnel --dev-client
```

Then start Revyl with the Expo dev-client link that Expo prints:

```bash
revyl dev --no-build --app-id <your-revyl-app-id> \
  --tunnel "<expo-dev-client-link>" \
  --launch-var REVYL_AUTH_BYPASS_ENABLED \
  --launch-var REVYL_AUTH_BYPASS_TOKEN
```

If this checkout is already configured with a Revyl app, you can omit `--app-id`.

For a non-dev-client build, start a device directly with the same launch vars:

```bash
revyl device start \
  --platform ios \
  --launch-var REVYL_AUTH_BYPASS_ENABLED \
  --launch-var REVYL_AUTH_BYPASS_TOKEN
```

## Valid Link

After the Expo project is loaded in the development client, send the auth link:

```bash
revyl device navigate \
  --url "bug-bazaar://revyl-auth?token=revyl-demo-token&role=collector&redirect=%2Fcheckout"
```

The deep link signs in as the Revyl test collector and routes to checkout. You can also route to:

- `%2Faccount`
- `%2Fcart`
- `%2Fcheckout`
- `%2Fproduct%2F3`

## Failure Cases

The auth screen should show visible rejected states for each invalid link:

```bash
revyl device navigate \
  --url "bug-bazaar://revyl-auth?token=wrong-token&role=collector&redirect=%2Fcheckout"

revyl device navigate \
  --url "bug-bazaar://revyl-auth?token=revyl-demo-token&role=admin&redirect=%2Fcheckout"

revyl device navigate \
  --url "bug-bazaar://revyl-auth?token=revyl-demo-token&role=collector&redirect=%2Fadmin"
```

## Implementation Checklist

When adapting this pattern to another app:

- keep the handler test-only
- attach or read `REVYL_AUTH_BYPASS_ENABLED` and `REVYL_AUTH_BYPASS_TOKEN` when the device session starts
- accept only allowlisted roles
- accept only allowlisted redirects
- show rejected state visibly in debug/test builds
- open the app-specific link only after the app or Expo dev client project is loaded

Because this fixture is a managed Expo app, it includes a small config plugin that exposes native launch arguments to JavaScript. Revyl auth bypass stays disabled unless `REVYL_AUTH_BYPASS_ENABLED=true` and `REVYL_AUTH_BYPASS_TOKEN` are present at app launch.
