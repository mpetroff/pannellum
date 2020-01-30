Changelog
=========


Changes in Pannellum 2.5.6 (2019-11-26)
---------------------------------------

Security fixes:
 - Extended partial fix in v2.5.5 for XSS vulnerability that allowed script
   execution when hot spots were clicked (CVE-2019-16763)


Changes in Pannellum 2.5.5 (2019-11-21)
---------------------------------------

Bugfixes:
 - Fixed device orientation permission request such that it works with iOS 13
 - Extend yaw bounds range to allow restricted range that crosses +/-180 deg

Security fixes:
 - Fixed XSS vulnerability that allowed script execution when hot spots
   were clicked (CVE-2019-16763)


Changes in Pannellum 2.5.4 (2019-09-10)
---------------------------------------

Bugfixes:
 - Fixed issue with loading large equirectangular panoramas on iOS
 - Fixed issue with touch-based scrolling with `draggable` set to `false`

Improvements:
 - Started requesting device orientation permission (untested)


Changes in Pannellum 2.5.3 (2019-08-21)
---------------------------------------

Bugfixes:
 - Fixed loading scenes after previous load failure
 - Fixed regression that caused auto-rotation to stop after one revolution
 - Fixed behavior of `multiResMinHfov` to match documentation;
   default multi-resolution `minHfov` behavior now matches pre-v2.5

Improvements:
 - Added optional `scale` parameter to scale hot spots while zooming
 - Improved recovery from failed scene loading

API improvements:
 - Added optional pitch argument to `startAutoRotate`

Other:
 - Added Journal of Open Source Software (JOSS) manuscript
 - Numerous documentation improvements per JOSS review (thanks @vsoch and @Fil)
 - Improved continuous integration and automated testing support
 - Clarified `generate.py` error messages
 - Added Dockerfile for `generate.py`


Changes in Pannellum 2.5.2 (2019-07-13)
---------------------------------------

Bugfixes:
 - Fixed regression in Video.js plugin


Changes in Pannellum 2.5.1 (2019-07-13)
---------------------------------------

Other:
 - Fixed issue with tagging 2.5.0 release


Changes in Pannellum 2.5.0 (2019-07-13)
---------------------------------------

New Features:
 - The background color can be set for partial panoramas
   (`backgroundColor` parameter)
 - Partial panoramas are now supported for the multiresolution format
 - An author URL can now be added (`authorURL` parameter)

New API functions:
 - Added `fullscreenchange`, `zoomchange`, and `animatefinished` events
 - Added `stopMovement` function for stopping all viewer movement

Improvements:
 - Equirectangular images are now automatically split into two separate
   textures if they're too big (images up to 8192px wide should now be
   widely supported)
 - Improved render quality for equirectangular images on mobile (using `highp`
   for fragment shader)
 - Keyboard events for keys not used by the viewer are no longer captured, and
   the list of captured keys is configurable (`capturedKeyNumbers` parameter)
 - Multiresolution tiles can now be generated from cylindrical panoramas
 - Hot spots can now be removed from scenes that aren't currently loaded
 - Hot spot cursor is now set via CSS class (so it can be overridden)
 - Hot spot link attributes can now be set (`attributes` parameter)
 - The "friction" that slows down the viewer motion can now be configured
   (`friction` parameter)
 - Dynamic scenes are now properly supported for tours

Bugfixes:
 - Fixed regression in fallback renderer
 - Fixed bug with URL encoding
 - Fixed regression in Video.js plugin
 - Fixed auto-rotate bug that was manifested when using API to set view
 - Fixed full screen bug in Chrome
 - Fixed bug with removing event listeners
 - Fixed issue with mouse dragging causing jump around yaw limits
 - Fixed bug with deleting hot spots
 - Fixed bug with fading between scenes

Other:
 - Added limited test suite / continuous integration
 - Removed `requestAnimationFrame` shim, dropping support for some
   older browsers


Changes in Pannellum 2.4.1 (2018-03-03)
---------------------------------------

Bugfixes:

 - Fix touch input issue in Chrome
 - The API's `loadScene` method now works when no scenes have been loaded yet


Changes in Pannellum 2.4.0 (2018-01-30)
---------------------------------------

New Features:

- Translation support
- Event for when scene change fade completes (`scenechangefadedone`)
- Events for touch starts and ends (`touchstart` and `touchend`)
- Added ability to set custom animation timing
  function (`animationTimingFunction` parameter)
- Added option for only enable mouse wheel zoom while in
  fullscreen (`mouseZoom` parameter)
- Added option to set title and author displayed while the load button
  is displayed (`previewTitle` and `previewAuthor` parameters)
- Mouse and touch dragging can now be disabled (`draggable` parameter)
- Added option to disable keyboard controls (`disableKeyboardCtrl` parameter)
- CORS setting can now be configured

New API functions:

- Check if image is loaded (`isLoaded`)
- Method to update viewer after it is resized (`resize`)
- Set horizon pitch and roll (`setPose`)
- Turn device orientation control on and off, check if it is supported, and
  check if it is activated (`startOrientation`, `stopOrientation`,
  `isOrientationSupported`, and `isOrientationActive`)
- Method to retrieve viewer's container element (`getContainer`)

Improvements:

- Double-clicking now causes the viewer to zoom in (and back out when
  double-clicking while zoomed in)
- New lines are now allowed in hot spot text
- Support for HTML in configuration strings can be enabled when using
  the API (`escapeHTML` parameter)
