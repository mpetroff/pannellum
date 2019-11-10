# JSON Configuration File Options



## General options


### `type` (string)

This specifies the panorama type. Can be `equirectangular`, `cubemap`, or
`multires`. Defaults to `equirectangular`.


### `title` (string)

If set, the value is displayed as the panorama's title. If no title is desired,
don't set this parameter.


### `author` (string)

If set, the value is displayed as the panorama's author. If no author is
desired, don't set this parameter.


### `authorURL` (string)

If set, the displayed author text is hyperlinked to this URL. If no author URL
is desired, don't set this parameter. The `author` parameter must also be set
for this parameter to have an effect.


### `strings` (dictionary)

Allows user-facing strings to be changed / translated.
See `defaultConfig.strings` definition in `pannellum.js` for more details.


### `basePath` (string)

This specifies a base path to load the images from.


### `autoLoad` (boolean)

When set to `true`, the panorama will automatically load. When `false`, the
user needs to click on the load button to load the panorama. Defaults to
`false`.


### `autoRotate` (number)

Setting this parameter causes the panorama to automatically rotate when loaded.
The value specifies the rotation speed in degrees per second. Positive is
counter-clockwise, and negative is clockwise.


### `autoRotateInactivityDelay` (number)

Sets the delay, in milliseconds, to start automatically rotating the panorama
after user activity ceases. This parameter only has an effect if the
`autoRotate` parameter is set. Before starting rotation, the viewer is panned
to the initial pitch.


### `autoRotateStopDelay` (number)

Sets the delay, in milliseconds, to stop automatically rotating the panorama
after it is loaded. This parameter only has an effect if the `autoRotate`
parameter is set.


### `fallback` (string)

If set, the value is used as a URL for a fallback viewer in case Pannellum is
not supported by the user's device. The user will be given the option to click
a link and visit this URL if Pannellum fails to work.


### `orientationOnByDefault` (boolean)

If set to `true`, device orientation control will be used when the panorama is
loaded, if the device supports it. If false, device orientation control needs
to be activated by pressing a button. Defaults to `false`. Note that a secure
HTTPS connection is required for device orientation access in most browsers.


### `showZoomCtrl` (boolean)

If set to `false`, the zoom controls will not be displayed. Defaults to `true`.


### `keyboardZoom` (boolean)

If set to `false`, zooming with keyboard will be disabled. Defaults to `true`.


### `mouseZoom` (boolean or string)

If set to `false`, zooming with mouse wheel will be disabled. Defaults to `true`.
Can also be set to `fullscreenonly`, in which case it is only enabled when the
viewer is fullscreen.


### `draggable` (boolean)

If set to `false`, mouse and touch dragging is disabled. Defaults to `true`.


### `friction` (number)

Controls the "friction" that slows down the viewer motion after it is dragged
and released. Higher values mean the motion stops faster. Should be set
(0.0, 1.0]; defaults to 0.15.


### `disableKeyboardCtrl` (boolean)

If set to `true`, keyboard controls are disabled. Defaults to `false`.


### `showFullscreenCtrl` (boolean)

If set to `false`, the fullscreen control will not be displayed. Defaults to
`true`. The fullscreen button will only be displayed if the browser supports
the fullscreen API.


### `showControls` (boolean)

If set to `false`, no controls are displayed. Defaults to `true`.


### `touchPanSpeedCoeffFactor` (number)

Adjusts panning speed from touch inputs. Defaults to `1`.


### `yaw` (number)

Sets the panorama's starting yaw position in degrees. Defaults to `0`.


### `pitch` (number)

Sets the panorama's starting pitch position in degrees. Defaults to `0`.


### `hfov` (number)

Sets the panorama's starting horizontal field of view in degrees. Defaults to
`100`.


### `minYaw` and `maxYaw` (number)

Sets the minimum / maximum yaw the viewer edge can be at, in degrees.
Defaults to `-180` / `180`, i.e. no limit.


### `minPitch` and `maxPitch` (number)

Sets the minimum / maximum pitch the viewer edge can be at, in degrees.
Defaults to `undefined`, so the viewer center can reach `-90` / `90`.


### `minHfov` and `maxHfov` (number)

Sets the minimum / maximum horizontal field of view, in degrees, that the
viewer can be set to. Defaults to `50` / `120`. Unless the `multiResMinHfov`
parameter is set to `true`, the `minHfov` parameter is ignored for
`multires` panoramas.


### `multiResMinHfov` (boolean)

