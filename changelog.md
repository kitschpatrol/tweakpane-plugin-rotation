# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1-fork.2] - 2026-11-11

### Added

- Add a `/lite` export and minified lite bundle that import `@tweakpane/core` so projects can share core across plugins.
- Export `EulerOrder`, `EulerUnit`, `RotationInputPluginEulerParams` and `RotationInputPluginQuaternionParams` from the package entry.

### Changed

- Bundle `@tweakpane/core` in the default and minified builds; use `/lite` to retain externalized core.
- **Breaking:** Restrict package imports to the root, `/lite` and `/package.json`, replace the `dist/types` tree with bundled declarations, and declare the package side-effect-free.
- **Breaking:** Raise the JavaScript build target from ES2015 to ES2022 and set CSS targets to Chrome 107, Firefox 104 and Safari 16.
- **Breaking:** Restrict declared Node.js support to versions 18, 20, 22, 24, and 26 or newer.

### Fixed

- Apply gizmo axis-label hover styles only on devices that support hovering.

### Documentation

- Add installation and registration examples, explain Tweakpane 4 and `/lite` dependency requirements, and expand fork and contribution guidance.

### Maintenance

- Update the pinned pnpm version to 12.16.1.
- Update release and changelog actions, and retrieve an npm one-time password from 1Password during publication.
- Migrate builds from Rollup to tsdown with SCSS processing, declaration bundling and package validation, and serve the relocated demo with Vite.
- Adopt `@kitschpatrol/shared-config` and `ksc` for linting, formatting and type checks, refresh editor integration, and refactor source to follow the plugin template.
- Add Vitest tests for plugin registration, bindings, picker and gizmo interactions, constraints, parsing and rotation math.
- Add Linux, macOS and Windows CI for builds, linting and tests, add monthly dependency-update automation, and refresh metadata and fork-maintenance actions.
- Generate changelogs with chagent during versioning and build after the version update before publishing.
- Refresh development dependencies, including chagent, Sass, tsdown, Vite and Vitest, update pnpm to 12.18.0, and align Node.js types with the runtime support floor.

## [0.2.1-fork.1] - 2026-10-15

### Documentation

- Document the `fork.N` versioning scheme, add license attribution for fork modifications, and refresh README links and badges.

### Maintenance

- Refresh development dependencies, including pnpm 12, ESLint 10 and TypeScript 6, and declare contributor Node.js requirements of `^24.16.0 || >=26.3.0`.
- Standardize pnpm build, formatting and cleanup scripts, migrate ESLint to flat configuration, and add mdat README generation and validation.
- Migrate to the modern Sass API and rebuild embedded styles when watched stylesheets or imports change, preserving recovery after Sass errors.
- Validate and build before versioning, use `fork` prerelease identifiers and token authentication, and support plain or `v`-prefixed release tags on the default branch.
- Add repository and website link checks and scheduled fork maintenance; refresh release and metadata workflows with pinned actions.

## [0.2.1-beta.2] - 2025-03-04

### Documentation

- Correct the npm repository link and clarify that beta versions track the next upstream patch release.

### Maintenance

- Update the declared `@tweakpane/core` dependency to `^2.0.5`.
- Refresh development dependencies and pnpm 10, remove the pnpm engine restriction, and allow the `@parcel/watcher` installation build.
- Explicitly publish releases to the npm `latest` tag.

## [0.2.1-beta.1] - 2024-09-15

### Changed

- **Breaking:** Migrate to Tweakpane 4 (`^4.0.0`), including bundle-level `id` and `css` exports for registration, and drop Tweakpane 3 support.
- **Breaking:** Distribute ES modules instead of UMD bundles, move declarations to `dist/types`, and stop generating TypeScript 3.4 compatibility declarations.
- **Breaking:** Rename the npm package to `@kitschpatrol/tweakpane-plugin-rotation` and configure public publication.
- **Breaking:** Externalize `@tweakpane/core` as a runtime dependency (`^2.0.4`) so plugins can share it; direct browser imports now require an import map.

### Documentation

- Update examples for Tweakpane 4 ES module imports and `addBinding`, including import-map configuration in the demo.
- Document the maintained fork, dependency externalization, package-name change, pnpm setup and beta versioning policy.

### Maintenance

- Adopt pnpm, add a local demo server and publication lint checks, migrate from node-sass to Dart Sass, and refresh Rollup, TypeScript and ESLint tooling; declare Node.js >=18.
- Replace the fork's Pages publishing workflow with GitHub release and metadata-sync automation, update npm discovery metadata, and restore clean builds during versioning.

## [0.1.1] - 2022-02-21

### Fixed

- Correct reversed perspective in the rotation gizmo and miniature preview.

## [0.1.0] - 2022-02-06

### Added

- Add Euler `{x, y, z}` inputs with six extrinsic rotation orders and `rad`, `deg` or `turn` units, defaulting to `XYZ` and radians.
- Allow arrow keys to rotate the focused gizmo.
- Show a live miniature rotation preview on the picker button.

### Changed

- **Breaking:** Replace the `RotationInputPlugin` and `plugin` exports with `RotationInputPluginEuler`, `RotationInputPluginQuaternion` and a `plugins` array.
- Use consistent 0.01 editing steps and compact numeric formatting for quaternion components.

### Removed

- **Breaking:** Remove acceptance of `axisAngle` and `eulerXYZ`-style `rotationMode` values; Euler inputs now use `'euler'` with a separate `order` option.

### Fixed

- Preserve the configured Euler order when editing components or applying constraints.
- Correct quaternion formatting for component values that round to ±1.

### Documentation

- Expand usage examples for Euler and quaternion inputs, update the screenshot, and add interactive CSS and Three.js demonstrations to the sandbox.

## [0.0.1] - 2022-02-03

### Added

- Introduce `@0b5vr/tweakpane-plugin-rotation` for Tweakpane 3, with quaternion component editing and per-component minimum, maximum and step constraints.
- Provide a 3D rotation gizmo with free dragging, X/Y/Z rotation rings and a roll ring.
- Add positive and negative axis labels that animate the rotation to six preset orientations when clicked.
- Support popup and inline rotation pickers with configurable initial expansion.
- Expose `RotationInputPlugin` and its `plugin` alias, with browser UMD bundles, minified builds and TypeScript declarations.

### Documentation

- Provide a plugin registration and quaternion binding example, screenshot and browser sandbox.

### Maintenance

- Set up TypeScript/Rollup builds, Sass compilation, linting, watch scripts, package preparation, version hooks and GitHub Pages deployment.

[0.0.1]: https://github.com/kitschpatrol/tweakpane-plugin-rotation/releases/tag/v0.0.1
[0.1.0]: https://github.com/kitschpatrol/tweakpane-plugin-rotation/compare/v0.0.1...v0.1.0
[0.1.1]: https://github.com/kitschpatrol/tweakpane-plugin-rotation/compare/v0.1.0...v0.1.1
[0.2.1-beta.1]: https://github.com/kitschpatrol/tweakpane-plugin-rotation/compare/v0.1.1...0.2.1-beta.1
[0.2.1-beta.2]: https://github.com/kitschpatrol/tweakpane-plugin-rotation/compare/0.2.1-beta.1...0.2.1-beta.2
[0.2.1-fork.1]: https://github.com/kitschpatrol/tweakpane-plugin-rotation/compare/0.2.1-beta.2...0.2.1-fork.1
[0.2.1-fork.2]: https://github.com/kitschpatrol/tweakpane-plugin-rotation/compare/0.2.1-fork.1...0.2.1-fork.2
