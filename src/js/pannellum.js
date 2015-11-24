/*
 * Pannellum - An HTML5 based Panorama Viewer
 * Copyright (c) 2011-2015 Matthew Petroff
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

window.pannellum = (function(window, document, undefined) {

'use strict';

/**
 * Creates a new panorama viewer.
 * @constructor
 * @param {HTMLElement|string} container - The container (div) element for the
 *      viewer, or its ID.
 * @param {Object} initialConfig - Inital configuration for viewer.
 */
function Viewer(container, initialConfig) {

// Declare variables
var config,
    renderer,
    oldRenderer,
    preview,
    isUserInteracting = false,
    latestInteraction = Date.now(),
    onPointerDownPointerX = 0,
    onPointerDownPointerY = 0,
    onPointerDownPointerDist = -1,
    onPointerDownYaw = 0,
    onPointerDownPitch = 0,
    keysDown = new Array(10),
    fullscreenActive = false,
    loaded = false,
    error = false,
    isTimedOut = false,
    listenersAdded = false,
    panoImage,
    prevTime,
    yawSpeed = 0,
    pitchSpeed = 0,
    zoomSpeed = 0,
    animating = false,
    update = false, // Should we update when still to render dynamic content
    hotspotsCreated = false;

var defaultConfig = {
    hfov: 100,
    minHfov: 50,
    maxHfov: 120,
    pitch: 0,
    minPitch: -85,
    maxPitch: 85,
    yaw: 0,
    minYaw: -360,
    maxYaw: 360,
    haov: 360,
    vaov: 180,
    vOffset: 0,
    autoRotate: false,
    autoRotateInactivityDelay: -1,
    type: 'equirectangular',
    northOffset: 0,
    showFullscreenCtrl: true,
    dynamic: false,
    keyboardZoom: true
};

// Initialize container
container = typeof container === 'string' ? document.getElementById(container) : container;
container.className += ' pnlm-container';
container.tabIndex = 0;

// Create container for renderer
var renderContainer = document.createElement('div');
renderContainer.className = 'pnlm-render-container';
container.appendChild(renderContainer);
var dragFix = document.createElement('div');
dragFix.className = 'pnlm-dragfix';
container.appendChild(dragFix);

// Display about information on right click
var aboutMsg = document.createElement('span');
aboutMsg.className = 'pnlm-about-msg';
aboutMsg.innerHTML = '<a href="https://pannellum.org/" target="_blank">Pannellum</a>';
container.appendChild(aboutMsg);
dragFix.addEventListener('contextmenu', aboutMessage);

// Create info display
var infoDisplay = {};

// Panorama info
infoDisplay.container = document.createElement('div');
infoDisplay.container.className = 'pnlm-panorama-info';
infoDisplay.title = document.createElement('div');
infoDisplay.title.className = 'pnlm-title-box';
infoDisplay.container.appendChild(infoDisplay.title);
infoDisplay.author = document.createElement('div');
infoDisplay.author.className = 'pnlm-author-box';
infoDisplay.container.appendChild(infoDisplay.author);
container.appendChild(infoDisplay.container);

// Load box
infoDisplay.load = {};
infoDisplay.load.box = document.createElement('div');
infoDisplay.load.box.className = 'pnlm-load-box';
infoDisplay.load.box.innerHTML = '<p>Loading...</p>';
infoDisplay.load.lbox = document.createElement('div');
infoDisplay.load.lbox.className = 'pnlm-lbox';
infoDisplay.load.lbox.innerHTML = '<div class="pnlm-loading"></div>';
infoDisplay.load.box.appendChild(infoDisplay.load.lbox);
infoDisplay.load.lbar = document.createElement('div');
infoDisplay.load.lbar.className = 'pnlm-lbar';
infoDisplay.load.lbarFill = document.createElement('div');
infoDisplay.load.lbarFill.className = 'pnlm-lbar-fill';
infoDisplay.load.lbar.appendChild(infoDisplay.load.lbarFill);
infoDisplay.load.box.appendChild(infoDisplay.load.lbar);
infoDisplay.load.msg = document.createElement('p');
infoDisplay.load.msg.className = 'pnlm-lmsg';
infoDisplay.load.box.appendChild(infoDisplay.load.msg);
container.appendChild(infoDisplay.load.box);

// Error message
infoDisplay.errorMsg = document.createElement('div');
infoDisplay.errorMsg.className = 'pnlm-error-msg pnlm-info-box';
container.appendChild(infoDisplay.errorMsg);

// Create controls
var controls = {};

// Load button
controls.load = document.createElement('div');
controls.load.className = 'pnlm-load-button';
controls.load.innerHTML = '<p>Click to<br>Load<br>Panorama<p>';
controls.load.addEventListener('click', load);
container.appendChild(controls.load);

// Zoom controls
controls.zoom = document.createElement('div');
controls.zoom.className = 'pnlm-zoom-controls pnlm-controls';
controls.zoomIn = document.createElement('div');
controls.zoomIn.className = 'pnlm-zoom-in pnlm-sprite pnlm-control';
controls.zoomIn.addEventListener('click', zoomIn);
controls.zoom.appendChild(controls.zoomIn);
controls.zoomOut = document.createElement('div');
controls.zoomOut.className = 'pnlm-zoom-out pnlm-sprite pnlm-control';
controls.zoomOut.addEventListener('click', zoomOut);
controls.zoom.appendChild(controls.zoomOut);
container.appendChild(controls.zoom);

// Fullscreen toggle
controls.fullscreen = document.createElement('div');
controls.fullscreen.addEventListener('click', toggleFullscreen);
controls.fullscreen.className = 'pnlm-fullscreen-toggle-button pnlm-sprite pnlm-fullscreen-toggle-button-inactive pnlm-controls pnlm-control';
if (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled)
    container.appendChild(controls.fullscreen);

// Compass
var compass = document.createElement('div');
compass.className = 'pnlm-compass pnlm-controls pnlm-control';
container.appendChild(compass);

// Load and process configuration
if (initialConfig.default && initialConfig.default.firstScene) {
    // Activate first scene if specified
    mergeConfig(initialConfig.default.firstScene);
} else {
    mergeConfig(null);
}
processOptions();

/**
 * Initializes viewer.
 * @private
 */
function init() {
    // Display an error for IE 9 as it doesn't work but also doesn't otherwise
    // show an error (older versions don't work at all)
    // Based on: http://stackoverflow.com/a/10965203
    var div = document.createElement("div");
    div.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->";
    if (div.getElementsByTagName("i").length == 1) {
        anError();
        return;
    }
    
    var i, p;
    
    if (config.type == 'cubemap') {
        panoImage = [];
        for (i = 0; i < 6; i++) {
            panoImage.push(new Image());
            panoImage[i].crossOrigin = 'anonymous';
        }
        infoDisplay.load.lbox.style.display = 'block';
        infoDisplay.load.lbar.style.display = 'none';
    } else if (config.type == 'multires') {
        var c = JSON.parse(JSON.stringify(config.multiRes));    // Deep copy
        if (config.basePath && config.multiRes.basePath) {      // avoid 'undefined' in path, check (optional) multiRes.basePath, too
            c.basePath = config.basePath + config.multiRes.basePath;
        } else if (config.basePath) {
            c.basePath = config.basePath;
        }
        panoImage = c;
    } else {
        if (config.dynamic === true) {
            panoImage = config.panorama;
        } else {
            if (config.panorama === undefined) {
                anError('No panorama image was specified.');
                return;
            }
            panoImage = new Image();
        }
    }
    
    // From http://stackoverflow.com/a/19709846
    var absoluteURL = function(url) {
        return new RegExp('^(?:[a-z]+:)?//', 'i').test(url);
    };
    
    // Configure image loading
    if (config.type == 'cubemap') {
        // Quick loading counter for synchronous loading
        var itemsToLoad = 6;
        
        var onLoad = function() {
            itemsToLoad--;
            if (itemsToLoad === 0) {
                onImageLoad();
            }
        };
        
        var onError = function(e) {
            var a = document.createElement('a');
            a.href = e.target.src;
            a.innerHTML = a.href;
            anError('The file ' + a.outerHTML + ' could not be accessed.');
        };
        
        for (i = 0; i < panoImage.length; i++) {
            panoImage[i].onload = onLoad;
            panoImage[i].onerror = onError;
            p = config.cubeMap[i];
            if (config.basePath && !absoluteURL(p)) {
                p = config.basePath + p;
            }
            panoImage[i].src = encodeURI(p);
        }
    } else if (config.type == 'multires') {
        onImageLoad();
    } else {
        p = '';
        if (config.basePath) {
            p = config.basePath;
        }
        
        if (config.dynamic !== true) {
            // Still image
            p = absoluteURL(config.panorama) ? config.panorama : p + config.panorama;
            
            panoImage.onload = function() {
                window.URL.revokeObjectURL(this.src);  // Clean up
                onImageLoad();
            };
            
            var xhr = new XMLHttpRequest();
            xhr.onloadend = function() {
                if (xhr.status != 200) {
                    // Display error if image can't be loaded
                    var a = document.createElement('a');
                    a.href = encodeURI(p);
                    a.innerHTML = a.href;
                    anError('The file ' + a.outerHTML + ' could not be accessed.');
                }
                var img = this.response;
                parseGPanoXMP(img);
                infoDisplay.load.msg.innerHTML = '';
            };
            xhr.onprogress = function(e) {
                if (e.lengthComputable) {
                    // Display progress
                    var percent = e.loaded / e.total * 100;
                    infoDisplay.load.lbarFill.style.width = percent + '%';
                    var unit, numerator, denominator;
                    if (e.total > 1e6) {
                        unit = 'MB';
                        numerator = (e.loaded / 1e6).toFixed(2);
                        denominator = (e.total / 1e6).toFixed(2);
                    } else if (e.total > 1e3) {
                        unit = 'kB';
                        numerator = (e.loaded / 1e3).toFixed(1);
                        denominator = (e.total / 1e3).toFixed(1);
                    } else {
                        unit = 'B';
                        numerator = e.loaded;
                        denominator = e.total;
                    }
                    infoDisplay.load.msg.innerHTML = numerator + ' / ' + denominator + ' ' + unit;
                } else {
                    // Display loading spinner
                    infoDisplay.load.lbox.style.display = 'block';
                    infoDisplay.load.lbar.style.display = 'none';
                }
            };
            xhr.open('GET', p, true);
            xhr.responseType = 'blob';
            xhr.send();
        }
    }
    
    container.classList.add('pnlm-grab');
    container.classList.remove('pnlm-grabbing');
}

/**
 * Create renderer and initialize event listeners once image is loaded.
 * @private
 */
function onImageLoad() {
    renderer = new libpannellum.renderer(renderContainer, panoImage, config.type, config.dynamic);
    if (config.dynamic !== true) {
        // Allow image to be garbage collected
        panoImage = undefined;
    }

    // Only add event listeners once
    if (!listenersAdded) {
        listenersAdded = true;
        container.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        container.addEventListener('mousewheel', onDocumentMouseWheel, false);
        container.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
        container.addEventListener('mozfullscreenchange', onFullScreenChange, false);
        container.addEventListener('webkitfullscreenchange', onFullScreenChange, false);
        container.addEventListener('msfullscreenchange', onFullScreenChange, false);
        container.addEventListener('fullscreenchange', onFullScreenChange, false);
        window.addEventListener('resize', onDocumentResize, false);
        container.addEventListener('keydown', onDocumentKeyPress, false);
        container.addEventListener('keyup', onDocumentKeyUp, false);
        container.addEventListener('blur', clearKeys, false);
        document.addEventListener('mouseleave', onDocumentMouseUp, false);
        container.addEventListener('touchstart', onDocumentTouchStart, false);
        container.addEventListener('touchmove', onDocumentTouchMove, false);
        container.addEventListener('touchend', onDocumentTouchEnd, false);
    }

    renderInit();
    setTimeout(function(){isTimedOut = true;}, 500);
}

/**
 * Parses Google Photo Sphere XMP Metadata.
 * https://developers.google.com/photo-sphere/metadata/
 * @private
 * @param {Image} image - Image to read XMP metadata from.
 */
function parseGPanoXMP(image) {
    var reader = new FileReader();
    reader.addEventListener('loadend', function() {
        var img = reader.result;
        
        var start = img.indexOf('<x:xmpmeta');
        if (start > -1 && config.ignoreGPanoXMP !== true) {
            var xmpData = img.substring(start, img.indexOf('</x:xmpmeta>') + 12);
            
            // Extract the requested tag from the XMP data
            var getTag = function(tag) {
                var result;
                if (xmpData.indexOf(tag + '="') >= 0) {
                    result = xmpData.substring(xmpData.indexOf(tag + '="') + tag.length + 2);
                    result = result.substring(0, result.indexOf('"'));
                } else if (xmpData.indexOf(tag + '>') >= 0) {
                    result = xmpData.substring(xmpData.indexOf(tag + '>') + tag.length + 1);
                    result = result.substring(0, result.indexOf('<'));
                }
                if (result !== undefined) {
                    return Number(result);
                }
                return null;
            };
            
            // Relevant XMP data
            var xmp = {
                fullWidth: getTag('GPano:FullPanoWidthPixels'),
                croppedWidth: getTag('GPano:CroppedAreaImageWidthPixels'),
                fullHeight: getTag('GPano:FullPanoHeightPixels'),
                croppedHeight: getTag('GPano:CroppedAreaImageHeightPixels'),
                topPixels: getTag('GPano:CroppedAreaTopPixels'),
                heading: getTag('GPano:PoseHeadingDegrees'),
                horizonPitch: getTag('GPano:PosePitchDegrees'),
                horizonRoll: getTag('GPano:PoseRollDegrees')
            };
            
            if (xmp.fullWidth !== null && xmp.croppedWidth !== null &&
                xmp.fullHeight !== null && xmp.croppedHeight !== null &&
                xmp.topPixels !== null) {
                
                // Set up viewer using GPano XMP data
                config.haov = xmp.croppedWidth / xmp.fullWidth * 360;
                config.vaov = xmp.croppedHeight / xmp.fullHeight * 180;
                config.vOffset = ((xmp.topPixels + xmp.croppedHeight / 2) / xmp.fullHeight - 0.5) * -180;
                if (xmp.heading !== null) {
                    // TODO: make sure this works correctly for partial panoramas
                    config.northOffset = xmp.heading;
                    if (config.compass !== false) {
                        config.compass = true;
                    }
                }
                if (xmp.horizonPitch !== null && xmp.horizonRoll !== null) {
                    panoImage.horizonPitch = xmp.horizonPitch / 180 * Math.PI;
                    panoImage.horizonRoll = xmp.horizonRoll / 180 * Math.PI;
                }
                
                // TODO: add support for initial view settings
            }
        }
        
        // Load panorama
        panoImage.src = window.URL.createObjectURL(image);
    });
    reader.readAsText(image);
}

/**
 * Displays an error message.
 * @private
 * @param {string} error - Error message to display. If not specified, a
 *      generic WebGL error is displayed.
 */
function anError(error) {
    if (error !== undefined) {
        infoDisplay.errorMsg.innerHTML = '<p>' + error + '</p>';
    } else {
        infoDisplay.errorMsg.innerHTML = '<p>Your browser does not have the necessary WebGL support to display this panorama.</p>';
    }
    controls.load.style.display = 'none';
    infoDisplay.load.box.style.display = 'none';
    infoDisplay.errorMsg.style.display = 'table';
    error = true;
    renderContainer.style.display = 'none';
}

/**
 * Hides error message display.
 * @private
 */
function clearError() {
    infoDisplay.load.box.style.display = 'none';
    infoDisplay.errorMsg.style.display = 'none';
    error = false;
}

/**
 * Displays about message.
 * @private
 * @param {MouseEvent} event - Right click location
 */
function aboutMessage(event) {
    var pos = mousePosition(event);
    aboutMsg.style.left = pos.x + 'px';
    aboutMsg.style.top = pos.y + 'px';
    clearTimeout(aboutMessage.t1);
    clearTimeout(aboutMessage.t2);
    aboutMsg.style.display = 'block';
    aboutMsg.style.opacity = 1;
    aboutMessage.t1 = setTimeout(function() {aboutMsg.style.opacity = 0;}, 2000);
    aboutMessage.t2 = setTimeout(function() {aboutMsg.style.display = 'none';}, 2500);
    event.preventDefault();
}

/**
 * Calculate mouse position relative to top left of viewer container.
 * @private
 * @param {MouseEvent} event - Mouse event to use in calculation
 * @returns {Object} Calculated X and Y coordinates
 */
function mousePosition(event) {
    var bounds = container.getBoundingClientRect();
    var pos = {};
    pos.x = event.clientX - bounds.left;
    pos.y = event.clientY - bounds.top;
    return pos;
}

/**
 * Event handler for mouse clicks. Initializes panning. Prints center and click
 * location coordinates when hot spot debugging is enabled.
 * @private
 * @param {MouseEvent} event - Document mouse down event.
 */
function onDocumentMouseDown(event) {
    // Override default action
    event.preventDefault();
    // But not all of it
    container.focus();
    
    // Only do something if the panorama is loaded
    if (!loaded) {
        return;
    }
    
    // Calculate mouse position relative to top left of viewer container
    var pos = mousePosition(event);

    // Log pitch / yaw of mouse click when debugging / placing hot spots
    if (config.hotSpotDebug) {
        var canvas = renderer.getCanvas();
        var x = pos.x / canvas.width * 2 - 1;
        var y = (1 - pos.y / canvas.height * 2) * canvas.height / canvas.width;
        var focal = 1 / Math.tan(config.hfov * Math.PI / 360);
        var s = Math.sin(config.pitch * Math.PI / 180);
        var c = Math.cos(config.pitch * Math.PI / 180);
        var a = focal * c - y * s;
        var root = Math.sqrt(x*x + a*a);
        var pitch = Math.atan((y * c + focal * s) / root) * 180 / Math.PI;
        var yaw = Math.atan2(x / root, a / root) * 180 / Math.PI + config.yaw;
        console.log('Pitch: ' + pitch + ', Yaw: ' + yaw + ', Center Pitch: ' +
            config.pitch + ', Center Yaw: ' + config.yaw + ', HFOV: ' + config.hfov);
    }
    
    // Turn off auto-rotation if enabled
    config.autoRotate = false;
    
    isUserInteracting = true;
    latestInteraction = Date.now();
    
    onPointerDownPointerX = pos.x;
    onPointerDownPointerY = pos.y;
    
    onPointerDownYaw = config.yaw;
    onPointerDownPitch = config.pitch;
    
    container.classList.add('pnlm-grabbing');
    container.classList.remove('pnlm-grab');
    
    animateInit();
}

/**
 * Event handler for mouse moves. Pans center of view.
 * @private
 * @param {MouseEvent} event - Document mouse move event.
 */
function onDocumentMouseMove(event) {
    if (isUserInteracting && loaded) {
        latestInteraction = Date.now();
        var canvas = renderer.getCanvas();
        var pos = mousePosition(event);
        //TODO: This still isn't quite right
        var yaw = ((Math.atan(onPointerDownPointerX / canvas.width * 2 - 1) - Math.atan(pos.x / canvas.width * 2 - 1)) * 180 / Math.PI * config.hfov / 90) + onPointerDownYaw;
        yawSpeed = (yaw - config.yaw) % 360 * 0.2;
        config.yaw = yaw;
        
        var vfov = 2 * Math.atan(Math.tan(config.hfov/360*Math.PI) * canvas.height / canvas.width) * 180 / Math.PI;
        
        var pitch = ((Math.atan(pos.y / canvas.height * 2 - 1) - Math.atan(onPointerDownPointerY / canvas.height * 2 - 1)) * 180 / Math.PI * vfov / 90) + onPointerDownPitch;
        pitchSpeed = (pitch - config.pitch) * 0.2;
        config.pitch = pitch;
    }
}

/**
 * Event handler for mouse up events. Stops panning.
 * @private
 */
function onDocumentMouseUp() {
    if (!isUserInteracting) {
        return;
    }
    isUserInteracting = false;
    if (Date.now() - latestInteraction > 15) {
        // Prevents jump when user rapidly moves mouse, stops, and then
        // releases the mouse button
        pitchSpeed = yawSpeed = 0;
    }
    container.classList.add('pnlm-grab');
    container.classList.remove('pnlm-grabbing');
}

/**
 * Event handler for touches. Initializes panning if one touch or zooming if
 * two touches.
 * @private
 * @param {TouchEvent} event - Document touch start event.
 */
function onDocumentTouchStart(event) {
    // Only do something if the panorama is loaded
    if (!loaded) {
        return;
    }

    // Calculate touch position relative to top left of viewer container
    var pos0 = mousePosition(event.targetTouches[0]);

    onPointerDownPointerX = pos0.x;
    onPointerDownPointerY = pos0.y;
    
    if (event.targetTouches.length == 2) {
        // Down pointer is the center of the two fingers
        var pos1 = mousePosition(event.targetTouches[1]);
        onPointerDownPointerX += (pos1.x - pos0.x) * 0.5;
        onPointerDownPointerY += (pos1.y - pos0.y) * 0.5;
        onPointerDownPointerDist = Math.sqrt((pos0.x - pos1.x) * (pos0.x - pos1.x) +
                                             (pos0.y - pos1.y) * (pos0.y - pos1.y));
    }
    isUserInteracting = true;
    latestInteraction = Date.now();
    
    onPointerDownYaw = config.yaw;
    onPointerDownPitch = config.pitch;

    animateInit();
}

/**
 * Event handler for touch movements. Pans center of view if one touch or
 * adjusts zoom if two touches.
 * @private
 * @param {TouchEvent} event - Document touch move event.
 */
function onDocumentTouchMove(event) {
    // Override default action
    event.preventDefault();
    if (loaded) {
        latestInteraction = Date.now();
    }
    if (isUserInteracting && loaded) {
        var pos0 = mousePosition(event.targetTouches[0]);
        var clientX = pos0.x;
        var clientY = pos0.y;
        
        if (event.targetTouches.length == 2 && onPointerDownPointerDist != -1) {
            var pos1 = mousePosition(event.targetTouches[1]);
            clientX += (pos1.x - pos0.x) * 0.5;
            clientY += (pos1.y - pos0.y) * 0.5;
            var clientDist = Math.sqrt((pos0.x - pos1.x) * (pos0.x - pos1.x) +
                                       (pos0.y - pos1.y) * (pos0.y - pos1.y));
            setHfov(config.hfov += (onPointerDownPointerDist - clientDist) * 0.1);
            onPointerDownPointerDist = clientDist;
        }
        
        var yaw = (onPointerDownPointerX - clientX) * 0.1 + onPointerDownYaw;
        yawSpeed = (yaw - config.yaw) % 360 * 0.2;
        config.yaw = yaw;
        
        var pitch = (clientY - onPointerDownPointerY) * 0.1 + onPointerDownPitch;
        pitchSpeed = (pitch - config.pitch) * 0.2;
        config.pitch = pitch;
    }
}

/**
 * Event handler for end of touches. Stops panning and/or zooming.
 * @private
 */
function onDocumentTouchEnd() {
    isUserInteracting = false;
    if (Date.now() - latestInteraction > 150) {
        pitchSpeed = yawSpeed = 0;
    }
    onPointerDownPointerDist = -1;
}

/**
 * Event handler for mouse wheel. Changes zoom.
 * @private
 * @param {WheelEvent} event - Document mouse wheel event.
 */
function onDocumentMouseWheel(event) {
    event.preventDefault();
    
    // Only do something if the panorama is loaded
    if (!loaded) {
        return;
    }

    latestInteraction = Date.now();
    if (event.wheelDeltaY) {
        // WebKit
        setHfov(config.hfov -= event.wheelDeltaY * 0.05);
        zoomSpeed = event.wheelDelta < 0 ? 1 : -1;
    } else if (event.wheelDelta) {
        // Opera / Explorer 9
        setHfov(config.hfov -= event.wheelDelta * 0.05);
        zoomSpeed = event.wheelDelta < 0 ? 1 : -1;
    } else if (event.detail) {
        // Firefox
        setHfov(config.hfov += event.detail * 1.5);
        zoomSpeed = event.detail > 0 ? 1 : -1;
    }
    
    animateInit();
}

/**
 * Event handler for key presses. Updates list of currently pressed keys.
 * @private
 * @param {KeyboardEvent} event - Document key press event.
 */
function onDocumentKeyPress(event) {
    // Override default action
    event.preventDefault();
    
    // Turn off auto-rotation if enabled
    config.autoRotate = false;
    
    // Record key pressed
    var keynumber = event.keycode;
    if (event.which) {
        keynumber = event.which;
    }
    
    // If escape key is pressed
    if (keynumber == 27) {
        // If in fullscreen mode
        if (fullscreenActive) {
            toggleFullscreen();
        }
    } else {
        // Change key
        changeKey(keynumber, true);
    }
}

/**
 * Clears list of currently pressed keys.
 * @private
 */
function clearKeys() {
    for (var i = 0; i < 10; i++) {
        keysDown[i] = false;
    }
}

/**
 * Event handler for key releases. Updates list of currently pressed keys.
 * @private
 * @param {KeyboardEvent} event - Document key up event.
 */
function onDocumentKeyUp(event) {
    // Override default action
    event.preventDefault();
    
    // Record key released
    var keynumber = event.keycode;
    if (event.which) {
        keynumber = event.which;
    }
    
    // Change key
    changeKey(keynumber, false);
}

/**
 * Updates list of currently pressed keys.
 * @private
 * @param {number} keynumber - Key number.
 * @param {boolean} value - Whether or not key is pressed.
 */
function changeKey(keynumber, value) {
    var keyChanged = false;
    switch(keynumber) {
        // If minus key is released
        case 109: case 189: case 17:
            if (keysDown[0] != value) { keyChanged = true; }
            keysDown[0] = value; break;
        
        // If plus key is released
        case 107: case 187: case 16:
            if (keysDown[1] != value) { keyChanged = true; }
            keysDown[1] = value; break;
        
        // If up arrow is released
        case 38:
            if (keysDown[2] != value) { keyChanged = true; }
            keysDown[2] = value; break;
        
        // If "w" is released
        case 87:
            if (keysDown[6] != value) { keyChanged = true; }
            keysDown[6] = value; break;
        
        // If down arrow is released
        case 40:
            if (keysDown[3] != value) { keyChanged = true; }
            keysDown[3] = value; break;
        
        // If "s" is released
        case 83:
            if (keysDown[7] != value) { keyChanged = true; }
            keysDown[7] = value; break;
        
        // If left arrow is released
        case 37:
            if (keysDown[4] != value) { keyChanged = true; }
            keysDown[4] = value; break;
        
        // If "a" is released
        case 65:
            if (keysDown[8] != value) { keyChanged = true; }
            keysDown[8] = value; break;
        
        // If right arrow is released
        case 39:
            if (keysDown[5] != value) { keyChanged = true; }
            keysDown[5] = value; break;
        
        // If "d" is released
        case 68:
            if (keysDown[9] != value) { keyChanged = true; }
            keysDown[9] = value;
    }
    
    if (keyChanged && value) {
        if (typeof performance !== 'undefined' && performance.now()) {
            prevTime = performance.now();
        } else {
            prevTime = Date.now();
        }
        animateInit();
    }
}

/**
 * Pans and/or zooms panorama based on currently pressed keys. Also handles
 * panorama "inertia" and auto rotation.
 * @private
 */
function keyRepeat() {
    // Only do something if the panorama is loaded
    if (!loaded) {
        return;
    }
    
    var prevPitch = config.pitch;
    var prevYaw = config.yaw;
    var prevZoom = config.hfov;
    
    var newTime;
    if (typeof performance !== 'undefined' && performance.now()) {
        newTime = performance.now();
    } else {
        newTime = Date.now();
    }
    if (prevTime === undefined) {
        prevTime = newTime;
    }
    var diff = (newTime - prevTime) * config.hfov / 1700;
    diff = Math.min(diff, 1.0);
    
    // If minus key is down
    if (keysDown[0] && config.keyboardZoom === true) {
        setHfov(config.hfov + (zoomSpeed * 0.8 + 0.5) * diff);
    }
    
    // If plus key is down
    if (keysDown[1] && config.keyboardZoom === true) {
        setHfov(config.hfov + (zoomSpeed * 0.8 - 0.2) * diff);
    }
    
    // If up arrow or "w" is down
    if (keysDown[2] || keysDown[6]) {
        // Pan up
        config.pitch += (pitchSpeed * 0.8 + 0.2) * diff;
    }
    
    // If down arrow or "s" is down
    if (keysDown[3] || keysDown[7]) {
        // Pan down
        config.pitch += (pitchSpeed * 0.8 - 0.2) * diff;
    }
    
    // If left arrow or "a" is down
    if (keysDown[4] || keysDown[8]) {
        // Pan left
        config.yaw += (yawSpeed * 0.8 - 0.2) * diff;
    }
    
    // If right arrow or "d" is down
    if (keysDown[5] || keysDown[9]) {
        // Pan right
        config.yaw += (yawSpeed * 0.8 + 0.2) * diff;
    }
    
    // If auto-rotate
    var inactivityInterval = Date.now() - latestInteraction;
    if (config.autoRotate && inactivityInterval > config.autoRotateInactivityDelay &&
        config.autoRotateStopDelay !== false) {
        // Pan
        if (diff > 0.000001) {
            config.yaw -= config.autoRotate / 60 * diff;
        }
        
        // Deal with stopping auto rotation after a set delay
        if (config.autoRotateStopDelay) {
            config.autoRotateStopDelay -= newTime - prevTime;
            if (config.autoRotateStopDelay <= 0) {
                config.autoRotateStopDelay = false;
            }
        }
    }

    // "Inertia"
    if (diff > 0) {
        // "Friction"
        var friction = 0.85;
        
        // Yaw
        if (!keysDown[4] && !keysDown[5] && !keysDown[8] && !keysDown[9]) {
            config.yaw += yawSpeed * diff * friction;
        }
        // Pitch
        if (!keysDown[2] && !keysDown[3] && !keysDown[6] && !keysDown[7]) {
            config.pitch += pitchSpeed * diff * friction;
        }
        // Zoom
        if (!keysDown[0] && !keysDown[1]) {
            setHfov(config.hfov + zoomSpeed * diff * friction);
        }
    }

    prevTime = newTime;
    if (diff > 0) {
        yawSpeed = yawSpeed * 0.8 + (config.yaw - prevYaw) / diff * 0.2;
        pitchSpeed = pitchSpeed * 0.8 + (config.pitch - prevPitch) / diff * 0.2;
        zoomSpeed = zoomSpeed * 0.8 + (config.hfov - prevZoom) / diff * 0.2;
        
        // Limit speed
        var maxSpeed = 5;
        yawSpeed = Math.min(maxSpeed, Math.max(yawSpeed, -maxSpeed));
        pitchSpeed = Math.min(maxSpeed, Math.max(pitchSpeed, -maxSpeed));
        zoomSpeed = Math.min(maxSpeed, Math.max(zoomSpeed, -maxSpeed));
    }
    
    // Stop movement if opposite controls are pressed
    if (keysDown[0] && keysDown[0]) {
        zoomSpeed = 0;
    }
    if ((keysDown[2] || keysDown[6]) && (keysDown[3] || keysDown[7])) {
        pitchSpeed = 0;
    }
    if ((keysDown[4] || keysDown[8]) && (keysDown[5] || keysDown[9])) {
        yawSpeed = 0;
    }
}

/**
 * Event handler for document resizes. Updates viewer size and rerenders view.
 * @private
 */
function onDocumentResize() {
    // Resize panorama renderer
    renderer.resize();
    animateInit();
    
    // Kludge to deal with WebKit regression: https://bugs.webkit.org/show_bug.cgi?id=93525
    onFullScreenChange();
}

/**
 * Initializes animation.
 * @private
 */
function animateInit() {
    if (animating) {
        return;
    }
    animating = true;
    animate();
}

/**
 * Animates view, using requestAnimationFrame to trigger rendering.
 * @private
 */
function animate() {
    render();
    if (isUserInteracting) {
        requestAnimationFrame(animate);
    } else if (keysDown[0] || keysDown[1] || keysDown[2] || keysDown[3] ||
        keysDown[4] || keysDown[5] || keysDown[6] || keysDown[7] ||
        keysDown[8] || keysDown[9] || config.autoRotate ||
        Math.abs(yawSpeed) > 0.01 || Math.abs(pitchSpeed) > 0.01 ||
        Math.abs(zoomSpeed) > 0.01) {

        keyRepeat();
        requestAnimationFrame(animate);
    } else if (renderer && (renderer.isLoading() || (config.dynamic === true && update))) {
        requestAnimationFrame(animate);
    } else {
        animating = false;
    }
}

/**
 * Renders panorama view.
 * @private
 */
function render() {
    var tmpyaw;

    if (loaded) {
        if (config.yaw > 180) {
            config.yaw -= 360;
        } else if (config.yaw < -180) {
            config.yaw += 360;
        }

        // Keep a tmp value of yaw for autoRotate comparison later
        tmpyaw = config.yaw;

        // Ensure the yaw is within min and max allowed
        config.yaw = Math.max(config.minYaw, Math.min(config.maxYaw, config.yaw));
        
        // Check if we autoRotate in a limited by min and max yaw
        // If so reverse direction
        if (config.autoRotate !== false && tmpyaw != config.yaw) {
            config.autoRotate *= -1;
        }

        // Ensure the calculated pitch is within min and max allowed
        config.pitch = Math.max(config.minPitch, Math.min(config.maxPitch, config.pitch));
        
        renderer.render(config.pitch * Math.PI / 180, config.yaw * Math.PI / 180, config.hfov * Math.PI / 180);
        
        renderHotSpots();
        
        // Update compass
        if (config.compass) {
            compass.style.transform = 'rotate(' + (-config.yaw - config.northOffset) + 'deg)';
            compass.style.webkitTransform = 'rotate(' + (-config.yaw - config.northOffset) + 'deg)';
        }
    }
}

/**
 * Initializes renderer.
 * @private
 */
function renderInit() {
    try {
        renderer.init(config.haov * Math.PI / 180, config.vaov * Math.PI / 180, config.vOffset * Math.PI / 180, renderInitCallback);
    } catch(event) {
        // Panorama not loaded
        
        // Display error if there is a bad texture
        if (event.type == 'webgl error' || event.type == 'no webgl') {
            anError();
        } else if (event.type == 'webgl size error') {
            anError('This panorama is too big for your device! It\'s ' +
                event.width + 'px wide, but your device only supports images up to ' +
                event.maxWidth + 'px wide. Try another device.' +
                ' (If you\'re the author, try scaling down the image.)');
        }
    }
}

/**
 * Triggered when render initialization finishes. Handles fading between
 * scenes as well as showing the compass and hotspots and hiding the loading
 * display.
 * @private
 */
function renderInitCallback() {
    if (oldRenderer !== undefined) {
        oldRenderer.destroy();
        
        // Fade if specified
        if (config.sceneFadeDuration && oldRenderer.fadeImg !== undefined) {
            oldRenderer.fadeImg.style.opacity = 0;
            // Remove image
            var fadeImg = oldRenderer.fadeImg;
            oldRenderer = undefined;
            setTimeout(function() {
                renderContainer.removeChild(fadeImg);
            }, config.sceneFadeDuration);
        }
    }
    
    // Show compass if applicable
    if (config.compass) {
        compass.style.display = 'inline';
    } else {
        compass.style.display = 'none';
    }
    
    // Show hotspots
    createHotSpots();
    
    // Hide loading display
    infoDisplay.load.box.style.display = 'none';
    if (preview !== undefined) {
        renderContainer.removeChild(preview);
        preview = undefined;
    }
    loaded = true;
    
    animateInit();
}

/**
 * Creates hot spot elements for the current scene.
 * @private
 */
function createHotSpots() {
    if (hotspotsCreated) return;
    
    if (!config.hotSpots) {
        config.hotSpots = [];
    } else {
        // Sort by pitch so tooltip is never obscured by another hot spot
        config.hotSpots = config.hotSpots.sort(function(a, b) {
            return a.pitch < b.pitch;
        });
        config.hotSpots.forEach(function(hs) {
            var div = document.createElement('div');
            div.className = 'pnlm-hotspot pnlm-tooltip pnlm-sprite pnlm-' + escapeHTML(hs.type);
            
            var span = document.createElement('span');
            if (hs.text)
                span.innerHTML = escapeHTML(hs.text);
            
            var a;
            if (hs.URL) {
                a = document.createElement('a');
                a.href =  encodeURI(hs.URL);
                a.target = '_blank';
                renderContainer.appendChild(a);
                div.style.cursor = 'pointer';
                span.style.cursor = 'pointer';
                a.appendChild(div);
            } else if (hs.video) {
                var video = document.createElement('video');
                video.src = encodeURI(hs.video);
                video.controls = true;
                video.style.width = hs.width + 'px';
                renderContainer.appendChild(div);
                span.appendChild(video);
            } else if (hs.image) {
                a = document.createElement('a');
                a.href = encodeURI(hs.image);
                a.target = '_blank';
                span.appendChild(a);
                var image = document.createElement('img');
                image.src = encodeURI(hs.image);
                image.style.width = hs.width + 'px';
                image.style.paddingTop = '5px';
                renderContainer.appendChild(div);
                a.appendChild(image);
                span.style.maxWidth = 'initial';
            } else {
                if (hs.sceneId) {
                    div.onclick = function() {
                        loadScene(hs.sceneId, hs.targetPitch, hs.targetYaw);
                        return false;
                    };
                    div.ontouchend = function() {
                        loadScene(hs.sceneId, hs.targetPitch, hs.targetYaw);
                        return false;
                    };
                    div.style.cursor = 'pointer';
                    span.style.cursor = 'pointer';
                }
                renderContainer.appendChild(div);
            }
            
            div.appendChild(span);
            span.style.width = span.scrollWidth - 20 + 'px';
            span.style.marginLeft = -(span.scrollWidth - 26) / 2 + 'px';
            span.style.marginTop = -span.scrollHeight - 12 + 'px';
            hs.div = div;
        });
    }
    hotspotsCreated = true;
    renderHotSpots();
}

/**
 * Destroys currently create hot spot elements.
 * @private
 */
function destroyHotSpots() {
    if (config.hotSpots) {
        for (var i = 0; i < config.hotSpots.length; i++) {
            var current = config.hotSpots[i].div;
            while(current.parentNode != renderContainer) {
                current = current.parentNode;
            }
            renderContainer.removeChild(current);
            delete config.hotSpots[i].div;
        }
    }
    hotspotsCreated = false;
    delete config.hotSpots;
}

/**
 * Renders hot spots, updating their positions and visibility.
 * @private
 */
function renderHotSpots() {
    config.hotSpots.forEach(function(hs) {
        var hsPitchSin = Math.sin(hs.pitch * Math.PI / 180);
        var hsPitchCos = Math.cos(hs.pitch * Math.PI / 180);
        var configPitchSin = Math.sin(config.pitch * Math.PI / 180);
        var configPitchCos = Math.cos(config.pitch * Math.PI / 180);
        var yawCos = Math.cos((-hs.yaw + config.yaw) * Math.PI / 180);
        var hfovTan = Math.tan(config.hfov * Math.PI / 360);
        var z = hsPitchSin * configPitchSin + hsPitchCos * yawCos * configPitchCos;
        if ((hs.yaw <= 90 && hs.yaw > -90 && z <= 0) ||
          ((hs.yaw > 90 || hs.yaw <= -90) && z <= 0)) {
            hs.div.style.visibility = 'hidden';
        } else {
            hs.div.style.visibility = 'visible';
            // Subpixel rendering doesn't work in Firefox
            // https://bugzilla.mozilla.org/show_bug.cgi?id=739176
            var canvas = renderer.getCanvas();
            var transform = 'translate(' + (-canvas.width /
                hfovTan * Math.sin((-hs.yaw + config.yaw) * Math.PI / 180) *
                hsPitchCos / z / 2 + canvas.width / 2 - 13) + 'px, ' +
                (-canvas.width / hfovTan * (hsPitchSin *
                configPitchCos - hsPitchCos * yawCos * configPitchSin) / z / 2 +
                canvas.height / 2 - 13) + 'px) translateZ(9999px)';
            hs.div.style.webkitTransform = transform;
            hs.div.style.MozTransform = transform;
            hs.div.style.transform = transform;
        }
    });
}

/**
 * Merges a scene configuration into the current configuration.
 * @private
 * @param {string} sceneId - Identifier of scene configuration to merge in.
 */
function mergeConfig(sceneId) {
    config = {};
    var k;
    var photoSphereExcludes = ['haov', 'vaov', 'vOffset', 'northOffset'];
    
    // Merge default config
    for (k in defaultConfig) {
        if (defaultConfig.hasOwnProperty(k)) {
            config[k] = defaultConfig[k];
        }
    }
    
    // Merge default scene config
    for (k in initialConfig.default) {
        if (initialConfig.default.hasOwnProperty(k)) {
            config[k] = initialConfig.default[k];
            if (photoSphereExcludes.indexOf(k) >= 0) {
                config.ignoreGPanoXMP = true;
            }
        }
    }
    
    // Merge current scene config
    if ((sceneId !== null) && (sceneId !== '') && (initialConfig.scenes) && (initialConfig.scenes[sceneId])) {
        var scene = initialConfig.scenes[sceneId];
        for (k in scene) {
            if (scene.hasOwnProperty(k)) {
                config[k] = scene[k];
                if (photoSphereExcludes.indexOf(k) >= 0) {
                    config.ignoreGPanoXMP = true;
                }
            }
        }
        config.activeScene = sceneId;
    }
    
    // Merge initial config
    for (k in initialConfig) {
        if (initialConfig.hasOwnProperty(k)) {
            config[k] = initialConfig[k];
            if (photoSphereExcludes.indexOf(k) >= 0) {
                config.ignoreGPanoXMP = true;
            }
        }
    }
}

/**
 * Processes configuration options.
 * @private
 */
function processOptions() {
    // Process preview first so it always loads before the browser hits its
    // maximum number of connections to a server as can happen with cubic
    // panoramas
    if ('preview' in config) {
        var p = config.preview;
        if (config.basePath) {
            p = config.basePath + p;
        }
        preview = document.createElement('div');
        preview.className = 'pnlm-preview-img';
        preview.style.backgroundImage = "url('" + encodeURI(p) + "')";
        renderContainer.appendChild(preview);
    }
    
    // Process other options
    for (var key in config) {
      if (config.hasOwnProperty(key)) {
        switch(key) {
            case 'title':
                infoDisplay.title.innerHTML = escapeHTML(config[key]);
                infoDisplay.container.style.display = 'inline';
                break;
            
            case 'author':
                infoDisplay.author.innerHTML = 'by ' + escapeHTML(config[key]);
                infoDisplay.container.style.display = 'inline';
                break;
            
            case 'fallback':
                infoDisplay.errorMsg.innerHTML = '<p>Your browser does not support WebGL.<br><a href="' + encodeURI(config[key]) + '" target="_blank">Click here to view this panorama in an alternative viewer.</a></p>';
                break;
            
            case 'hfov':
                setHfov(config[key]);
                break;
            
            case 'pitch':
                // Keep pitch within bounds
                config.pitch = Math.max(config.minPitch, Math.min(config.maxPitch, config.pitch));
                break;
            
            case 'autoLoad':
                if (config[key] === true && oldRenderer === undefined) {
                    // Show loading box
                    infoDisplay.load.box.style.display = 'inline';
                    // Hide load button
                    controls.load.style.display = 'none';
                    // Initialize
                    init();
                }
                break;
            
            case 'autoRotate':
                // Rotation speed in degrees/second (+ccw, -cw)
                config.autoRotate = config[key];
                break;

            case 'autoRotateInactivityDelay':
                // Start the auto-rotate only after user inactivity (milliseconds):
                config.autoRotateInactivityDelay = config[key];
                break;
                
            case 'autoRotateStopDelay':
                // Stop the auto-rotate after a certain delay (milliseconds):
                config.autoRotateStopDelay = config[key];
                break;
            
            case 'showZoomCtrl':
                if (config[key]) {
                    // Show zoom controls
                    controls.zoom.style.display = 'block';
                } else {
                    // Hide zoom controls
                    controls.zoom.style.display = 'none';
                }
                break;

            case 'showFullscreenCtrl':
                if (config[key] && ('fullscreen' in document || 'mozFullScreen' in document ||
                    'webkitIsFullScreen' in document || 'msFullscreenElement' in document)) {
                    
                    // Show fullscreen control
                    controls.fullscreen.style.display = 'block';
                } else {
                    // Hide fullscreen control
                    controls.fullscreen.style.display = 'none';
                }
                break;
        }
      }
    }
}

/**
 * Toggles fullscreen mode.
 * @private
 */
function toggleFullscreen() {
    if (loaded && !error) {
        if (!fullscreenActive) {
            try {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    container.mozRequestFullScreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                } else {
                    container.webkitRequestFullScreen();
                }
            } catch(event) {
                // Fullscreen doesn't work
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
}

/**
 * Event handler for fullscreen changes.
 * @private
 */
function onFullScreenChange() {
    if (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement) {
        controls.fullscreen.classList.add('pnlm-fullscreen-toggle-button-active');
        fullscreenActive = true;
    } else {
        controls.fullscreen.classList.remove('pnlm-fullscreen-toggle-button-active');
        fullscreenActive = false;
    }
}

/**
 * Increases panorama zoom. For use with zoom button.
 * @private
 */
function zoomIn() {
    if (loaded) {
        setHfov(config.hfov -= 5);
    }
}

/**
 * Decreases panorama zoom. For use with zoom button.
 * @private
 */
function zoomOut() {
    if (loaded) {
        setHfov(config.hfov += 5);
    }
}

/**
 * Sets viewer's horizontal field of view.
 * @private
 * @param {number} hfov - Desired horizontal field of view in degrees.
 */
function setHfov(hfov) {
    // Keep field of view within bounds
    if (hfov < config.minHfov && config.type != 'multires') {
        config.hfov = config.minHfov;
    } else if (config.type == 'multires' && renderer && hfov < renderer.getCanvas().width /
        (config.multiRes.cubeResolution / 90 * 0.9)) {
        
        config.hfov = renderer.getCanvas().width / (config.multiRes.cubeResolution / 90 * 0.9);
    } else if (hfov > config.maxHfov) {
        config.hfov = config.maxHfov;
    } else {
        config.hfov = hfov;
    }
}

/**
 * Loads panorama.
 * @private
 */
function load() {
    // Since WebGL error handling is very general, first we clear any error box
    // since it is a new scene and the error from previous maybe because of lacking
    // memory etc and not because of a lack of WebGL support etc
    clearError();

    controls.load.style.display = 'none';
    infoDisplay.load.box.style.display = 'inline';
    init();
}

/**
 * Loads scene.
 * @private
 * @param {string} sceneId - Identifier of scene configuration to merge in.
 * @param {number} targetPitch - Pitch viewer should be centered on once scene loads.
 * @param {number} targetYaw - Yaw viewer should be centered on once scene loads.
 */
function loadScene(sceneId, targetPitch, targetYaw) {
    loaded = false;
    oldRenderer = renderer;
    
    // Set up fade if specified
    var fadeImg, workingPitch, workingYaw;
    if (config.sceneFadeDuration) {
        fadeImg = new Image();
        fadeImg.className = 'pnlm-fade-img';
        fadeImg.style.transition = 'opacity ' + (config.sceneFadeDuration / 1000) + 's';
        var data = renderer.render(config.pitch * Math.PI / 180, config.yaw * Math.PI / 180, config.hfov * Math.PI / 180, true);
        if (data !== undefined) {
            fadeImg.src = data;
        }
        renderContainer.appendChild(fadeImg);
        oldRenderer.fadeImg = fadeImg;
    }
    
    // Set new pointing
    if (targetPitch === 'same') {
        workingPitch = config.pitch;
    } else {
        workingPitch = targetPitch;
    }
    if (targetYaw === 'same') {
        workingYaw = config.yaw;
    } else if (targetYaw === 'sameAzimuth') {
        workingYaw = config.yaw + config.northOffset - initialConfig.scenes[sceneId].northOffset;
    } else {
        workingYaw = targetYaw;
    }
    
    // Destroy hot spots from previous scene
    destroyHotSpots();
    
    // Create the new config for the scene
    mergeConfig(sceneId);
    
    // Reload scene
    processOptions();
    if (workingPitch) {
        config.pitch = workingPitch;
    }
    if (workingYaw) {
        config.yaw = workingYaw;
    }
    load();
}

/**
 * Escapes HTML string (to mitigate possible DOM XSS attacks).
 * @private
 * @param {string} s - String to escape
 * @returns {string} Escaped string
 */
function escapeHTML(s) {
    return String(s).replace(/&/g, '&amp;')
        .replace('"', '&quot;')
        .replace("'", '&#39;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
        .replace('/', '&#x2f;');
}

/**
 * Returns the pitch of the center of the view.
 * @memberof Viewer
 * @instance
 * @returns {number} Pitch in degrees
 */
this.getPitch = function() {
    return config.pitch;
};

/**
 * Sets the pitch of the center of the view.
 * @memberof Viewer
 * @instance
 * @param {number} pitch - Pitch in degrees
 * @returns {Viewer} `this`
 */
this.setPitch = function(pitch) {
    config.pitch = Math.max(config.minPitch, Math.min(config.maxPitch, pitch));
    return this;
};

/**
 * Returns the minimum and maximum allowed pitches (in degrees).
 * @memberof Viewer
 * @instance
 * @returns {number[]} [minimum pitch, maximum pitch]
 */
this.getPitchBounds = function() {
    return [config.minPitch, config.maxPitch];
};

/**
 * Set the minimum and maximum allowed pitches (in degrees).
 * @memberof Viewer
 * @instance
 * @param {number[]} bounds - [minimum pitch, maximum pitch]
 * @returns {Viewer} `this`
 */
this.setPitchBounds = function(bounds) {
    config.minPitch = Math.max(-90, Math.min(bounds[0], 90));
    config.maxPitch = Math.max(-90, Math.min(bounds[1], 90));
    return this;
};

/**
 * Returns the yaw of the center of the view.
 * @memberof Viewer
 * @instance
 * @returns {number} Yaw in degrees
 */
this.getYaw = function() {
    return config.yaw;
};

/**
 * Sets the yaw of the center of the view.
 * @memberof Viewer
 * @instance
 * @param {number} yaw - Yaw in degrees
 * @returns {Viewer} `this`
 */
this.setYaw = function(yaw) {
    while (yaw > 180) {
        yaw -= 360;
    }
    while (yaw < -180) {
        yaw += 360;
    }
    config.yaw = Math.max(config.minYaw, Math.min(config.maxYaw, yaw));
    return this;
};

/**
 * Returns the minimum and maximum allowed pitches (in degrees).
 * @memberof Viewer
 * @instance
 * @returns {number[]} [yaw pitch, maximum yaw]
 */
this.getYawBounds = function() {
    return [config.minYaw, config.maxYaw];
};

/**
 * Set the minimum and maximum allowed yaws (in degrees).
 * @memberof Viewer
 * @instance
 * @param {number[]} bounds - [minimum yaw, maximum yaw]
 * @returns {Viewer} `this`
 */
this.setYawBounds = function(bounds) {
    config.minYaw = Math.max(-360, Math.min(bounds[0], 360));
    config.maxYaw = Math.max(-360, Math.min(bounds[1], 360));
    return this;
};

/**
 * Returns the horizontal field of view.
 * @memberof Viewer
 * @instance
 * @returns {number} Horizontal field of view in degrees
 */
this.getHfov = function() {
    return config.hfov;
};

/**
 * Sets the horizontal field of view.
 * @memberof Viewer
 * @instance
 * @param {number} hfov - Horizontal field of view in degrees
 * @returns {Viewer} `this`
 */
this.setHfov = function(hfov) {
    setHfov(hfov);
    return this;
};

/**
 * Returns the minimum and maximum allowed horizontal fields of view
 * (in degrees).
 * @memberof Viewer
 * @instance
 * @returns {number[]} [minimum hfov, maximum hfov]
 */
this.getHfovBounds = function() {
    return [config.minHfov, config.maxHfov];
};

/**
 * Set the minimum and maximum allowed horizontal fields of view (in degrees).
 * @memberof Viewer
 * @instance
 * @param {number[]} bounds - [minimum hfov, maximum hfov]
 * @returns {Viewer} `this`
 */
this.setHfovBounds = function(bounds) {
    config.minHfov = Math.max(0, bounds[0]);
    config.maxHfov = Math.max(0, bounds[1]);
    return this;
};

/**
 * Returns the panorama renderer.
 * @memberof Viewer
 * @instance
 * @returns {Renderer}
 */
this.getRenderer = function() {
    return renderer;
};

/**
 * Sets update flag for dynamic content.
 * @memberof Viewer
 * @instance
 * @param {boolean} bool - Whether or not viewer should update even when still
 * @returns {Viewer} `this`
 */
this.setUpdate = function(bool) {
    update = bool === true;
    if (renderer === undefined)
        onImageLoad();
    else
        requestAnimationFrame(animate);
    return this;
}

}

return {
    viewer: function(container, config) {
        return new Viewer(container, config);
    }
};

})(window, document);