When set to `false`, the `minHfov` parameter is ignored for `multires`
panoramas; an automatically calculated minimum horizontal field of view is used
instead. Defaults to `false`.


### `compass` (boolean)

If `true`, a compass is displayed. Normally defaults to `false`; defaults to
`true` if heading information is present in Photo Sphere XMP metadata.


### `northOffset` (number)

Set the offset, in degrees, of the center of the panorama from North. As this
affects the compass, it only has an effect if `compass` is set to `true`.


### `preview` (string)

Specifies a URL for a preview image to display before the panorama is loaded.


### `previewTitle` (string)

Specifies the title to be displayed while the load button is displayed.


### `previewAuthor` (string)

Specifies the author to be displayed while the load button is displayed.


### `horizonPitch` and `horizonRoll` (number)

Specifies pitch / roll of image horizon, in degrees (for correcting
non-leveled panoramas).


### `animationTimingFunction` (function) [API only]

This specifies a timing function to be used for animating movements such as
when the `lookAt` method is called. The default timing function is
`easeInOutQuad`. If a custom function is specified, it should take a number
[0, 1] as its only argument and return a number [0, 1].


### `escapeHTML` (boolean)

When true, HTML is escaped from configuration strings to help mitigate possible
DOM XSS attacks. This is always `true` when using the standalone viewer since
the configuration is provided via the URL; it defaults to `false` but can be
set to `true` when using the API.


### `crossOrigin` (string)

This specifies the type of CORS request used and can be set to either
`anonymous` or `use-credentials`. Defaults to `anonymous`.


### `hotSpots` (object)

This specifies a dictionary of hot spots that can be links to other scenes,
information, or external links. Each array element has the following properties.


#### `pitch` (number)

Specifies the pitch portion of the hot spot's location, in degrees.


#### `yaw` (number)

Specifies the yaw portion of the hot spot's location, in degrees.


#### `type` (string)

Specifies the type of the hot spot. Can be `scene` for scene links or `info`
for information hot spots. A tour configuration file is required for `scene`
hot spots.

#### `text` (string)

This specifies the text that is displayed when the user hovers over the hot
spot.

#### `URL` (string)

If specified for an `info` hot spot, the hot spot links to the specified URL.
Not applicable for `scene` hot spots.

#### `attributes` (dict)

Specifies URL's link attributes. If not set, the `target` attribute is set to
`_blank`, to open link in new tab to avoid opening in viewer frame / page.

#### `sceneId` (string)

Specifies the ID of the scene to link to for `scene` hot spots. Not applicable
for `info` hot spots.

#### `targetPitch` (number)

Specifies the pitch of the target scene, in degrees. Can also be set to `same`,
which uses the current pitch of the current scene as the initial pitch of the
target scene.

#### `targetYaw` (number)

Specifies the yaw of the target scene, in degrees. Can also be set to `same` or
`sameAzimuth`. These settings use the current yaw of the current scene as the
initial yaw of the target scene; `same` uses the current yaw directly, while
`sameAzimuth` takes into account the `northOffset` values of both scenes to
maintain the same direction with regard to north.

#### `targetHfov` (number)

Specifies the HFOV of the target scene, in degrees. Can also be set to `same`,
which uses the current HFOV of the current scene as the initial HFOV of the
target scene.

#### `id`

Specifies hot spot ID, for use with API's `removeHotSpot` function.

#### `cssClass` (string)

If specified, string is used as the CSS class for the hot spot instead of the
default CSS classes.

#### `createTooltipFunc` (function) and `createTooltipArgs` (object)

If `createTooltipFunc` is specified, this function is used to create the hot
spot tooltip DOM instead of the default function. The contents of
`createTooltipArgs` are passed to the function as arguments.

#### `clickHandlerFunc` (function) and `clickHandlerArgs` (object)

If `clickHandlerFunc` is specified, this function is added as an event handler
for the hot spot's `click` event. The event object and the contents of
`clickHandlerArgs` are passed to the function as arguments.

#### `scale` (boolean)

When `true`, the hot spot is scaled to match changes in the field of view,
relative to the initial field of view. Note that this does not account for
changes in local image scale that occur due to distortions within the viewport.
Defaults to `false`.

### `hotSpotDebug` (boolean)

When `true`, the mouse pointer's pitch and yaw are logged to the console when
the mouse button is clicked. Defaults to `false`.

### `sceneFadeDuration` (number)

