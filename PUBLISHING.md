# Publishing

## Prerequisites

```bash
npm login
```

Verify you're logged in as `darronz`:

```bash
npm whoami
```

## Release

```bash
npx np
```

This will:
1. Run tests
2. Build (`tsc`)
3. Prompt for version bump (patch / minor / major)
4. Create a git tag
5. Push to GitHub
6. Publish to npm as `@darronz/designmd-gen`

## Manual release (if np gives you trouble)

```bash
npm test
npm run build
npm version patch   # or minor / major
git push --follow-tags
npm publish
```

## Verify after publish

```bash
npm info @darronz/designmd-gen
```

## First-time publish

If npm complains about the scope not existing:

```bash
npm publish --access public
```

This should only be needed once. The `publishConfig.access` in package.json handles it for subsequent publishes.
