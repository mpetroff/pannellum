# Renderer extension interfaces

These interfaces are on the low-level renderer returned by
`viewer.getRenderer()`.

`renderer.getSource()` returns a snapshot with `image`, `type`, decoded `width`
and `height`, and `haov`, `vaov`, `vOffset`, `horizonPitch`, `horizonRoll` in
radians. Cubemap dimensions describe one face. Multires sources remain their
configuration object and can have zero decoded dimensions. Before initialization,
the method returns `null`.

The image is a borrowed reference to the decoded source, not a copy. Its lifetime
belongs to the renderer. Consume it after initialization / the viewer's `load`
event; do not close an ImageBitmap or replace source data. Metadata changes on
the returned snapshot do not mutate renderer configuration.

`renderer.getContext()` returns the shared WebGL context, or `undefined` for the
CSS fallback. Reading either interface does not draw or change GL state. The
renderer owns the context lifetime. Another GL user must prepare its own target,
viewport, clear, blend and scissor state. Pannellum rebinds its own programs,
textures and vertex/index buffers before drawing. Neither getter exposes shader
programs or buffer implementation details.

The existing `render(..., {hook: callback})` hook retains its previous behavior:
its return value is ignored.
