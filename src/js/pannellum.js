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

'use strict';

// Display about information on right click
document.addEventListener('contextmenu', onRightClick, false);

// Declare variables
var config,
    tourConfig = {},
    configFromURL,
    renderer,
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
    canvas = document.getElementById('canvas'),
    panoImage,
    prevTime,
    yawSpeed = 0,
    pitchSpeed = 0,
    zoomSpeed = 0,
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
    video: false
};

// Process options
parseURLParameters();
processOptions();

// Initialize viewer
function init() {
    // Display an error for IE 9 as it doesn't work but also doesn't otherwise
    // show an error (older versions don't work at all)
    // Based on: http://stackoverflow.com/a/10965203
    var div = document.createElement("div");
    div.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->";
    if (div.getElementsByTagName("i").length == 1) {
        anError();
    }
    
    var i, p;
    
    if (config.type == 'cubemap') {
        panoImage = [];
        for (i = 0; i < 6; i++) {
            panoImage.push(new Image());
            panoImage[i].crossOrigin = 'anonymous';
        }
        document.getElementById('lbox').style.display = 'block';
        document.getElementById('lbar').style.display = 'none';
    } else if (config.type == 'multires') {
        var c = JSON.parse(JSON.stringify(config.multiRes));    // Deep copy
        if (config.basePath) {
            c.basePath = config.basePath + config.multiRes.basePath;
        } else if (tourConfig.basePath) {
            c.basePath = tourConfig.basePath + config.multiRes.basePath;
        }
        panoImage = c;
    } else {
        if (config.video === true) {
            panoImage = document.createElement('video');
        } else {
            panoImage = new Image();
        }
    }
    
    function onImageLoad() {
        renderer = new libpannellum.renderer(document.getElementById('container'), panoImage, config.type, config.video);
        
        // Only add event listeners once
        if (!listenersAdded) {
            listenersAdded = true;
            document.addEventListener('mousedown', onDocumentMouseDown, false);
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('mouseup', onDocumentMouseUp, false);
            document.addEventListener('mousewheel', onDocumentMouseWheel, false);
            document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
            document.addEventListener('onresize', onDocumentResize, false);
            document.addEventListener('mozfullscreenchange', onFullScreenChange, false);
            document.addEventListener('webkitfullscreenchange', onFullScreenChange, false);
            document.addEventListener('msfullscreenchange', onFullScreenChange, false);
            document.addEventListener('fullscreenchange', onFullScreenChange, false);
            window.addEventListener('resize', onDocumentResize, false);
            document.addEventListener('keydown', onDocumentKeyPress, false);
            document.addEventListener('keyup', onDocumentKeyUp, false);
            window.addEventListener('blur', clearKeys, false);
            document.addEventListener('mouseout', onDocumentMouseUp, false);
            document.addEventListener('touchstart', onDocumentTouchStart, false);
            document.addEventListener('touchmove', onDocumentTouchMove, false);
            document.addEventListener('touchend', onDocumentTouchEnd, false);
        }
        
        renderInit();
        setTimeout(function(){isTimedOut = true;}, 500);
    }
    
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
        
        for (i = 0; i < panoImage.length; i++) {
            panoImage[i].onload = onLoad;
            p = config.cubeMap[i];
            if (config.basePath) {
                p = config.basePath + p;
            } else if (tourConfig.basePath) {
                p = tourConfig.basePath + p;
            }
            panoImage[i].src = p;
        }
    } else if (config.type == 'multires') {
        onImageLoad();
    } else {
        p = '';
        if (config.basePath) {
            p = config.basePath;
        } else if (tourConfig.basePath) {
            p = tourConfig.basePath;
        }
        
        if (config.video === true) {
            for (i = 0; i < config.panoramas.length; i++) {
                if (panoImage.canPlayType(config.panoramas[i].type).length > 0) {
                    panoImage.src = p + config.panoramas[i].file;
                    break;
                }
            }
            if (panoImage.src.length < 1) {
                // Browser doesn't support any provide video formats
                console.log('Error: provided video formats are not supported');
                anError('Your browser doesn\'t support any of the provided' +
                    ' video formats. Please try using a different browser or' +
                    ' device.');
            }
            panoImage.play();
            onImageLoad();
        } else {
            // Still image
            p += config.panorama;
            
            panoImage.onload = function() {
                window.URL.revokeObjectURL(this.src);  // Clean up
                onImageLoad();
            };
            
            var xhr = new XMLHttpRequest();
            xhr.onloadend = function() {
                var img = this.response;
                parseGPanoXMP(img);
                document.getElementById('lmsg').innerHTML = '';
            };
            xhr.onprogress = function(e) {
                if (e.lengthComputable) {
                    // Display progress
                    var percent = e.loaded / e.total * 100;
                    document.getElementById('lbar_fill').style.width = percent + '%';
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
                    var msg = numerator + ' / ' + denominator + ' ' + unit;
                    document.getElementById('lmsg').innerHTML = msg;
                } else {
                    // Display loading spinner
                    document.getElementById('lbox').style.display = 'block';
                    document.getElementById('lbar').style.display = 'none';
                }
            };
            xhr.open('GET', p, true);
            xhr.responseType = 'blob';
            xhr.send();
        }
    }
    
    document.getElementById('page').className = 'grab';
}

