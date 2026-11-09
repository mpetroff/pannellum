export function viewer(container: HTMLElement | string, 
    config?: GeneralOptions | 
        EquirectangularConfigureOptions | 
        MultiresConfigureOptions | 
    TourOptions
): Viewer;

interface Viewer {
    new (container: HTMLElement|string, initialConfig:Object): Viewer;
    
    /**
     * Checks whether or not a panorama is loaded.
     * @memberof Viewer
     * @instance
     * @returns {boolean} `true` if a panorama is loaded, else `false`
     */
    isLoaded(): boolean;

    /**
     * Returns the pitch of the center of the view.
     * @memberof Viewer
     * @instance
     * @returns {number} Pitch in degrees
     */
    getPitch(): number;

    /**
     * Sets the pitch of the center of the view.
     * @memberof Viewer
     * @instance
     * @param {number} pitch - Pitch in degrees
     * @param {boolean|number} [animated=1000] - Animation duration in milliseconds or false for no animation
     * @param {function} [callback] - Function to call when animation finishes
     * @param {object} [callbackArgs] - Arguments to pass to callback function
     * @returns {Viewer} `this`
     */
    setPitch(pitch: number, animated?: boolean|number, callback?: {(...args: any[]):any}, callbackArgs?: object): Viewer;

    /**
     * Returns the minimum and maximum allowed pitches (in degrees).
     * @memberof Viewer
     * @instance
     * @returns {number[]} [minimum pitch, maximum pitch]
     */
    getPitchBounds(): number[];

    /**
     * Set the minimum and maximum allowed pitches (in degrees).
     * @memberof Viewer
     * @instance
     * @param {number[]} bounds - [minimum pitch, maximum pitch]
     * @returns {Viewer} `this`
     */
    setPitchBounds(bounds: number[]): Viewer;

    /**
     * Returns the yaw of the center of the view.
     * @memberof Viewer
     * @instance
     * @returns {number} Yaw in degrees
     */
    getYaw(): number;

    /**
     * Sets the yaw of the center of the view.
     * @memberof Viewer
     * @instance
     * @param {number} yaw - Yaw in degrees [-180, 180]
     * @param {boolean|number} [animated=1000] - Animation duration in milliseconds or false for no animation
     * @param {function} [callback] - Function to call when animation finishes
     * @param {object} [callbackArgs] - Arguments to pass to callback function
     * @returns {Viewer} `this`
     */
    setYaw(yaw: number, animated?: boolean|number, callback?: {(...args: any[]):any}, callbackArgs?: object): Viewer;

    /**
     * Returns the minimum and maximum allowed pitches (in degrees).
     * @memberof Viewer
     * @instance
     * @returns {number[]} [yaw pitch, maximum yaw]
     */
    getYawBounds(): number[];

    /**
     * Set the minimum and maximum allowed yaws (in degrees [-360, 360]).
     * @memberof Viewer
     * @instance
     * @param {number[]} bounds - [minimum yaw, maximum yaw]
     * @returns {Viewer} `this`
     */
    setYawBounds(bounds: number[]): Viewer;

    /**
     * Returns the horizontal field of view.
     * @memberof Viewer
     * @instance
     * @returns {number} Horizontal field of view in degrees
     */
    getHfov(): number;

    /**
     * Sets the horizontal field of view.
     * @memberof Viewer
     * @instance
     * @param {number} hfov - Horizontal field of view in degrees
     * @param {boolean|number} [animated=1000] - Animation duration in milliseconds or false for no animation
     * @param {function} [callback] - Function to call when animation finishes
     * @param {object} [callbackArgs] - Arguments to pass to callback function
     * @returns {Viewer} `this`
     */
    setHfov(hfov: number, animated?:boolean|number, callback?:{(...args:any): any}, callbackArgs?: object ): Viewer;

    /**
     * Returns the minimum and maximum allowed horizontal fields of view
     * (in degrees).
     * @memberof Viewer
     * @instance
     * @returns {number[]} [minimum HFOV, maximum HFOV]
     */
    getHfovBounds(): number[];

    /**
     * Set the minimum and maximum allowed horizontal fields of view (in degrees).
     * @memberof Viewer
     * @instance
     * @param {number[]} bounds - [minimum HFOV, maximum HFOV]
     * @returns {Viewer} `this`
     */
    setHfovBounds(bounds: number[]): Viewer;

