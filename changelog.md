Changelog
=========


Changes in Pannellum 2.2.1
--------------------------

New Features:

 - NPM support

Improvements:

 - Set `Accept` header to request images
 - Ensure `hfov` is a number
 - Better restriction on yaw range


Changes in Pannellum 2.2.0
--------------------------

New Features:

 - An API has been added instead of just a standalone viewer; the API should be
   considered experimental at this point and may be subject to change
 - The `PosePitchDegrees` and `PoseRollDegrees` XMP tags are now supported
   (used by the Ricoh Theta S)
 - Optional fade animation for transitioning between scenes using the
   `sceneFadeDuration` parameter
 - New `autoRotateStopDelay` parameter that allows the panorama to be rotate
   for a specific period of time before stopping
 - Hot spot debug parameter to assist with positioning hot spots
   (`hotSpotDebug`)
 - Parameter to disable keyboard zooming (`keyboardZoom`)

Improvements:

 - Much better equirectangular video support using Video.js
 - High-DPI support
 - Unified configuration files; tour configuration files can now be used
   directly with the `config` parameter
 - Page title is now set to the panorama title in the standalone viewer
 - Aspect ratio of preview image is now maintained
 - Fullscreen button is now only shown if fullscreen is allowed
 - Pointer Events are now supported for touch controls in IE / Edge
 - Performance improvements
 - CSS 3D renderer now works with cubemaps
 - CSS 3D renderer now works in IE 10/11
 - Configuration files are now loaded asynchronously (synchronous request are
   deprecated by most browsers)
 - Improved keyboard zooming speed
 - Added checks to avoid browser NPOT cubemap bugs
 - Better path handling
 - Informative error is shown when Pannellum is opend from local filesystem
   instead of a web server

Bugfixes:

 - Fixed zoom out jerkiness in Chrome
 - Fixed inertia-related jumping
 - Fixed CSS 3D renderer edge flickering issue
 - Fixed CSS 3D renderer hot spot display bug
 - Fixed a number of Safari-related bugs
 - Fixed bug with autoloaded tours
 - Fixed bug where hot spot tooltips were sometimes obscured
 - Fixed CSS 3D renderer fullscreen bug
 - Fixed `vOffset` bug
 - Fixed image hot spots bug
 - Fixed zoom bug related to small multires panoramas

Backwards-Incompatible Configuration Parameter Changes:

 - The sign of hot spot yaw positions has been flipped to match the rest of
   Pannellum's yaw values
 - The `tour` parameter is deprecated and will be removed in the next major
   release; tour JSON configuration files can be used with the `config`
   parameter
 - Undocumented URL configuration parameters can no longer be used
 - The `header` parameter can no longer be used; use the API instead

Other:

 - Extra row of pixels no longer needed in multires fallback images
 - Added JSDoc documentation


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