// Parse Google Photo Sphere XMP Metadata
// https://developers.google.com/photo-sphere/metadata/
function parseGPanoXMP(image) {
    var reader = new FileReader();
    reader.addEventListener('loadend', function() {
        var img = reader.result;
        
        var start = img.indexOf('<x:xmpmeta');
        if (start > -1 && config.ignoreGPanoXMP !== true) {
            var xmpData = img.substring(start, img.indexOf('</x:xmpmeta>') + 12);
            
            // Extract the requested tag from the XMP data
            var getTag = function(tag) {
                tag = xmpData.substring(xmpData.indexOf(tag + '="') + tag.length + 2);
                tag = tag.substring(0, tag.indexOf('"'));
                if (tag.length === 0) {
                    return null;
                }
                return Number(tag);
            };
            
            // Relevant XMP data
            var xmp = {
                fullWidth: getTag('GPano:FullPanoWidthPixels'),
                croppedWidth: getTag('GPano:CroppedAreaImageWidthPixels'),
                fullHeight: getTag('GPano:FullPanoHeightPixels'),
                croppedHeight: getTag('GPano:CroppedAreaImageHeightPixels'),
                topPixels: getTag('GPano:CroppedAreaTopPixels'),
                heading: getTag('GPano:PoseHeadingDegrees')
            };
            
            if (xmp.fullWidth !== null && xmp.croppedWidth !== null &&
                xmp.fullHeight !== null && xmp.croppedHeight !== null &&
                xmp.topPixels !== null) {
                
                // Set up viewer using GPano XMP data
                config.haov = xmp.croppedWidth / xmp.fullWidth * 360;
                config.vaov = xmp.croppedHeight / xmp.fullHeight * 180;
                config.vOffset = [(xmp.topPixels + xmp.croppedHeight / 2) / xmp.fullHeight - 0.5] * -90;
                if (xmp.heading !== null) {
                    // TODO: make sure this works correctly for partial panoramas
                    config.northOffset = xmp.heading;
                    config.compass = true;
                }
                
                // TODO: add support for initial view settings
            }
        }
        
        // Load panorama
        panoImage.src = window.URL.createObjectURL(image);
    });
    reader.readAsText(image);
}

function anError(error) {
    if (error !== undefined) {
        document.getElementById('nocanvas').innerHTML = '<p>' + error + '</p>';
    }
    document.getElementById('load_box').style.display = 'none';
    document.getElementById('nocanvas').style.display = 'table';
    error = true;
    document.getElementById('container').style.display = 'none';
}

function clearError() {
    document.getElementById('load_box').style.display = 'none';
    document.getElementById('nocanvas').style.display = 'none';
    error = false;
}