    /**
     * Set a new view. Any parameters not specified remain the same.
     * @memberof Viewer
     * @instance
     * @param {number} [pitch] - Target pitch
     * @param {number} [yaw] - Target yaw
     * @param {number} [hfov] - Target HFOV
     * @param {boolean|number} [animated=1000] - Animation duration in milliseconds or false for no animation
     * @param {function} [callback] - Function to call when animation finishes
     * @param {object} [callbackArgs] - Arguments to pass to callback function
     * @returns {Viewer} `this`
     */
    lookAt(pitch?: number, yaw?:number, hfov?:number, animated?: boolean|number, callback?: {(...args:any):any}, callbackArgs?: object ): Viewer;

    /**
     * Returns the panorama's north offset.
     * @memberof Viewer
     * @instance
     * @returns {number} North offset in degrees
     */
    getNorthOffset(): number;

    /**
     * Sets the panorama's north offset.
     * @memberof Viewer
     * @instance
     * @param {number} heading - North offset in degrees
     * @returns {Viewer} `this`
     */
    setNorthOffset(heading: number): Viewer;

    /**
     * Returns the panorama's horizon roll.
     * @memberof Viewer
     * @instance
     * @returns {number} Horizon roll in degrees
     */
    getHorizonRoll(): number;

    /**
     * Sets the panorama's horizon roll.
     * @memberof Viewer
     * @instance
     * @param {number} roll - Horizon roll in degrees [-90, 90]
     * @returns {Viewer} `this`
     */
    setHorizonRoll(roll: number): Viewer;

    /**
     * Returns the panorama's horizon pitch.
     * @memberof Viewer
     * @instance
     * @returns {number} Horizon pitch in degrees
     */
    getHorizonPitch(): number;

    /**
     * Sets the panorama's horizon pitch.
     * @memberof Viewer
     * @instance
     * @param {number} pitch - Horizon pitch in degrees [-90, 90]
     * @returns {Viewer} `this`
     */
    setHorizonPitch(pitch: number): Viewer;

    /**
     * Start auto rotation.
     *
     * Before starting rotation, the viewer is panned to `pitch`.
     * @memberof Viewer
     * @instance
     * @param {number} [speed] - Auto rotation speed / direction. If not specified, previous value is used.
     * @param {number} [pitch] - The pitch to rotate at. If not specified, initial pitch is used.
     * @param {number} [hfov] - The HFOV to rotate at. If not specified, initial HFOV is used.
     * @param {number} [inactivityDelay] - The delay, in milliseconds, after which
     *      to automatically restart auto rotation if it is interupted by the user.
     *      If not specified, auto rotation will not automatically restart after it
     *      is stopped.
     * @returns {Viewer} `this`
     */
    startAutoRotate(speed?: number, pitch?: number, hfov?: number, inactivityDelay?: number): Viewer;

    /**
     * Stop auto rotation.
     * @memberof Viewer
     * @instance
     * @returns {Viewer} `this`
     */
    stopAutoRotate(): Viewer;

    /**
     * Stops all movement.
     * @memberof Viewer
     * @instance
     */
    stopMovement(): Viewer;

    /**
     * Returns the panorama renderer.
     * @memberof Viewer
     * @instance
     * @returns {Renderer}
     */
    getRenderer(): Renderer;

    /**
     * Sets update flag for dynamic content.
     * @memberof Viewer
     * @instance
     * @param {boolean} bool - Whether or not viewer should update even when still
     * @returns {Viewer} `this`
     */
    setUpdate(bool: boolean): Viewer;

    /**
     * Calculate panorama pitch and yaw from location of mouse event.
     * @memberof Viewer
     * @instance
     * @param {MouseEvent} event - Document mouse down event.
     * @returns {number[]} [pitch, yaw]
     */
    mouseEventToCoords(event: MouseEvent): number[];

    /**
     * Change scene being viewed.
     * @memberof Viewer
     * @instance
     * @param {string} sceneId - Identifier of scene to switch to.
     * @param {number} [pitch] - Pitch to use with new scene
     * @param {number} [yaw] - Yaw to use with new scene
     * @param {number} [hfov] - HFOV to use with new scene
     * @returns {Viewer} `this`
     */
    loadScene(sceneId: string, pitch?: number, yaw?: number, hfov?: number): Viewer;

    /**
     * Get ID of current scene.
     * @memberof Viewer
     * @instance
     * @returns {string} ID of current scene
     */
    getScene(): string;