Specifies the fade duration, in milliseconds, when transitioning between
scenes. Not defined by default. Only applicable for tours. Only works with
WebGL renderer.

### `capturedKeyNumbers` (array)

Specifies the key numbers that are captured in key events. Defaults to the
standard keys that are used by the viewer.

### `backgroundColor` ([number, number, number])

Specifies an array containing RGB values [0, 1] that sets the background color
for areas where no image data is available. Defaults to `[0, 0, 0]` (black).
For partial `equirectangular` panoramas this applies to areas past the edges of
the defined rectangle. For `multires` and `cubemap` (including fallback) panoramas
this applies to areas corresponding to missing tiles or faces.

### `avoidShowingBackground` (boolean)

If set to `true`, prevent displaying out-of-range areas of a partial panorama
by constraining the yaw and the field-of-view. Even at the corners and edges
of the canvas only areas actually belonging to the image
(i.e., within [`minYaw`, `maxYaw`] and [`minPitch`, `maxPitch`]) are shown,
thus setting the `backgroundColor` option is not needed if this option is set.
Defaults to `false`.


## `equirectangular` specific options

### `panorama` (string)

Sets the URL to the equirectangular panorama image. This is relative to
`basePath` if it is set, else it is relative to the location of
`pannellum.htm`. An absolute URL can also be used.

### `haov` (number)

Sets the panorama's horizontal angle of view, in degrees. Defaults to `360`.
This is used if the equirectangular image does not cover a full 360 degrees in
the horizontal.

### `vaov` (number)

Sets the panorama's vertical angle of view, in degrees. Defaults to `180`. This
is used if the equirectangular image does not cover a full 180 degrees in the
vertical.

### `vOffset` (number)

Sets the vertical offset of the center of the equirectangular image from the
horizon, in degrees. Defaults to `0`. This is used if `vaov` is less than `180`
and the equirectangular image is not cropped symmetrically.

### `ignoreGPanoXMP` (boolean)

If set to `true`, any embedded Photo Sphere XMP data will be ignored; else,
said data will override any existing settings. Defaults to `false`.



## `cubemap` specific options

### `cubeMap`

This is an array of URLs for the six cube faces in the order front, right,
back, left, up, down. These are relative to `basePath` if it is set, else they
are relative to the location of `pannellum.htm`. Absolute URLs can also be
used. Partial cubemap images may be specified by giving `null` instead of a URL.


## `multires` specific options

### `multiRes`

This contains information about the multiresolution panorama in sub-keys.


#### `basePath` (string)

This is the base path of the URLs for the multiresolution tiles. It is relative
to the regular `basePath` option if it is defined, else it is relative to the
location of `pannellum.htm`. An absolute URL can also be used.


#### `path` (string)

This is a format string for the location of the multiresolution tiles, relative
to `multiRes.basePath`, which is relative to `basePath`. Format parameters are
`%l` for the zoom level, `%s` for the cube face, `%x` for the x index, and
`%y` for the y index. For each tile, `.extension` is appended.


#### `fallbackPath` (string)

This is a format string for the location of the fallback tiles for the CSS 3D
transform-based renderer if the WebGL renderer is not supported, relative
to `multiRes.basePath`, which is relative to `basePath`. The only format
parameter is `%s`, for the cube face. For each face, `.extension` is appended.


#### `extension` (string)

Specifies the tiles' file extension. Do not include the `.`.


#### `tileResolution` (number)

This specifies the size in pixels of each image tile.


#### `maxLevel` (number)

This specifies the maximum zoom level.


#### `cubeResolution` (number)

This specifies the size in pixels of the full resolution cube faces the image
tiles were created from.



## Dynamic content specific options

Currently, only equirectangular dynamic content is supported.

### `dynamic` (boolean)

The panorama source is considered dynamic when this is set to `true`. Defaults
to `false`. This should be set to `true` for video.

### `dynamicUpdate` (boolean)

For dynamic content, viewer will start automatically updating when set to
`true`. Defaults to `false`. If the updates are controlled via the `setUpdate`
method, as with the Video.js plugin, this should be set to `false`.



## Additional information for tour configuration files

A tour configuration file contains two top level properties, `default` and
`scenes`. The `default` property contains options that are used for each scene,
but options specified for individual scenes override these options. The
`default` property is required to have a `firstScene` property that contains
the scene ID for the first scene to be displayed. The `scenes` property
contains a dictionary of scenes, specified by scene IDs. The values assigned to
these IDs are specific to each scene.
