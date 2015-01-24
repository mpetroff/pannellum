Changelog
=========


Changes in Pannellum 2.1.1
--------------------------

Bugfixes:
 - Force subpixel rendering for hot spots


Changes in Pannellum 2.1.0
--------------------------

New Features:

 - Ability to limit pitch, yaw, and hfov extents
 - Can set starting pitch and yaw in scene linked to by hotspot
 - Pinch to zoom
 - Zoom and fullscreen controls can be hidden
 - "Inertia"
 - Option to begin auto rotating after a period of user inactivity
 - Use Photo Sphere XMP metadata for configuration
 - Preliminary equirectangular video support (no controls)

Improvements:

 - Loading progress bar is displayed for equirectangular panoramas
 - Error message for image being to large for a device is now much more
   descriptive
 - Zoom level choosing for multiresolution panoramas is improved
 - Documentation of configuration parameters was added
 - Python 2.7 support for multiresolution tile generator script

Bugfixes:

 - Fix bug where preview images wasn't always loaded for cubic panoramas
 - Hot spots are now displayed behind controls
 - Fix bug with multiresolution panoramas when `basePath` isn't defined
 - Error message displayed for IE 9

Backwards-Incompatible Configuration Parameter Changes:

 - `voffset` changed to `vOffset`
 - `autorotate` changed to `autoRotate`
 - `autoload` changed to `autoLoad`
 - `autoLoad` value changed from `'yes'` to `true`

Other:

 - Popout mode, for browsers that do not support the fullscreen API, has been
   removed


Changes in Pannellum 2.0.1
--------------------------

Bugfixes:
 - Fix keyboard controls in Safari


Changes in Pannellum 2.0
------------------------

New Features:

 - New rendering backend
 - Multiresolution panoramas
 - Partial panoramas
 - Cubic panoramas
 - CSS 3D fallback renderer for multiresolution panoramas
 - JSON configuration files
 - Hot spots and tours
 - Compass headings

Improvements:

 - More configuration options
 - New theme
 - Performance improvements
 - CORS support

Bugfixes:

 - Numerous


Changes in Pannellum 1.2
------------------------

New Features:

 - Added keyboard panning controls
 - Added support for a fallback URL if WebGL is not supported

Improvements:

 - Clarified load button text
 - Switched from raster to vector icons

Bugfixes:

 - Added workaround for WebKit fullscreen regression