    /**
     * Add a new scene.
     * @memberof Viewer
     * @instance
     * @param {string} sceneId - The ID of the new scene
     * @param {Object} config - The configuration of the new scene
     * @returns {Viewer} `this`
     */
    addScene(sceneId: string, config: Object): Viewer;

    /**
     * Remove a scene.
     * @memberof Viewer
     * @instance
     * @param {string} sceneId - The ID of the scene
     * @returns {boolean} False if the scene is the current scene or if the scene doesn't exists, else true
     */
    removeScene(sceneId: string): boolean;

    /**
     * Toggle fullscreen.
     * @memberof Viewer
     * @instance
     * @returns {Viewer} `this`
     */
    toggleFullscreen(): Viewer;

    /**
     * Get configuration of current scene.
     * @memberof Viewer
     * @instance
     * @returns {Object} Configuration of current scene
     */
    getConfig(): Object;

    /**
     * Get viewer's container element.
     * @memberof Viewer
     * @instance
     * @returns {HTMLElement} Container `div` element
     */
    getContainer(): HTMLElement;

    /**
     * Add a new hot spot.
     * @memberof Viewer
     * @instance
     * @param {Object} hs - The configuration for the hot spot
     * @param {string} [sceneId] - Adds hot spot to specified scene if provided, else to current scene
     * @returns {Viewer} `this`
     * @throws Throws an error if the scene ID is provided but invalid
     */
    addHotSpot(hs: Object, sceneId?: string): Viewer;

    /**
     * Remove a hot spot.
     * @memberof Viewer
     * @instance
     * @param {string} hotSpotId - The ID of the hot spot
     * @param {string} [sceneId] - Removes hot spot from specified scene if provided, else from current scene
     * @returns {boolean} True if deletion is successful, else false
     */
    removeHotSpot(hotSpotId: string, sceneId?: string): boolean;

    /**
     * This method should be called if the viewer's container is resized.
     * @memberof Viewer
     * @instance
     */
    resize(): void;

    /**
     * Check if device orientation control is supported.
     * @memberof Viewer
     * @instance
     * @returns {boolean} True if supported, else false
     */
    isOrientationSupported(): boolean;

    /**
     * Stop using device orientation.
     * @memberof Viewer
     * @instance
     */
    stopOrientation(): void;

    /**
     * Start using device orientation (does nothing if not supported).
     * @memberof Viewer
     * @instance
     */
    startOrientation(): void;

    /**
     * Check if device orientation control is currently activated.
     * @memberof Viewer
     * @instance
     * @returns {boolean} True if active, else false
     */
    isOrientationActive(): boolean;

    /**
     * Subscribe listener to specified event.
     * @memberof Viewer
     * @instance
     * @param {string} type - Type of event to subscribe to.
     * @param {Function} listener - Listener function to subscribe to event.
     * @returns {Viewer} `this`
     */
    on(type: string, listener: {(...args:any[]): any}): Viewer;

    /**
     * Remove an event listener (or listeners).
     * @memberof Viewer
     * @param {string} [type] - Type of event to remove listeners from. If not specified, all listeners are removed.
     * @param {Function} [listener] - Listener function to remove. If not specified, all listeners of specified type are removed.
     * @returns {Viewer} `this`
     */
    off(type?:string, listener?: {(...args:any[]):any}): Viewer;
}

interface Renderer {
    // Opacity interface.
}

interface GeneralOptions {
    /** This specifies the panorama type. Can be equirectangular, cubemap, 
     *  or multires. Defaults to equirectangular. 
     **/
    type?:string;

    /** If set, the value is displayed as the panorama’s title. 
     *  If no title is desired, don’t set this parameter.
     **/
    title?: string;

    /** If set, the value is displayed as the panorama’s author. If no author
     *  is desired, don’t set this parameter. 
     **/
    author?: string;

    /** If set, the displayed author text is hyperlinked to this URL. If no 
     *  author URL is desired, don’t set this parameter. The author parameter 
     *  must also be set for this parameter to have an effect. 
     **/
    authorURL?: string;

    /** Allows user-facing strings to be changed / translated. See 
     *  defaultConfig.strings definition in pannellum.js for more details. 
     **/
    strings?: {[key:string]:string};

    /** This specifies a base path to load the images from. */
    basePath?: string;

    /** When set to true, the panorama will automatically load. When false, 
     *  the user needs to click on the load button to load the panorama. 
     *  Defaults to false. */
    autoLoad?: boolean;

    /** Setting this parameter causes the panorama to automatically rotate when 
     *  loaded. The value specifies the rotation speed in degrees per second. 
     *  Positive is counter-clockwise, and negative is clockwise.
     **/
    autoRotate?: number;

