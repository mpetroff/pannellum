# JSON Configuration File Options



## General options


### `type`

This specifies the panorama type. Can be `equirectangular`, `cubemap`, or
`multires`. Defaults to `equirectangular`.


### `title`

If set, the value is displayed as the panorama's title. If no title is desired,
don't set this parameter.


### `author`

If set, the value is displayed as the panorama's author. If no author is
desired, don't set this parameter.


### `basePath`

This specifies a base path to load the images from.


### `autoLoad`

When set to `true`, the panorama will automatically load. When `false`, the
user needs to click on the load button to load the panorama. Defaults to
`false`.


### `autoRotate`

Setting this parameter causes the panorama to automatically rotate when loaded.
The value specifies the rotation speed in degrees per second. Positive is
counter-clockwise, and negative is clockwise.


### `autoRotateInactivityDelay`

Sets the delay, in milliseconds, to start automatically rotating the panorama
after user activity ceases. This parameter only has an effect if the
`autoRotate` parameter is set.


### `autoRotateStopDelay`

Sets the delay, in milliseconds, to stop automatically rotating the panorama
after it is loaded. This parameter only has an effect if the `autoRotate`
parameter is set.


### `fallback`

If set, the value is used as a URL for a fallback viewer in case Pannellum is
not supported by the user's device. The user will be given the option to click
a link and visit this URL if Pannellum fails to work.


### `header`

If this parameter is set, the contents of its value will be inserted into the
header of `pannellum.htm`. This is useful if one wants to modify Pannellum's
CSS.


### `showZoomCtrl`

If set to `false`, the zoom controls will not be displayed. Defaults to `true`.


### `keyboardZoom`

If set to `false`, zooming with keyboard will be disabled. Defaults to `true`.


### `showFullscreenCtrl`

If set to `false`, the fullscreen control will not be displayed. Defaults to
`true`. The fullscreen button will only be displayed if the browser supports
the fullscreen API.


### `yaw`

Sets the panorama's starting yaw position in degrees. Defaults to `0`.


### `pitch`

Sets the panorama's starting pitch position in degrees. Defaults to `0`.


### `hfov`

Sets the panorama's starting horizontal field of view in degrees. Defaults to
`100`.


### `minYaw` and `maxYaw`

Sets the minimum / maximum yaw the viewer can be centered at, in degrees.
Defaults to `-360` / `360`, i.e. no limit.


### `minPitch` and `maxPitch`

Sets the minimum / maximum pitch the viewer can be centered at, in degrees.
Defaults to `-85` / `85`.


### `minHfov` and `maxHfov`

Sets the minimum / maximum horizontal field of view, in degrees, that the
viewer can be set to. Defaults to `50` / `120`.


### `compass`

If `true`, a compass is displayed. Defaults to `false`.


### `northOffset`

Set the offset, in degrees, of the center of the panorama from North. As this
affects the compass, it only has an effect if `compass` is set to `true`.


### `preview`

Specifies a URL for a preview image to display before the panorama is loaded.


### `hotSpots`

This specifies an array of hot spots that can be links to other scenes,
information, or external links. Each array element has the following properties.


#### `pitch`

Specifies the pitch portion of the hot spot's location.


#### `yaw`

Specifies the yaw portion of the hot spot's location.


#### `type`

Specifies the type of the hot spot. Can be `scene` for scene links or `info`
for information hot spots. A tour configuration file is required for `scene`
hot spots.

#### `text`

This specifies the text that is displayed when the user hovers over the hot
spot.

#### `URL`

If specified for an `info` hot spot, the hot spot links to the specified URL.
Not applicable for `scene` hot spots.

#### `sceneId`

Specifies the ID of the scene to link to for `scene` hot spots. Not applicable
for `info` hot spots.

#### `targetPitch`

Specifies the pitch of the target scene.

#### `targetYaw`

Specifies the yaw of the target scene.

### `hotSpotDebug`

When `true`, the mouse pointer's pitch and yaw are logged to the console when
the mouse button is clicked. Defaults to `false`.

### `sceneFadeDuration`

Specifies the fade duration, in milliseconds, when transitioning between
scenes. Not defined by default. Only applicable for tours. Only works with
WebGL renderer.



## `equirectangular` specific options

### `panorama`

Sets the URL to the equirectangular panorama image. This is relative to
`basePath` if it is set, else it is relative to the location of
`pannellum.htm`. An absolute URL can also be used.


### `haov`

Sets the panorama's horizontal angle of view, in degrees. Defaults to `360`.
This is used if the equirectangular image does not cover a full 360 degrees in
the horizontal.


### `vaov`

Sets the panorama's vertical angle of view, in degrees. Defaults to `180`. This
is used if the equirectangular image does not cover a full 180 degrees in the
vertical.


### `vOffset`

Sets the vertical offset of the center of the equirectangular image from the
horizon, in degrees. Defaults to `0`. This is used if `vaov` is less than `180`
and the equirectangular image is not cropped symmetrically.

### `ignoreGPanoXMP`

If set to `true`, any embedded Photo Sphere XMP data will be ignored; else,
said data will override any existing settings. Defaults to `false`.



## `cubemap` specific options

### `cubeMap`

This is an array of URLs for the six cube faces in the order front, right,
back, left, up, down. These are relative to `basePath` if it is set, else they
are relative to the location of `pannellum.htm`. Absolute URLs can also be
used.



## `multires` specific options

### `multiRes`

This contains information about the multiresolution panorama in sub-keys.


#### `basePath`

This is the base path of the URLs for the multiresolution tiles. It is relative
to the regular `basePath` option if it is defined, else it is relative to the
location of `pannellum.htm`. An absolute URL can also be used.


#### `path`

This is a format string for the location of the multiresolution tiles, relative
to `multiRes.basePath`, which is relative to `basePath`. Format parameters are
`%l` for the zoom level, `%s` for the cube face, `%x` for the x index, and
`%y` for the y index. For each tile, `.extension` is appended.


#### `fallbackPath`

This is a format string for the location of the fallback tiles for the CSS 3D
transform-based renderer if the WebGL renderer is not supported, relative
to `multiRes.basePath`, which is relative to `basePath`. The only format
parameter is `%s`, for the cube face. For each face, `.extension` is appended.


#### `extension`

Specifies the tiles' file extension. Do not include the `.`.


#### `tileResolution`

This specifies the size in pixels of each image tile.


#### `maxLevel`

This specifies the maximum zoom level.


#### `cubeResolution`

This specifies the size in pixels of the full resolution cube faces the image
tiles were created from.



## Dynamic content specific options

Currently, only equirectangular dynamic content is supported.

### `dynamic`

The panorama source is considered dynamic when this is set to `true`. Defaults
to `false`. This should be set to `true` for video.



## Additional information for tour configuration files

A tour configuration file contains two top level properties, `default` and
`scenes`. The `default` property contains options that are used for each scene,
but options specified for individual scenes override these options. The
`default` property is required to have a `firstScene` property that contains
the scene ID for the first scene to be displayed. The `scenes` property
contains a dictionary of scenes, specified by scene IDs. The values assigned to
these IDs are specific to each scene.