function onRightClick(event) {
    document.getElementById('about').style.left = event.clientX + 'px';
    document.getElementById('about').style.top = event.clientY + 'px';
    clearTimeout(onRightClick.t1);
    clearTimeout(onRightClick.t2);
    document.getElementById('about').style.display = 'block';
    document.getElementById('about').style.opacity = 1;
    onRightClick.t1 = setTimeout(function() {document.getElementById('about').style.opacity = 0;}, 2000);
    onRightClick.t2 = setTimeout(function() {document.getElementById('about').style.display = 'none';}, 2500);
    event.preventDefault();
}

function onDocumentMouseDown(event) {
    // Override default action
    event.preventDefault();
    // But not all of it
    window.focus();
    
    // Only do something if the panorama is loaded
    if (!loaded) {
        return;
    }
    
    // Turn off auto-rotation if enabled
    config.autoRotate = false;
    
    isUserInteracting = true;
    latestInteraction = Date.now();
    
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    
    onPointerDownYaw = config.yaw;
    onPointerDownPitch = config.pitch;
    
    document.getElementById('page').className = 'grabbing';
    
    requestAnimationFrame(animate);
}

function onDocumentMouseMove(event) {
    if (isUserInteracting && loaded) {
        latestInteraction = Date.now();
        //TODO: This still isn't quite right
        var yaw = ((Math.atan(onPointerDownPointerX / canvas.width * 2 - 1) - Math.atan(event.clientX / canvas.width * 2 - 1)) * 180 / Math.PI * config.hfov / 90) + onPointerDownYaw;
        yawSpeed = (yaw - config.yaw) * 0.2;
        config.yaw = yaw;
        
        var vfov = 2 * Math.atan(Math.tan(config.hfov/360*Math.PI) * canvas.height / canvas.width) * 180 / Math.PI;
        
        var pitch = ((Math.atan(event.clientY / canvas.height * 2 - 1) - Math.atan(onPointerDownPointerY / canvas.height * 2 - 1)) * 180 / Math.PI * vfov / 90) + onPointerDownPitch;
        pitchSpeed = (pitch - config.pitch) * 0.2;
        config.pitch = pitch;
    }
}

function onDocumentMouseUp() {
    if (!isUserInteracting) {
        return;
    }
    isUserInteracting = false;
    if (Date.now() - latestInteraction > 15) {
        pitchSpeed = yawSpeed = 0;
    }
    document.getElementById('page').className = 'grab';
}

function onDocumentTouchStart(event) {
    // Only do something if the panorama is loaded
    if (!loaded) {
        return;
    }
    
    onPointerDownPointerX = event.targetTouches[0].clientX;
    onPointerDownPointerY = event.targetTouches[0].clientY;
    
    if (event.targetTouches.length == 2) {
        // Down pointer is the center of the two fingers
        onPointerDownPointerX += (event.targetTouches[1].clientX - event.targetTouches[0].clientX) * 0.5;
        onPointerDownPointerY += (event.targetTouches[1].clientY - event.targetTouches[0].clientY) * 0.5; 
        onPointerDownPointerDist = Math.sqrt(
                                    (event.targetTouches[0].clientX - event.targetTouches[1].clientX) * (event.targetTouches[0].clientX - event.targetTouches[1].clientX) +
                                    (event.targetTouches[0].clientY - event.targetTouches[1].clientY) * (event.targetTouches[0].clientY - event.targetTouches[1].clientY)); 
    }
    isUserInteracting = true;
    latestInteraction = Date.now();
    
    onPointerDownYaw = config.yaw;
    onPointerDownPitch = config.pitch;

    requestAnimationFrame(animate);
}