    /** Sets the delay, in milliseconds, to start automatically rotating the 
     *  panorama after user activity ceases. This parameter only has an effect if
     *  the autoRotate parameter is set. Before starting rotation, the viewer is 
     *  panned to the initial pitch.
    */
    autoRotateInactivityDelay?: number;

    /** Sets the delay, in milliseconds, to stop automatically rotating the 
     *  panorama after it is loaded. This parameter only has an effect if the
     *  autoRotate parameter is set. 
     **/
    autoRotateStopDelay?: number;

    /** If set to true, device orientation control will be used when the 
     *  panorama is loaded, if the device supports it. If false, device 
     *  orientation control needs to be activated by pressing a button.
     *  Defaults to false.
     **/
    orientationOnByDefault?: boolean;

    /** If set to false, the zoom controls will not be displayed. Defaults 
     *  to true. 
     **/
    showZoomCtrl?: boolean

    /** If set to false, zooming with keyboard will be disabled. Defaults to
     *  true. 
     **/
    keyboardZoom?: boolean

    /**If set to false, zooming with mouse wheel will be disabled. Defaults to 
     * true. Can also be set to fullscreenonly, in which case it is only enabled
     * when the viewer is fullscreen.
     **/
    mouseZoom?: boolean|string;

    /** If set to false, mouse and touch dragging is disabled. Defaults to true.
     **/
    draggable?: boolean;

    /** Controls the “friction” that slows down the viewer motion after it is 
     * dragged and released. Higher values mean the motion stops faster. 
     * Should be set [0.0, 1.0]; defaults to 0.15.
     **/
    friction?: number;

    /** If set to true, keyboard controls are disabled. Defaults to false. */
    disableKeyboardCtrl?: boolean;

    /** If set to false, the fullscreen control will not be displayed. Defaults 
     *  to true. The fullscreen button will only be displayed if the browser
     *  supports the fullscreen API. 
     **/
    showFullscreenCtrl?: boolean;

    /** If set to false, no controls are displayed. Defaults to true. */
    showControls?: boolean;

    /** Adjusts panning speed from touch inputs. Defaults to 1. */
    touchPanSpeedCoeffFactor?: number;

    /** Sets the panorama’s starting yaw position in degrees. Defaults to 0. */
    yaw?: number;

    /** Sets the panorama’s starting pitch position in degrees. Defaults to 0. */
    pitch?: number;

    /** Sets the panorama’s starting horizontal field of view in degrees. 
     *  Defaults to 100. 
     **/
    hfov?: number;

    /** Sets the minimum yaw the viewer edge can be at, in degrees. Defaults to 
     *  -180, i.e. no limit.
     **/
    minYaw?: number;
    /** Sets the maximum yaw the viewer edge can be at, in degrees. Defaults to
     *  180, i.e. no limit. 
     **/
    maxYaw?: number;

    /** Sets the minimum pitch the viewer edge can be at, in degrees. Defaults to
     *  undefined, so the viewer center can reach -90.
     **/
    minPitch?: number;

    /** Sets the maximum pitch the viewer edge can be at, in degrees. Defaults to
     *  undefined, so the viewer center can reach 90.
     **/
    maxPitch?: number;

    /** Sets the minimum horizontal field of view, in degrees, that the viewer 
     *  can be set to. Defaults to 50. Unless the multiResMinHfov 
     *  parameter is set to true, the minHfov parameter is ignored for
     *  multires panoramas. 
     *
    */
    minHfov?: number;

    /** Sets the maximum horizontal field of view, in degrees, that the viewer 
     *  can be set to. Defaults to 120. Unless the multiResMinHfov parameter is
     *  set to true, the minHfov parameter is ignored for multires panoramas.
     **/
    maxHfov?: number;

    /** When set to false, the minHfov parameter is ignored for multires 
     *  panoramas; an automatically calculated minimum horizontal field of view 
     *  is used instead. Defaults to false.
     **/
    multiResMinHfov?: boolean;

    /** If true, a compass is displayed. Normally defaults to false; defaults to
     *  true if heading information is present in Photo Sphere XMP metadata.
     **/
    compass?: boolean;

    /** Set the offset, in degrees, of the center of the panorama from North. As
     *  this affects the compass, it only has an effect if compass is set to 
     *  true.
     **/
    northOffset?: number;

    /** Specifies a URL for a preview image to display before the panorama is 
     * loaded. 
     **/
    preview?: string;

