### 🚧 WIP Plugin Migration from Tweakpane 3.x → 4.x 🚧

This branch is a work-in-progress migration of `tweakpane-plugin-rotation` from Tweakpane 3 to Tweakpane 4.

The diff is quite noisy since I wasn't able to retain the automated formatting of the original repo on a 1:1 basis, and the project structure has been modified slightly for consistency with the latest [Tweakpane plugin template](https://github.com/tweakpane/plugin-template).

There are a few type issues yet to be reconciled.

#### Migration Guides

- https://cocopon.github.io/tweakpane/migration/v4/
- https://github.com/cocopon/tweakpane/issues/396#issuecomment-1418929095

#### CSS variable name changes V3 → V4:

- `in-fg / input-foreground-color` → `input-fg / input-foreground-color`
- `btn-fg / button-foreground-color` → `button-fg /button-foreground-color`
- `btn-bg / button-background-color` → `button-bg /button-background-color`
- `bld-s / blade-spacing` → `container-unit-spacing`
- `bld-us / blade-unit-size` → `container-unit-size`

---

# `@0b5vr/tweakpane-plugin-rotation`

[![npm](https://img.shields.io/npm/v/@0b5vr/tweakpane-plugin-rotation?logo=npm&style=flat-square)](https://www.npmjs.com/package/@0b5vr/tweakpane-plugin-rotation)

Rotation input plugin for Tweakpane

![@0b5vr/tweakpane-plugin-rotation, Rotation input plugin for tweakpane. A working screenshot of the plugin on the right](https://github.com/0b5vr/tweakpane-plugin-rotation/raw/dev/readme-images/rotation.png)

[Sandbox](https://0b5vr.github.io/tweakpane-plugin-rotation)

```html
<script src="https://unpkg.com/tweakpane@3.0.5/dist/tweakpane.js"></script>
<script src="./tweakpane-plugin-rotation.js"></script>
<script>
  const pane = new Tweakpane.Pane();

  pane.registerPlugin(TweakpaneRotationInputPlugin);

  const params = {
    euler: { x: 0.0, y: 0.0, z: 0.0 },
    quat: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 }
  };

  // euler
  const guiEuler = pane.addInput(params, 'euler', {
    view: 'rotation',
    rotationMode: 'euler',
    order: 'XYZ', // Extrinsic rotation order. optional, 'XYZ' by default
    unit: 'deg' // or 'rad' or 'turn'. optional, 'rad' by default
  });

  // quaternion
  const guiQuat = pane.addInput(params, 'quat', {
    view: 'rotation',
    rotationMode: 'quaternion', // optional, 'quaternion' by default
    picker: 'inline', // or 'popup'. optional, 'popup' by default
    expanded: true // optional, false by default
  });

  guiEuler.on('change', ({ value }) => {
    console.log(value); // do something
  });
</script>
```