- Fallback cursor is provided for browsers that don't support SVG data URIs
- Image type configuration parameter is now validated
- Optional callbacks added to `lookAt`, `setPitch`, `setYaw`, and `setHfov`
  API functions
- Scroll events are now only captured when they're being used
- Viewer object is now assigned to a variable in the standalone viewer
- Hot spots can now be added with API before panorama is loaded
- Viewer UI is now created in a container element

Bugfixes:

- Fixed race condition when scene change hot spot is double-clicked
- Fixed bug with preview image absolute URLs
- Removed redundant constraints on yaw in API
- Tabbing now works, and only events for keys that are used are captured
- Fixed bug in HTML escaping
- Fixed bug that sometimes occurred when `orientationOnByDefault` was `true`
- Yaw no longer changes when device orientation mode is activated
- Fixed iOS 10 canvas size too big issue
- Fixed iOS 10 NPOT cube map issue
- Hot spots added via API are now permanent between scene changes
- Fixed multiple bugs with removing event listeners
- Fixed bug with multiresolution tile loading
- Fixed `sameAzimuth` target yaw not working when `northOffset` wasn't set
- Fixed bug yaw out of bounds in `mouseEventToCoords`
- Fixed bug with `animateMove` function
- Fixed bug with scene change fade
- Yaw animation is now always in the shortest direction
- Fixed bug related to removing hot spots


Changes in Pannellum 2.3.2 (2016-11-20)
---------------------------------------

Bugfixes:

 - Fix Chrome fullscreen regression introduced in 2.3.1


Changes in Pannellum 2.3.1 (2016-11-19)
---------------------------------------

Bugfixes:

 - Removed use of poorly supported ES6 `Math.sign` function
 - Fixed fullscreen bug in Internet Explorer
 - Fixed framerate issue with device orientation control enabled

Improvements:

 - Better handling of view limits when both limits are in view


Changes in Pannellum 2.3.0 (2016-10-30)
---------------------------------------

New Features:

 - Device orientation support for mobile devices
 - Event framework for API
 - Partial panorama background color can now be set using
   `backgroundColor` parameter
 - Custom hot spots are now supported as are hot spot click handlers
 - Hot spots can now specify target HFOV (`targetHfov` parameter)
 - Parameter to hide all controls (`showControls`)
 - Parameter to disable mouse zooming (`mouseZoom`)

New API functions:

 - Destructor (`destroy`)
 - Look at position (`lookAt`)
 - Get current scene ID (`getScene`)
 - Load scene (`loadScene`)
 - Add and remove scenes (`addScene` and `removeScene`)
 - Add and remove hot spots (`addHotSpot` and `removeHotSpot`)
 - Auto rotate start / stop (`startAutoRotate` and `stopAutoRotate`)
 - Retrieve current configuration (`getConfig`)
 - Toggle fullscreen (`toggleFullscreen`)
 - Get and set north offset (`getNorthOffset` and `setNorthOffset`)

Improvements:

 - Pitch and yaw limits are now applied to edge of viewer instead of center
 - Panorama extents can now be set using URL parameters
 - Individual XMP metadata parameters can now be overridden
 - Horizon pitch and roll can now be manually set (was previously only
   supported via XMP metadata)
 - When auto rotate restarts, the pitch and HFOV now return to their
   original values
 - API movements can now be animated
 - Standalone viewer is more mobile friendly
 - Improved touch panning interaction
 - Fragments identifiers can now be used for standalone viewer configuration
 - Blob URLs are now supported
 - Added hot spot debug indicator
 - Video.js plugin now accepts a Pannellum configuration

Bugfixes:

 - Fixed numerous auto rotate bugs
 - Auto rotate speed is now actually in degrees per second
 - Long error URLs are now properly wrapped
 - Fixed mobile device orientation change bug
 - Fixed Safari fullscreen bug
 - Fullscreen now works in IE
 - Fixed Chrome bug where hot spots appeared above controls
 - Scene fades with multires now work properly
 - Hot spot target pointing now works when set to zero
 - Hot spots without text are now properly handled
 - Fixed memory leaks
 - Fixed multires tile loading error
 - Fixed a few URL handling bugs
 - Fixed multires zoom jumping when viewer was resized
 - Title and author are now reset when changing scenes
 - Mouse handlers now work with Hi-DPI displays
 - Minimum and maximum HFOV can now both be set to the same value

Backwards-Incompatible Configuration Parameter Changes:

 - The deprecated `tour` parameter was removed; tour JSON configuration files
   can be used with the `config` parameter


Changes in Pannellum 2.2.1 (2016-03-11)
---------------------------------------

New Features:

 - NPM support

Improvements:

 - Set `Accept` header to request images
 - Ensure `hfov` is a number
 - Better restriction on yaw range


Changes in Pannellum 2.2.0 (2016-01-27)
---------------------------------------

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


Changes in Pannellum 2.1.1 (2015-01-19)
---------------------------------------

Bugfixes:
 - Force subpixel rendering for hot spots


Changes in Pannellum 2.1.0 (2015-01-14)
---------------------------------------

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


Changes in Pannellum 2.0.1 (2014-08-24)
---------------------------------------

Bugfixes:
 - Fix keyboard controls in Safari


Changes in Pannellum 2.0 (2014-08-22)
-------------------------------------

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


Changes in Pannellum 1.2 (2012-08-28)
-------------------------------------

New Features:

 - Added keyboard panning controls
 - Added support for a fallback URL if WebGL is not supported

Improvements:

 - Clarified load button text
 - Switched from raster to vector icons

Bugfixes:

 - Added workaround for WebKit fullscreen regression