    /** Specifies the title to be displayed while the load button is displayed.
     */
    previewTitle?: string;

    /** Specifies the author to be displayed while the load button is displayed. 
     */
    previewAuthor?: string;

    /** Specifies pitch of image horizon, in degrees (for correcting non-leveled
     *  panoramas).
    */
    horizonPitch?: number;

    /** Specifies roll of image horizon, in degrees (for correcting non-leveled
     *  panoramas). 
     **/
    horizonRoll?: number;

    /** This specifies a timing function to be used for animating movements such
     *  as when the lookAt method is called. The default timing function is 
     *  easeInOutQuad. If a custom function is specified, it should take a 
     *  number [0, 1] as its only argument and return a number [0, 1]. 
     **/
    animationTimingFunction?: {(...args:any):any};

    /** When true, HTML is escaped from configuration strings to help mitigate
     *  possible DOM XSS attacks. This is always true when using the standalone
     *  viewer since the configuration is provided via the URL; it defaults to
     *  false but can be set to true when using the API.
     **/
    escapeHTML?: boolean;

    /** This specifies the type of CORS request used and can be set to either 
     *  anonymous or use-credentials. Defaults to anonymous. 
     **/
    crossOrigin?: string;

    /** This specifies a dictionary of hot spots that can be links to other 
     *  scenes, information, or external links.
     **/
    hotSpots?: HotspotOptions;

    /** When true, the mouse pointer’s pitch and yaw are logged to the console
     *  when the mouse button is clicked. Defaults to false.
     **/
    hotSpotDebug?: boolean;

    /** Specifies the fade duration, in milliseconds, when transitioning between
     *  scenes. Not defined by default. Only applicable for tours. Only works
     *  with WebGL renderer. 
     **/
    sceneFadeDuration?: number;

    /** Specifies the key numbers that are captured in key events. Defaults to
     *  the standard keys that are used by the viewer. 
     **/
    captureKeyNumbers?: any[];

    /** Specifies an array containing RGB values [0, 1] that sets the background
     *  color for areas where no image data is available. Defaults to [0, 0, 0]
     *  (black). For partial equirectangular panoramas this applies to areas 
     *  past the edges of the defined rectangle. For multires and cubemap 
     *  (including fallback) panoramas this applies to areas corresponding to 
     *  missing tiles or faces. 
     **/
    backgroundColor?: [number, number, number];

    /** If set to true, prevent displaying out-of-range areas of a partial 
     * panorama by constraining the yaw and the field-of-view. Even at the 
     * corners and edges of the canvas only areas actually belonging to the 
     * image (i.e., within [minYaw, maxYaw] and [minPitch, maxPitch]) are shown,
     * thus setting the backgroundColor option is not needed if this option is 
     * set. Defaults to false. 
     **/
    avoidShowingBackground?: boolean;
}

interface HotspotOptions extends GeneralOptions { 
        /** Specifies the pitch portion of the hot spot’s location, in degrees. */
        pitch?: number;

        /** Specifies the yaw portion of the hot spot’s location, in degrees. */
        yaw?: number;

        /** Specifies the type of the hot spot. Can be scene for scene links or
         *  info for information hot spots. A tour configuration file is 
         *  required for scene hot spots. 
         **/
        type?: string;

        /** This specifies the text that is displayed when the user hovers over
         *  the hot spot. 
         **/
        text?: string;

        /** If specified for an info hot spot, the hot spot links to the 
         *  specified URL. Not applicable for scene hot spots. 
         **/
        URL?: string;

        /** Specifies URL’s link attributes. If not set, the target attribute 
         *  is set to _blank, to open link in new tab to avoid opening in viewer
         *  frame / page. 
         **/
        attributes?: {[key:string]: any};

        /** Specifies the ID of the scene to link to for scene hot spots. 
         * Not applicable for info hot spots. 
         **/
        sceneId?: string;

        /** Specifies the pitch of the target scene, in degrees. Can also be set
         *  to same, which uses the current pitch of the current scene as the 
         * initial pitch of the target scene.
         **/
        targetPitch?: number;

        /** Specifies the yaw of the target scene, in degrees. Can also be set 
         *  to same or sameAzimuth. These settings use the current yaw of the 
         *  current scene as the initial yaw of the target scene; same uses the
         *  current yaw directly, while sameAzimuth takes into account the 
         *  northOffset values of both scenes to maintain the same direction 
         *  with regard to north. 
         **/
        targetYaw?: number;