function onDocumentTouchMove(event) {
    // Override default action
    event.preventDefault();
    if (loaded) {
        latestInteraction = Date.now();
    }
    if (isUserInteracting && loaded) {
        var clientX = event.targetTouches[0].clientX;
        var clientY = event.targetTouches[0].clientY;
        
        if (event.targetTouches.length == 2 && onPointerDownPointerDist != -1) {
            clientX += (event.targetTouches[1].clientX - event.targetTouches[0].clientX) * 0.5;
            clientY += (event.targetTouches[1].clientY - event.targetTouches[0].clientY) * 0.5;
            var clientDist = Math.sqrt(
                                    (event.targetTouches[0].clientX - event.targetTouches[1].clientX) * (event.targetTouches[0].clientX - event.targetTouches[1].clientX) +
                                    (event.targetTouches[0].clientY - event.targetTouches[1].clientY) * (event.targetTouches[0].clientY - event.targetTouches[1].clientY));
            setHfov(config.hfov += (onPointerDownPointerDist - clientDist) * 0.1);
            onPointerDownPointerDist = clientDist;
        }
        
        var yaw = (onPointerDownPointerX - clientX) * 0.1 + onPointerDownYaw;
        yawSpeed = (yaw - config.yaw) * 0.2;
        config.yaw = yaw;
        
        var pitch = (clientY - onPointerDownPointerY) * 0.1 + onPointerDownPitch;
        pitchSpeed = (pitch - config.pitch) * 0.2;
        config.pitch = pitch;
    }
}

function onDocumentTouchEnd() {
    isUserInteracting = false;
    if (Date.now() - latestInteraction > 15) {
        pitchSpeed = yawSpeed = 0;
    }
    onPointerDownPointerDist = -1;
}

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
    } else if (event.wheelDelta) {
        // Opera / Explorer 9
        setHfov(config.hfov -= event.wheelDelta * 0.05);
    } else if (event.detail) {
        // Firefox
        setHfov(config.hfov += event.detail * 1.5);
    }
    
    if (event.detail) {
        if (event.detail > 0) {
            zoomSpeed = 1;
        } else {
            zoomSpeed = -1;
        }
    } else {
        if (event.detail < 0) {
            zoomSpeed = 1;
        } else {
            zoomSpeed = -1;
        }
    }
    
    requestAnimationFrame(animate);
}

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

