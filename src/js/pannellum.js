/*
 * Pannellum - An HTML5 based Panorama Viewer
 * Copyright (c) 2011-2014 Matthew Petroff
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

// Display about information on right click
document.addEventListener('contextmenu', onRightClick, false);

// Declare variables
var config,
    tourConfig = {},
    configFromURL,
    popoutMode = false,
    renderer,
    isUserInteracting = false,
    latestInteraction = Date.now(),
    onPointerDownPointerX = 0,
    onPointerDownPointerY = 0,
    onPointerDownPointerDist = -1,
    onPointerDownYaw = 0,
    onPointerDownPitch = 0,
    keysDown = new Array(10),
    fullWindowActive = false,
    loaded = false,
    error = false,
    isTimedOut = false,
    listenersAdded = false,
    canvas = document.getElementById('canvas'),
    panoImage,
    prevTime,
    hotspotsCreated = false;

var defaultConfig = {
    hfov: 100,
    minhfov: 50,
    maxhfov: 120,
    pitch: 0,
    minpitch: -85,
    maxpitch: 85,
    yaw: 0,
    minyaw: -360,
    maxyaw: 360,
    haov: 360,
    vaov: 180,
    voffset: 0,
    autoRotate: false,
    autoRotateDelayMillis: -1,
    type: 'equirectangular',
    northOffset: 0
};

// Process options
parseURLParameters();
processOptions();

// Initialize viewer
function init() {
    if (config.type == 'cubemap') {
        panoImage = [];
        for (var i = 0; i < 6; i++) {
            panoImage.push(new Image());
            panoImage[i].crossOrigin = 'anonymous';
        }
    } else if (config.type == 'multires') {
        var c = JSON.parse(JSON.stringify(config.multiRes));    // Deep copy
        if (config.basePath) {
            c.basePath = config.basePath + config.multiRes.basePath;
        } else if (tourConfig.basePath) {
            c.basePath = tourConfig.basePath + config.multiRes.basePath;
        }
        panoImage = c;
    } else {
        panoImage = new Image();
        panoImage.crossOrigin = 'anonymous';
    }
    
    function onImageLoad() {
        renderer = new libpannellum.renderer(document.getElementById('container'), panoImage, config.type);
        
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
            document.addEventListener('mozfullscreenerror', fullScreenError, false);
            document.addEventListener('webkitfullscreenerror', fullScreenError, false);
            document.addEventListener('msfullscreenerror', fullScreenError, false);
            document.addEventListener('fullscreenerror', fullScreenError, false);
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
        
        for (var i = 0; i < panoImage.length; i++) {
            panoImage[i].onload = function() {
                itemsToLoad--;
                if (itemsToLoad === 0) {
                    onImageLoad();
                }
            };
            var p = config.cubeMap[i];
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
        panoImage.onload = onImageLoad;
        var p = config.panorama;
        if (config.basePath) {
            p = config.basePath + p;
        } else if (tourConfig.basePath) {
            p = tourConfig.basePath + p;
        }
        panoImage.src = p;
    }
    
    document.getElementById('page').className = 'grab';
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
        // Ensure the yaw is within min and max allowed
        config.yaw = Math.max(config.minyaw, Math.min(config.maxyaw, yaw));
        
        var vfov = 2 * Math.atan(Math.tan(config.hfov/360*Math.PI) * canvas.height / canvas.width) * 180 / Math.PI;
        
        var pitch = ((Math.atan(event.clientY / canvas.height * 2 - 1) - Math.atan(onPointerDownPointerY / canvas.height * 2 - 1)) * 180 / Math.PI * vfov / 90) + onPointerDownPitch;
        // Ensure the calculated pitch is within min and max allowed
        config.pitch = Math.max(config.minpitch, Math.min(config.maxpitch, pitch));
    }
}

function onDocumentMouseUp() {
    isUserInteracting = false;
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
        // Ensure the yaw is within min and max allowed
        config.yaw = Math.max(config.minyaw, Math.min(config.maxyaw, yaw));
        
        var pitch = (clientY - onPointerDownPointerY) * 0.1 + onPointerDownPitch;
        // Ensure the calculated pitch is within min and max allowed
        config.pitch = Math.max(config.minpitch, Math.min(config.maxpitch, pitch));
    }
}

function onDocumentTouchEnd() {
    isUserInteracting = false;
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
        // If in full window / popout mode
        if (fullWindowActive || popoutMode) {
            toggleFullWindow();
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
    
    var newTime;
    if (typeof performance !== 'undefined' && performance.now()) {
        newTime = performance.now();
    } else {
        newTime = Date.now();
    }
    var diff = (newTime - prevTime) * config.hfov / 1700;
    
    var pitch = config.pitch;
    var yaw = config.yaw;
    
    // If minus key is down
    if (keysDown[0]) {
        zoomOut(diff);
    }
    
    // If plus key is down
    if (keysDown[1]) {
        zoomIn(diff);
    }
    
    // If up arrow or "w" is down
    if (keysDown[2] || keysDown[6]) {
        // Pan up
        pitch += diff;
        
        // Ensure the calculated pitch is within min and max allowed
        config.pitch = Math.max(config.minpitch, Math.min(config.maxpitch, pitch));
    }
    
    // If down arrow or "s" is down
    if (keysDown[3] || keysDown[7]) {
        // Pan down
        pitch -= diff;
        
        // Ensure the calculated pitch is within min and max allowed
        config.pitch = Math.max(config.minpitch, Math.min(config.maxpitch, pitch));
    }
    
    // If left arrow or "a" is down
    if (keysDown[4] || keysDown[8]) {
        // Pan left
        yaw -= diff;
        
        // Ensure the yaw is within min and max allowed
        config.yaw = Math.max(config.minyaw, Math.min(config.maxyaw, yaw));
    }
    
    // If right arrow or "d" is down
    if (keysDown[5] || keysDown[9]) {
        // Pan right
        yaw += diff;
        
        // Ensure the yaw is within min and max allowed
        config.yaw = Math.max(config.minyaw, Math.min(config.maxyaw, yaw));
    }
    
    // If auto-rotate
    var inactivityInterval = Date.now() - latestInteraction;
    if (config.autoRotate && inactivityInterval > config.autoRotateDelayMillis) {
        // Pan
        if (diff > 0.000001) {
            config.yaw -= config.autoRotate / 60 * diff;
        }
    }

    prevTime = newTime;
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
    } else if (keysDown[0] || keysDown[1] || keysDown[2] || keysDown[3]
      || keysDown[4] || keysDown[5] || keysDown[6] || keysDown[7]
      || keysDown[8] || keysDown[9] || config.autoRotate) {
        keyRepeat();
        requestAnimationFrame(animate);
    } else if (renderer && renderer.isLoading()) {
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
        config.yaw = Math.max(config.minyaw, Math.min(config.maxyaw, config.yaw));
        
		// Check if we autoRotate in a limited by min and max yaw
		// If so reverse direction
		if (config.autoRotate !== false && tmpyaw != config.yaw) {
			config.autoRotate *= -1;
		}

        // Ensure the calculated pitch is within min and max allowed
        config.pitch = Math.max(config.minpitch, Math.min(config.maxpitch, config.pitch));
        
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
        renderer.init(config.haov * Math.PI / 180, config.vaov * Math.PI / 180, config.voffset * Math.PI / 180);
        
        animate();
        
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
            anError('This panorama is too big for your device! It\'s '
                + event.width + 'px wide, but your device only supports images up to '
                + event.maxWidth + 'px wide. Try another device.'
                + ' (If you\'re the author, try scaling down the image.)');
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
            
            if (hs.URL) {
                var a = document.createElement('a');
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
                var a = document.createElement('a');
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
            case 'voffset':
                json += value;
                break;
            default:
                json += '"' + value + '"';
        }
        if (i < URL.length - 1) {
            json += ',';
        }
    }
    json += '}';
    configFromURL = JSON.parse(json);
    
    // Check for JSON configuration file
    if (configFromURL.config) {
        // Get JSON configuration file
        var request = new XMLHttpRequest();
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
        var request = new XMLHttpRequest();
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
    
    // Merge default config
    for (var k in defaultConfig) {
        config[k] = defaultConfig[k];
    }
    
    // Merge default scene config
    for (var k in tourConfig.default) {
        config[k] = tourConfig.default[k];
    }
    
    // Merge current scene config
    if ((sceneId !== null) && (sceneId !== '') && (tourConfig.scenes) && (tourConfig.scenes[sceneId])) {
        var scene = tourConfig.scenes[sceneId];
        for (var k in scene) {
            config[k] = scene[k];
        }
        config.activeScene = sceneId;
    }
    
    // Merge URL and config file
    for (var k in configFromURL) {
        config[k] = configFromURL[k];
    }
}

function processOptions() {
    // Process preview first so it always loads before the browser hits its
    // maximum number of connections to a server as can happen with cubic
    // panoramas
    if ('preview' in config) {
        var p = config['preview'];
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
        switch(key) {
            case 'title':
                document.getElementById('title_box').innerHTML = config[key];
                document.getElementById('panorama_info').style.display = 'inline';
                break;
            
            case 'author':
                document.getElementById('author_box').innerHTML = 'by ' + config[key];
                document.getElementById('panorama_info').style.display = 'inline';
                break;
                
            case 'popout':
                if (config[key] == 'yes') {
                    document.getElementById('fullwindowtoggle_button').classList.add('fullwindowtoggle_button_active');
                    popoutMode = true;
                }
                break;
            
            case 'fallback':
                document.getElementById('nocanvas').innerHTML = '<p>Your browser does not support WebGL.<br><a href="' + config[key] + '" target="_blank">Click here to view this panorama in an alternative viewer.</a></p>';
                break;
            
            case 'hfov':
                setHfov(config[key]);
                break;
            
            case 'pitch':
                // Keep pitch within bounds
                config.pitch = Math.max(config.minpitch, Math.min(config.maxpitch, config.pitch));
                break;
            
            case 'autoload':
                if (config[key] == 'yes') {
                    // Show loading box
                    document.getElementById('load_box').style.display = 'inline';
                }
            case 'popoutautoload':
                // Hide load button
                document.getElementById('load_button').style.display = 'none';
                // Initialize
                init();
                animate();
                break;
            
            case 'autorotate':
                // Rotation speed in degrees/second (+ccw, -cw)
                config.autoRotate = config[key];
                break;

            case 'autorotateDelayMillis':
                // Start the auto-rotate only after user inactivity (milliseconds):
                config.autoRotateDelayMillis = config[key];
                break;
            
            case 'header':
                // Add contents to header
                document.getElementsByTagName('head')[0].innerHTML += config[key];
            
            case 'showZoomCtrl':
                if (config[key]) {
                    // Show zoom controls
                    document.getElementById('zoomcontrols').style.display = 'block';
                } else {
                    // Hide zoom controls
                    document.getElementById('zoomcontrols').style.display = 'none';
                }
            
            case 'showFullscreenCtrl':
                if (config[key]) {
                    // Show fullscreen control
                    document.getElementById('fullwindowtoggle_button').style.display = 'block';
                } else {
                    // Hide fullscreen control
                    document.getElementById('fullwindowtoggle_button').style.display = 'none';
                }
        }
    }
}

function toggleFullWindow() {
    if (loaded && !error) {
        if (!fullWindowActive && !popoutMode) {
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
                fullScreenError();
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

            if (popoutMode) {
                window.close();
            }
        }
    }
}

function onFullScreenChange() {
    if (document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement) {
        document.getElementById('fullwindowtoggle_button').classList.add('fullwindowtoggle_button_active');
        fullWindowActive = true;
    } else {
        document.getElementById('fullwindowtoggle_button').classList.remove('fullwindowtoggle_button_active');
        fullWindowActive = false;
    }
}

function fullScreenError() {
    if (!popoutMode) {
        // Open new window instead
        var windowspecs = 'width=' + screen.width + ',height=' + screen.height + ',left=0,top=0';
        var windowlocation = window.location.href + '&popout=yes';
        windowlocation += '&popoutautoload';
        window.open(windowlocation, null, windowspecs);
    } else {
        window.close();
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
    if (i < config.minhfov && config.type != 'multires') {
        config.hfov = config.minhfov;
    } else if (config.type == 'multires' && i < canvas.width
        / (config.multiRes.cubeResolution / 90 * 0.9)) {
        config.hfov = canvas.width / (config.multiRes.cubeResolution / 90 * 0.9);
    } else if (i > config.maxhfov) {
        config.hfov = config.maxhfov;
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
    animate();
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