        /** Specifies the HFOV of the target scene, in degrees. Can also be set
         *  to same, which uses the current HFOV of the current scene as the 
         *  initial HFOV of the target scene. */
        targetHfov?: number;

        /** Specifies hot spot ID, for use with API’s removeHotSpot function. */
        id?: string;

        /** If specified, string is used as the CSS class for the hot spot 
         * instead of the default CSS classes. 
         **/
        cssClass?: string;

        /**
         * If createTooltipFunc is specified, this function is used to create 
         * the hot spot tooltip DOM instead of the default function. The contents
         * of createTooltipArgs are passed to the function as arguments.
        */
        createTooltipFunc?: {(...args:any[]):any};

        /**
         * If createTooltipFunc is specified, this function is used to create 
         * the hot spot tooltip DOM instead of the default function. The contents
         * of createTooltipArgs are passed to the function as arguments.
        */
        createTooltipArgs?: {[key:string]: any};

        /** If clickHandlerFunc is specified, this function is added as an event
         *  handler for the hot spot’s click event. The event object and the
         *  contents of clickHandlerArgs are passed to the function as arguments. 
         **/
        clickHandlerFunc?: {(...args:any[]):any};

        /** If clickHandlerFunc is specified, this function is added as an event
         *  handler for the hot spot’s click event. The event object and the
         *  contents of clickHandlerArgs are passed to the function as arguments. 
         **/
        clickHandlerArgs?: {[key:string]: any};

        /** When true, the hot spot is scaled to match changes in the field of
         *  view, relative to the initial field of view. Note that this does not
         *  account for changes in local image scale that occur due to 
         *  distortions within the viewport. Defaults to false. 
         **/
        scale?: boolean;
}

interface EquirectangularConfigureOptions extends GeneralOptions {
    /** Sets the URL to the equirectangular panorama image. This is relative to
     *  basePath if it is set, else it is relative to the location of 
     *  pannellum.htm. An absolute URL can also be used. 
     **/
    panorama: string;

    /** Sets the panorama’s horizontal angle of view, in degrees. Defaults to
     *  360. This is used if the equirectangular image does not cover a full 360
     *  degrees in the horizontal. 
     **/
    haov?: number;

    /** Sets the panorama’s vertical angle of view, in degrees. Defaults to 180.
     *  This is used if the equirectangular image does not cover a full 180 
     *  degrees in the vertical. 
     **/
    vaov?: number;

    /** Sets the vertical offset of the center of the equirectangular image from
     *  the horizon, in degrees. Defaults to 0. This is used if vaov is less 
     *  than 180 and the equirectangular image is not cropped symmetrically. 
     **/
    vOffset?: number;

    /** If set to true, any embedded Photo Sphere XMP data will be ignored;
     *  else, said data will override any existing settings. Defaults to false.
     **/
    ignoreGPanoXMP?: boolean;
}

interface MultiresConfigureOptions extends GeneralOptions { 
    /** This is the base path of the URLs for the multiresolution tiles. It is
     *  relative to the regular basePath option if it is defined, else it is
     *  relative to the location of pannellum.htm. An absolute URL can also be
     *  used. 
     **/
    basePath?: string;

    /** This is a format string for the location of the multiresolution tiles,
     *  relative to multiRes.basePath, which is relative to basePath. Format
     *  parameters are %l for the zoom level, %s for the cube face, %x for the x
     *  index, and %y for the y index. For each tile, .extension is appended.
     **/
    path: string;

    /** This is a format string for the location of the fallback tiles for the
     *  CSS 3D transform-based renderer if the WebGL renderer is not supported,
     *  relative to multiRes.basePath, which is relative to basePath. The only
     *  format parameter is %s, for the cube face. For each face, .extension is
     *  appended. 
     **/
    fallbackPath?: string;

    /** Specifies the tiles’ file extension. Do not include the .. */
    extension?: string;

    /** This specifies the size in pixels of each image tile. */
    tileResoultion?: number;

    /** This specifies the maximum zoom level. */
    maxLevel?: number;

    /** This specifies the size in pixels of the full resolution cube faces the
     *  image tiles were created from. 
     **/
    cubeResolution?: number;
}

interface TourOptions extends GeneralOptions{
    default: TourDefaultOptions;

    /** The scenes property contains a dictionary of scenes, specified by scene
     * IDs.  
     **/
    scenes: GeneralOptions[];
}

interface TourDefaultOptions extends GeneralOptions {
    firstScene: string;
}