function clearKeys() {
    for (var i = 0; i < 10; i++) {
        keysDown[i] = false;
    }
}

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
        requestAnimationFrame(animate);
    }
}

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
    var diff = (newTime - prevTime) * config.hfov / 1700;
    
    // If minus key is down
    if (keysDown[0]) {
        setHfov(config.hfov + (zoomSpeed * 0.8 + 0.2) * diff);
    }
    
    // If plus key is down
    if (keysDown[1]) {
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
    if (config.autoRotate && inactivityInterval > config.autoRotateInactivityDelay) {
        // Pan
        if (diff > 0.000001) {
            config.yaw -= config.autoRotate / 60 * diff;
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

function onDocumentResize() {
    // Reset panorama renderer
    renderInit();
    
    // Kludge to deal with WebKit regression: https://bugs.webkit.org/show_bug.cgi?id=93525
    onFullScreenChange();
}

function animate() {
    if (!loaded) {
        requestAnimationFrame(animate);
        return;
    }
    
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
    } else if (renderer && (renderer.isLoading() || (config.video === true &&
        !panoImage.paused && !panoImage.ended))) {
        requestAnimationFrame(animate);
    }
}

function render() {
	var tmpyaw;

    try {
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
            document.getElementById('compass').style.transform = 'rotate(' + (-config.yaw - config.northOffset) + 'deg)';
            document.getElementById('compass').style.webkitTransform = 'rotate(' + (-config.yaw - config.northOffset) + 'deg)';
        }
    } catch(event) {
        // Panorama not loaded
    }
}

function renderInit() {
    try {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderer.init(config.haov * Math.PI / 180, config.vaov * Math.PI / 180, config.vOffset * Math.PI / 180);
        
        requestAnimationFrame(animate);
        
        // Show compass if applicable
        if (config.compass) {
            document.getElementById('compass').style.display = 'inline';
        } else {
            document.getElementById('compass').style.display = 'none';
        }
        
        // Show hotspots
        createHotSpots();
        
        // Hide loading display
        document.getElementById('load_box').style.display = 'none';
        if (document.getElementById('preview') !== null) {
            document.getElementById('container').removeChild(document.getElementById('preview'));
        }
        loaded = true;
        
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

function createHotSpots() {
    if (hotspotsCreated) return;
    
    if (!config.hotSpots) {
        config.hotSpots = [];
    } else {
        config.hotSpots.forEach(function(hs) {
            var div = document.createElement('div');
            div.setAttribute('class', 'hotspot tooltip sprite ' + hs.type);
            
            var span = document.createElement('span');
            span.innerHTML = hs.text;
            
            var a;
            if (hs.URL) {
                a = document.createElement('a');
                a.setAttribute('href', hs.URL);
                a.setAttribute('target', '_blank');
                document.getElementById('container').appendChild(a);
                div.style.cursor = 'pointer';
                span.style.cursor = 'pointer';
                a.appendChild(div);
            } else if (hs.video) {
                var video = document.createElement('video');
                video.setAttribute('src',hs.video);
                video.setAttribute('controls',true);
                video.setAttribute('style','width:' + hs.width + 'px');
                document.getElementById('container').appendChild(div);
                span.appendChild(video);
            } else if (hs.image) {
                a = document.createElement('a');
                a.setAttribute('href', hs.image);
                a.setAttribute('target', '_blank');
                span.appendChild(a);
                var image = document.createElement('img');
                image.setAttribute('src',hs.image);
                image.setAttribute('style','width:' + hs.width + 'px');
                document.getElementById('container').appendChild(div);
                a.appendChild(image);
                
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
                document.getElementById('container').appendChild(div);
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

function destroyHotSpots() {
    if (config.hotSpots) {
        config.hotSpots.forEach(function(hs) {
            var current = hs.div;
            while(current.parentNode.id != 'container') {
                current = current.parentNode;
            }
            document.getElementById('container').removeChild(current);
        });
    }
    hotspotsCreated = false;
}

function renderHotSpots() {
    config.hotSpots.forEach(function(hs) {
        var z = Math.sin(hs.pitch * Math.PI / 180) * Math.sin(config.pitch * Math.PI /
            180) + Math.cos(hs.pitch * Math.PI / 180) * Math.cos((hs.yaw + config.yaw) *
            Math.PI / 180) * Math.cos(config.pitch * Math.PI / 180);
        if ((hs.yaw <= 90 && hs.yaw > -90 && z <= 0) ||
          ((hs.yaw > 90 || hs.yaw <= -90) && z <= 0)) {
            hs.div.style.visibility = 'hidden';
        } else {
            hs.div.style.visibility = 'visible';
            hs.div.style.top = -canvas.width / Math.tan(config.hfov * Math.PI / 360) *
                (Math.sin(hs.pitch * Math.PI / 180) * Math.cos(config.pitch * Math.PI /
                180) - Math.cos(hs.pitch * Math.PI / 180) * Math.cos((hs.yaw +
                config.yaw) * Math.PI / 180) * Math.sin(config.pitch * Math.PI / 180)) / z /
                2 + canvas.height / 2 - 13 + 'px';
            hs.div.style.left = -canvas.width / Math.tan(config.hfov * Math.PI / 360) *
                Math.sin((hs.yaw + config.yaw) * Math.PI / 180) * Math.cos(hs.pitch *
                Math.PI / 180) / z / 2 + canvas.width / 2 - 13 + 'px';
        }
    });
}

function parseURLParameters() {
    var URL = decodeURI(window.location.href).split('?');
    URL.shift();
    URL = URL[0].split('&');
    var json = '{';
    for (var i = 0; i < URL.length; i++) {
        var option = URL[i].split('=')[0];
        var value = URL[i].split('=')[1];
        json += '"' + option + '":';
        switch(option) {
            case 'hfov': case 'pitch': case 'yaw': case 'haov': case 'vaov':
            case 'vOffset':
                json += value;
                break;
            case 'autoLoad': case 'ignoreGPanoXMP':
                json += JSON.parse(value);
                break;
            default:
                json += '"' + decodeURIComponent(value) + '"';
        }
        if (i < URL.length - 1) {
            json += ',';
        }
    }
    json += '}';
    configFromURL = JSON.parse(json);
    
    var request;
    
    // Check for JSON configuration file
    if (configFromURL.config) {
        // Get JSON configuration file
        request = new XMLHttpRequest();
        request.open('GET', configFromURL.config, false);
        request.send();
        var c = JSON.parse(request.responseText);
        
        // Set JSON file location
        c.basePath = configFromURL.config.substring(0,configFromURL.config.lastIndexOf('/')+1);
        
        // Merge options
        for (var k in c) {
            if (!configFromURL[k]) {
                configFromURL[k] = c[k];
            }
        }
    }
    
    // Check for virtual tour JSON configuration file
    var firstScene = null;
    if (configFromURL.tour) {
        // Get JSON configuration file
        request = new XMLHttpRequest();
        request.open('GET', configFromURL.tour, false);
        request.send();
        tourConfig = JSON.parse(request.responseText);
        
        // Set JSON file location
        tourConfig.basePath = configFromURL.tour.substring(0,configFromURL.tour.lastIndexOf('/')+1);
        
        // Activate first scene if specified
        if (tourConfig.default.firstScene) {
            firstScene = tourConfig.default.firstScene;
        }
        if (configFromURL.firstScene) {
            firstScene = configFromURL.firstScene;
        }
    }
    
    mergeConfig(firstScene);
}

function mergeConfig(sceneId) {
    config = {};
    var k;
    
    // Merge default config
    for (k in defaultConfig) {
        if (defaultConfig.hasOwnProperty(k)) {
            config[k] = defaultConfig[k];
        }
    }
    
    // Merge default scene config
    for (k in tourConfig.default) {
        if (tourConfig.default.hasOwnProperty(k)) {
            config[k] = tourConfig.default[k];
        }
    }
    
    // Merge current scene config
    if ((sceneId !== null) && (sceneId !== '') && (tourConfig.scenes) && (tourConfig.scenes[sceneId])) {
        var scene = tourConfig.scenes[sceneId];
        for (k in scene) {
            if (scene.hasOwnProperty(k)) {
                config[k] = scene[k];
            }
        }
        config.activeScene = sceneId;
    }
    
    // Merge URL and config file
    for (k in configFromURL) {
        if (configFromURL.hasOwnProperty(k)) {
            config[k] = configFromURL[k];
        }
    }
}

function processOptions() {
    // Process preview first so it always loads before the browser hits its
    // maximum number of connections to a server as can happen with cubic
    // panoramas
    if ('preview' in config) {
        var p = config.preview;
        if (config.basePath) {
            p = config.basePath + p;
        } else if (tourConfig.basePath) {
            p = tourConfig.basePath + p;
        }
        
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.id = 'preview';
        img.src = p;
        document.getElementById('container').appendChild(img);
    }
    
    // Process other options
    for (var key in config) {
      if (config.hasOwnProperty(key)) {
        switch(key) {
            case 'title':
                document.getElementById('title_box').innerHTML = config[key];
                document.getElementById('panorama_info').style.display = 'inline';
                break;
            
            case 'author':
                document.getElementById('author_box').innerHTML = 'by ' + config[key];
                document.getElementById('panorama_info').style.display = 'inline';
                break;
            
            case 'fallback':
                document.getElementById('nocanvas').innerHTML = '<p>Your browser does not support WebGL.<br><a href="' + config[key] + '" target="_blank">Click here to view this panorama in an alternative viewer.</a></p>';
                break;
            
            case 'hfov':
                setHfov(config[key]);
                break;
            
            case 'pitch':
                // Keep pitch within bounds
                config.pitch = Math.max(config.minPitch, Math.min(config.maxPitch, config.pitch));
                break;
            
            case 'autoLoad':
                if (config[key] === true) {
                    // Show loading box
                    document.getElementById('load_box').style.display = 'inline';
                    // Hide load button
                    document.getElementById('load_button').style.display = 'none';
                    // Initialize
                    init();
                    requestAnimationFrame(animate);
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
            
            case 'header':
                // Add contents to header
                document.getElementsByTagName('head')[0].innerHTML += config[key];
                break;
            
            case 'showZoomCtrl':
                if (config[key]) {
                    // Show zoom controls
                    document.getElementById('zoomcontrols').style.display = 'block';
                } else {
                    // Hide zoom controls
                    document.getElementById('zoomcontrols').style.display = 'none';
                }
                break;
            
            case 'showFullscreenCtrl':
                if (config[key] && ('fullscreen' in document || 'mozFullScreen' in document ||
                    'webkitIsFullScreen' in document || 'msFullscreenElement' in document)) {
                    
                    // Show fullscreen control
                    document.getElementById('fullscreentoggle_button').style.display = 'block';
                } else {
                    // Hide fullscreen control
                    document.getElementById('fullscreentoggle_button').style.display = 'none';
                }
                break;
        }
      }
    }
}

function toggleFullscreen() {
    if (loaded && !error) {
        if (!fullscreenActive) {
            try {
                var page = document.getElementById('page');
                if (page.requestFullscreen) {
                    page.requestFullscreen();
                } else if (page.mozRequestFullScreen) {
                    page.mozRequestFullScreen();
                } else if (page.msRequestFullscreen) {
                    page.msRequestFullscreen();
                } else {
                    page.webkitRequestFullScreen();
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

function onFullScreenChange() {
    if (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement) {
        document.getElementById('fullscreentoggle_button').classList.add('fullscreentoggle_button_active');
        fullscreenActive = true;
    } else {
        document.getElementById('fullscreentoggle_button').classList.remove('fullscreentoggle_button_active');
        fullscreenActive = false;
    }
}

function zoomIn(amount) {
    if (loaded) {
        setHfov(config.hfov -= amount);
    }
}

function zoomOut(amount) {
    if (loaded) {
        setHfov(config.hfov += amount);
    }
}

function setHfov(i) {
    // Keep field of view within bounds
    if (i < config.minHfov && config.type != 'multires') {
        config.hfov = config.minHfov;
    } else if (config.type == 'multires' && i < canvas.width /
        (config.multiRes.cubeResolution / 90 * 0.9)) {
        
        config.hfov = canvas.width / (config.multiRes.cubeResolution / 90 * 0.9);
    } else if (i > config.maxHfov) {
        config.hfov = config.maxHfov;
    } else {
        config.hfov = i;
    }
}

function load() {
    // Since WebGL error handling is very general, first we clear any error box
    // since it is a new scene and the error from previous maybe because of lacking
    // memory etc and not because of a lack of WebGL support etc
    clearError();

    document.getElementById('load_button').style.display = 'none';
    document.getElementById('load_box').style.display = 'inline';
    init();
    requestAnimationFrame(animate);
}

function loadScene(sceneId, targetPitch, targetYaw) {
    loaded = false;
    
    if (targetPitch === 'same') {
        targetPitch = config.pitch;
    }
    if (targetYaw === 'same') {
        targetYaw = config.yaw;
    } else if (targetYaw === 'sameAzimuth') {
        targetYaw = config.yaw + config.northOffset - tourConfig.scenes[sceneId].northOffset;
    }
    
    // Destroy hot spots from previous scene
    destroyHotSpots();
    
    // Create the new config for the scene
    mergeConfig(sceneId);
    
    // Reload scene
    processOptions();
    if (targetPitch) {
        config.pitch = targetPitch;
    }
    if (targetYaw) {
        config.yaw = targetYaw;
    }
    load();
}
