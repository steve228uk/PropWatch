# Use Cases

PropWatch catches test ID changes before they cascade into broken pipelines. Here are the most common scenarios where it saves time.

## E2E test frameworks

### Playwright

Playwright tests use locators like `getByTestId()` which look up `data-testid` attributes by default.

```ts
// This test breaks silently when a dev renames data-testid="checkout-btn"
await page.getByTestId('checkout-btn').click()
```

When a developer renames the attribute in a PR — even just `checkout-btn` → `checkout-button` — the test doesn't fail until it runs in CI. PropWatch catches the rename in the PR diff and fails the check before the test suite ever runs.

**What PropWatch catches:**
- `data-testid` renamed or removed in JSX, TSX, Vue, Svelte, HTML
- Bulk renames from find-and-replace that miss some instances
- Conditional renders where the ID is removed from one branch

### Cypress

Cypress commonly uses `data-cy` or `data-testid` attributes selected with `.get('[data-cy="..."]')`.

```ts
cy.get('[data-cy="submit-form"]').click()
```

If `data-cy="submit-form"` is removed during a refactor, the test hangs or throws a timeout error that can be hard to trace back to the source change. Add `data-cy` to your PropWatch patterns config:

```json
{
  "patterns": [
    { "name": "data-cy", "type": "attribute" }
  ]
}
```

PropWatch will then track `data-cy` removals and renames the same way it tracks `data-testid`.

### Appium

React Native apps targeted by Appium tests use `testID` props to identify elements. These are especially fragile because the test suite often lives in a completely separate repository from the component code.

```tsx
<TouchableOpacity testID="login-button">
```

When the mobile app repo introduces a PR that renames or removes a `testID`, the Appium tests in the separate repo have no way to catch it until they run against a build — which might be hours or days later. PropWatch surfaces the broken selector immediately, in the PR that caused it.

### WebdriverIO

WebdriverIO tests commonly use `$('[data-testid="..."]')` selectors. PropWatch's `data-testid` detection applies here too without any additional configuration.

---

## External tracking and analytics

Test IDs are increasingly used by third-party tools to identify UI elements. Renaming them can silently break these integrations without any error in your application logs.

### FullStory

FullStory can be configured to capture element interactions by `data-testid` attribute for session replay tagging and funnel analysis. If a tracked element's `data-testid` is renamed, historical event data stops associating with new captures — and dashboards go dark with no warning.

### Datadog RUM

Datadog Real User Monitoring supports action naming via `data-dd-action-name` and similar attributes. Teams sometimes alias these with `data-testid` in shared component libraries. A rename silently breaks RUM action tracking.

### Heap and Amplitude

Heap and Amplitude use CSS selectors and attribute-based rules to define events. If you've defined a Heap event as `[data-testid="add-to-cart"]` and that attribute is renamed in a PR, the event definition no longer matches — no data is captured and no error is thrown.

### LogRocket

LogRocket can target elements for session replay redaction or highlighting using `data-testid`. Silent renames mean unexpected PII capture or broken redaction rules.

---

## What these scenarios have in common

In every case above:

- The breakage is **silent** — no immediate error, no compile-time warning
- The cause is **obvious in hindsight** — someone renamed an attribute
- The delay between change and failure is **measured in hours or days**
- The fix, once found, takes **30 seconds**

PropWatch eliminates the delay. It runs in your PR pipeline, diffs the changed files, and reports exactly which IDs were removed or renamed — giving you the 30-second fix before the breakage ships.

## Next steps

- [Installation](/guide/installation) — add PropWatch to your project
- [Patterns](/config/patterns) — configure custom attributes like `data-cy` or `data-dd-action-name`
- [CI/CD Setup](/ci/) — add the check to your pipeline
