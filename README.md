# @kitschpatrol/tweakpane-plugin-rotation

[![NPM Package @kitschpatrol/tweakpane-plugin-rotation](https://img.shields.io/npm/v/@kitschpatrol/tweakpane-plugin-rotation.svg)](https://npmjs.com/package/@kitschpatrol/tweakpane-plugin-rotation)

## Overview

**This is a fork of [0b5vr](https://github.com/0b5vr)'s [tweakpane-plugin-rotation](https://github.com/0b5vr/tweakpane-plugin-rotation) with externalized dependencies.**

This allows for smaller bundled file sizes in projects using multiple Tweakpane plugins.

It is published to NPM primarily for the [_Svelte Tweakpane UI_](https://kitschpatrol.com/svelte-tweakpane-ui) project, and will be kept in sync with the upstream version of the plugin, with minimal changes other than dependency externalization.

For most use cases, you probably don't want this fork!

## Background

The [Rollup](https://rollupjs.org) configuration provided in the [Tweakpane plugin template](https://github.com/tweakpane/plugin-template) does not externalize [`@tweakpane/core`](https://github.com/cocopon/tweakpane/tree/main/packages/core) as a production dependency.

Instead, it gets built into the single-file plugin artifact, which is what's published to NPM and imported by plugin consumers. This makes it easy to import as an ES module from a URL, but means that larger projects importing multiple Tweakpane plugins end up with duplicate copies of the `@tweakpane/core` code, adding about ~100 Kb to the final minified build for each plugin after the first.

Externalizing this dependency allows build tools like [vite](https://vitejs.dev) to share a single instance of the `@tweakpane/core` code across multiple plugins.

If you're not using a bundler, direct ESM imports from URLs can still work if needed by defining the `@tweakpane/core` dependency in an [importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap).

## Implementation notes

This fork uses the main branch for the releases instead of dev.

Note the package's name change from `@0b5vr/tweakpane-plugin-rotation` to `@kitschpatrol/tweakpane-plugin-rotation`.

 PNPM is used as the package manager.