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

For multiple views sharing one framebuffer, set `clear: false` in the render
parameters and clear the appropriate viewport in the caller. This option controls
the multires background clear; the default remains unchanged. Monolithic
panoramas draw their own background into the viewport. The caller manages
framebuffer, viewport and scissor state.

`render(pitch, yaw, hfov, {view: view})` accepts an external perspective camera
for equirectangular, cubemap and multires sources.
`view` contains column-major `projectionMatrix` and `viewMatrix` arrays (16 finite
values each), plus positive pixel `width` and `height`. The caller binds its
framebuffer and sets the viewport. The renderer applies its configured horizon
correction and ignores camera translation for panorama viewing. The traditional
pitch/yaw/hfov path remains the default.

For multires sources, the renderer derives culling matrices internally and uses
`view.width` and `view.height` for tile resolution selection. The same camera
also applies to the equirectangular / SHT preview. Supplying a view does not
implicitly change background clearing; use `clear: false` when needed.


`viewer.suspendRendering()` hands presentation to an external loop and returns
an idempotent release function. Nested suspensions resume desktop rendering only
when all releases have been called. Loading and scene events continue. Desktop
animation, automatic viewport resizing and DOM scene fades are suspended. On final
release, the desktop viewport is restored and rendering resumes. Automatic
rotation configuration is retained; in-progress animated moves and input inertia
are stopped. Releases after viewer destruction are harmless.

An extension must release its own resources in the viewer's `destroy` event.
The core contains no XR session or presentation-mode flag.
