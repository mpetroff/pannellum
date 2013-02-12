/*
 * Pannellum - An HTML5 based Panorama Viewer
 * Copyright (c) 2011-2013 Matthew Petroff
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
var config, tour, popoutMode = false, hfov = 70, pitch = 0, yaw = 0, haov = 360,
    vaov = 180, voffset = 0, renderer, isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0, onMouseDownYaw = 0,
    onMouseDownPitch = 0, phi = 0, theta = 0, keysDown = new Array(10),
    fullWindowActive = false, loaded = false, error = false, isTimedOut = false, eventsadded = false,
    about_box = document.getElementById('about_box'), autoRotate = false,
    canvas = document.getElementById('canvas'), panoType = 'equirectangular',
    panoImage, panoSrc;

// Process options
parseURLParameters();
processOptions();

// Initialize viewer
function init() {
    if(panoType == 'cubemap') {
        panoImage = new Array();
        for(var i = 0; i < 6; i++) {
            panoImage.push(new Image());
        }
    } else {
        panoImage = new Image();
    }

    function onImageLoad() {
        try {
            renderer = new libpannellum.renderer(canvas, panoImage, panoType);
        } catch (event) {
            // Show error message if WebGL is not supported
            anError();
        }
        
		//do not add again the events
		if(!eventsadded){
			eventsadded = true;
			document.addEventListener('mousedown', onDocumentMouseDown, false);
			document.addEventListener('mousemove', onDocumentMouseMove, false);
			document.addEventListener('mouseup', onDocumentMouseUp, false);
			document.addEventListener('mousewheel', onDocumentMouseWheel, false);
			document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
			document.addEventListener('onresize', onDocumentResize, false);
			document.addEventListener('mozfullscreenchange', onFullScreenChange, false);
			document.addEventListener('webkitfullscreenchange', onFullScreenChange, false);
			document.addEventListener('fullscreenchange', onFullScreenChange, false);
			document.addEventListener('mozfullscreenerror', fullScreenError, false);
			document.addEventListener('webkitfullscreenerror', fullScreenError, false);
			document.addEventListener('fullscreenerror', fullScreenError, false);
			window.addEventListener('resize', onDocumentResize, false);
			document.addEventListener('keydown', onDocumentKeyPress, false);
			document.addEventListener('keyup', onDocumentKeyUp, false);
			window.addEventListener('blur', clearKeys, false);
			document.addEventListener('mouseout', onDocumentMouseUp, false);
			document.addEventListener('touchstart', onDocumentTouchStart, false);
			document.addEventListener('touchmove', onDocumentTouchMove, false);
			document.addEventListener('touchend', onDocumentTouchEnd, false);
			setInterval('keyRepeat()', 10);
		}
        
        renderInit();
        var t = setTimeout('isTimedOut = true', 500);        
        
    }
    
    // Configure image loading
    if(panoType == "cubemap") {
        // Quick loading counter for synchronous loading
        var itemsToLoad = 6;
        function loadCounter() {
            itemsToLoad--;
            if(itemsToLoad == 0) {
                onImageLoad();
            }
        }
        
        for(var i = 0; i < panoImage.length; i++) {
            panoImage[i].onload = loadCounter;
            panoImage[i].src = config.cubeMap[i];
        }
    } else {
        panoImage.onload = onImageLoad;
        panoImage.src = panoSrc;
    }
    
    document.getElementById('page').className = 'grab';
}

function anError() {
    document.getElementById('load_box').style.display = 'none';
    document.getElementById('nocanvas').style.display = 'table';
    error = true;
}

function onRightClick(event) {
    document.getElementById('about').style.left = event.clientX + 'px';
    document.getElementById('about').style.top = event.clientY + 'px';
    clearTimeout(onRightClick.t1);
    clearTimeout(onRightClick.t2);
    document.getElementById('about').style.display = 'block';
    document.getElementById('about').style.opacity = 1;
    onRightClick.t1 = setTimeout(function(){document.getElementById('about').style.opacity = 0;}, 2000);
    onRightClick.t2 = setTimeout(function(){document.getElementById('about').style.display = 'none';}, 2500);
    event.preventDefault();
}

function onDocumentMouseDown(event) {
    // Override default action
    event.preventDefault();
    // But not all of it
    window.focus();
    
    // Turn off auto-rotation if enabled
    autoRotate = false;
    
    isUserInteracting = true;
    
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    
    onPointerDownYaw = yaw;
    onPointerDownPitch = pitch; 
    
    document.getElementById('page').className = 'grabbing';
}

function onDocumentMouseMove(event) {
    if (isUserInteracting) {
        //TODO: This should not only be FOV scaled but scaled to canvas size
        yaw = (onPointerDownPointerX - event.clientX) * 0.0029 * hfov + onPointerDownYaw;
        pitch = (event.clientY - onPointerDownPointerY) * 0.0029 * hfov + onPointerDownPitch;
        animate();
    }
}

function onDocumentMouseUp(event) {
    isUserInteracting = false;
    document.getElementById('page').className = 'grab';
}

function onDocumentTouchStart(event) {
    onPointerDownPointerX = event.targetTouches[0].clientX;
    onPointerDownPointerY = event.targetTouches[0].clientY;
    
    onPointerDownYaw = yaw;
    onPointerDownPitch = pitch;
}

function onDocumentTouchMove(event) {
    // Override default action
    event.preventDefault();
        
    yaw = (onPointerDownPointerX - event.targetTouches[0].clientX) * 0.1 + onPointerDownYaw;
    pitch = (event.targetTouches[0].clientY - onPointerDownPointerY) * 0.1 + onPointerDownPitch;
    animate();
}

function onDocumentTouchEnd(event) {
    // Do nothing for now
}

function onDocumentMouseWheel(event) {
    event.preventDefault();
    
    if (event.wheelDeltaY) {
        // WebKit
        setHfov(hfov -= event.wheelDeltaY * 0.05);
    } else if (event.wheelDelta) {
        // Opera / Explorer 9
        setHfov(hfov -= event.wheelDelta * 0.05);
    } else if (event.detail) {
        // Firefox
        setHfov(hfov += event.detail * 1.5);
    }
}

function onDocumentKeyPress(event) {
    // Override default action
    event.preventDefault();
    
    // Turn off auto-rotation if enabled
    autoRotate = false;
    
    // Record key pressed
    keynumber = event.keycode;
    if(event.which) {
        keynumber = event.which;
    }
    
    // If escape key is pressed
    if(keynumber == 27) {
        // If in full window / popout mode
        if(fullWindowActive || popoutMode) {
            toggleFullWindow();
        }
    } else {
        // Change key
        changeKey(keynumber, true);
    }
}

function clearKeys() {
    for(i = 0; i < 10; i++) {
        keysDown[i] = false;
    }
}

function onDocumentKeyUp(event) {
    // Override default action
    event.preventDefault();
    
    // Record key released
    keynumber = event.keycode;
    if(event.which) {
        keynumber = event.which;
    }
    
    // Change key
    changeKey(keynumber, false);
}

function changeKey(keynumber, value) {
    switch(keynumber) {
        // If minus key is released
        case 109: case 189: case 17:
            keysDown[0] = value; break;
        
        // If plus key is released
        case 107: case 187: case 16:
            keysDown[1] = value; break;
        
        // If up arrow is released
        case 38:
            keysDown[2] = value; break;
        
        // If "w" is released
        case 87:
            keysDown[6] = value; break;
        
        // If down arrow is released
        case 40:
            keysDown[3] = value; break;
        
        // If "s" is released
        case 83:
            keysDown[7] = value; break;
        
        // If left arrow is released
        case 37:
            keysDown[4] = value; break;
        
        // If "a" is released
        case 65:
            keysDown[8] = value; break;
        
        // If right arrow is released
        case 39:
            keysDown[5] = value; break;
        
        // If "d" is released
        case 68:
            keysDown[9] = value;
    }
}

function keyRepeat() {
    // If minus key is down
    if(keysDown[0]) {
        zoomOut(1);
    }
    
    // If plus key is down
    if(keysDown[1]) {
        zoomIn(1);
    }
    
    // If up arrow or "w" is down
    if(keysDown[2] || keysDown[6]) {
        // Pan up
        pitch += 1;
        animate();
    }
    
    // If down arrow or "s" is down
    if(keysDown[3] || keysDown[7]) {
        // Pan down
        pitch -= 1;
        animate();
    }
    
    // If left arrow or "a" is down
    if(keysDown[4] || keysDown[8]) {
        // Pan left
        yaw -= 1;
        animate();
    }
    
    // If right arrow or "d" is down
    if(keysDown[5] || keysDown[9]) {
        // Pan right
        yaw += 1;
        animate();
    }
    
    // If clockwise auto-rotate
    if(autoRotate == 'cw') {
        // Pan left
        yaw -= .25;
        animate();
    }
    
    // If counter-clockwise auto-rotate
    if(autoRotate == 'ccw') {
        // Pan right
        yaw += .25;
        animate();
    }
}

function onDocumentResize() {
    // Reset panorama renderer
    renderInit();
        
    // Kludge to deal with WebKit regression: https://bugs.webkit.org/show_bug.cgi?id=93525
    onFullScreenChange();
}

function animate() {
    render();
    
    if(isUserInteracting) {
        requestAnimationFrame(animate);
    }
}

function render() {
    if(loaded) {
        if(yaw > 180) {
            yaw -= 360;
        } else if(yaw < -180) {
            yaw += 360;
        }
        
        pitch = Math.max(-85, Math.min(85, pitch));
        renderer.render(pitch * Math.PI / 180, yaw * Math.PI / 180, hfov * Math.PI / 180);
        
        renderHotSpots();
    }
}

function renderInit() {
    try {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderer.init(haov * Math.PI / 180, vaov * Math.PI / 180, voffset * Math.PI / 180);
        
        animate();
        
        if(!isTimedOut) {
            requestAnimationFrame(renderInit);
        } else {
            // Hide loading display
            document.getElementById('load_box').style.display = 'none';
            loaded = true;
        }
    } catch(event) {
        // Panorama not loaded
        
        // Display error if there is a bad texture
        if(event == 'bad texture') {
            anError();
        }
    }
}

function createHotSpots() {
	//Fix if there are no hotspots
	if(!config.hotSpots){
		config.hotSpots = [];
	}
    config.hotSpots.forEach(function(hs) {
        var div = document.createElement('div');
        var span = document.createElement('span');
        div.setAttribute('class', 'hotspot tooltip sprite ' + hs.type);
        if(hs.URL) {
            var a = document.createElement('a');
            a.setAttribute('href', hs.URL);
            document.getElementById('page').appendChild(a);
            div.style.cursor = 'pointer';
            span.style.cursor = 'pointer';
            a.appendChild(div);
		} else if(hs.sceneId) {
			var a = document.createElement('a');
            a.setAttribute('href', 'javascript:void(0);');
			//a.setAttribute('onClick', 'loadScene(' + hs.sceneId + '); return false;');
			a.onclick = function(){
				var id = hs.sceneId;
				loadScene(id);
				return false;
            };
            document.getElementById('page').appendChild(a);
            div.style.cursor = 'pointer';
            span.style.cursor = 'pointer';
            a.appendChild(div);
        } else {
            document.getElementById('page').appendChild(div);
        }
        span.innerHTML = hs.text;
        div.appendChild(span);
        span.style.width = span.scrollWidth - 20 + 'px';
        span.style.marginLeft = -(span.scrollWidth - 20) / 2 + 'px';
        span.style.marginTop = -span.scrollHeight - 12 + 'px';
        hs.div = div;
    });
}

function destroyHotSpots() {
	if(config.hotSpots){
		config.hotSpots.forEach(function(hs) {
			var current = hs.div;
			while(current.parentNode.id != 'page'){
				current = current.parentNode;
			}
			document.getElementById('page').removeChild(current);
		});
	}
}

function renderHotSpots() {
    config.hotSpots.forEach(function(hs) {
        var z = Math.sin(hs.pitch * Math.PI / 180) * Math.sin(pitch * Math.PI /
            180) + Math.cos(hs.pitch * Math.PI / 180) * Math.cos((hs.yaw + yaw) *
            Math.PI / 180) * Math.cos(pitch * Math.PI / 180);
        if((hs.yaw <= 90 && hs.yaw > -90 && z <= 0) ||
          (hs.yaw > 90 || hs.yaw <= -90 && z <= 0)) {
            hs.div.style.visibility = 'hidden';
        } else {
            hs.div.style.visibility = 'visible';
            hs.div.style.top = -canvas.height / Math.tan(hfov * Math.PI / 360) *
                (Math.sin(hs.pitch * Math.PI / 180) * Math.cos(pitch * Math.PI /
                180) - Math.cos(hs.pitch * Math.PI / 180) * Math.cos((hs.yaw +
                yaw) * Math.PI / 180) * Math.sin(pitch * Math.PI / 180)) / z /
                2 + canvas.height / 2 - 13.5 + 'px';
            hs.div.style.left = -canvas.height / Math.tan(hfov * Math.PI / 360) *
                Math.sin((hs.yaw + yaw) * Math.PI / 180) * Math.cos(hs.pitch *
                Math.PI / 180) / z / 2 + canvas.width / 2 - 13.5 + 'px';
        }
    });
}

function parseURLParameters() {
    var URL = unescape(window.location.href).split('?');
    URL.shift();
    URL = URL[0].split('&');
    var json = '{';
    for(var i = 0; i < URL.length; i++) {
        var option = URL[i].split('=')[0];
        var value = URL[i].split('=')[1];
        json += '"' + option + '":';
        switch(option) {
            case 'hfov': case 'pitch': case 'yaw': case 'haov': case 'vaov':
            case 'voffset': case 'license':
                json += value;
                break;
            default:
                json += '"' + value + '"';
        }
        if(i < URL.length - 1) {
            json += ',';
        }
    }
    json += '}';
    config = JSON.parse(json);
    
    // Check for JSON configuration file
    for(var key in config) {
        if(key == 'config') {
            // Get JSON configuration file
            var request = new XMLHttpRequest();
            request.open('GET', config[key], false);
            request.send();
            var c = JSON.parse(request.responseText);
            
            // Merge options
            for(var k in c) {
                if(!config[k]) {
                    config[k] = c[k];
                }
            }
        }
    }
	
	// Check for virtual tour configuration file
    for(var key in config) {
        if(key == 'tour') {
            // Get JSON configuration file
            var request = new XMLHttpRequest();
            request.open('GET', config[key], false);
            request.send();
            tour = JSON.parse(request.responseText);
			// Back up parameters readed from config file and URL for future use
			tour.configFromUrl = config;
			// Activating first scene if specified
            if(tour.global.defaultScene){
				loadSceneData(tour.global.defaultScene);
			}else{
				loadSceneData(null);
			}
        }
    }
}

function loadSceneData(sceneId){
	// Merge data loaded from URL and config file + global data from tour file + scene specific data
	config = tour.configFromUrl;
	// Merge global options
    for(var k in tour.global){
        config[k] = tour.global[k];
    }
	// Merge scene options
	if((sceneId != null) && (sceneId != '') && (tour.scenes) && (tour.scenes[sceneId]))
	{
		for(var k in tour.scenes[sceneId]){
			var scene = tour.scenes[sceneId];
			config[k] = scene[k];
		}
		config.activeScene = sceneId;
	}
}

function processOptions() {
    for(var key in config) {
        switch(key) {
            case 'logo':
                if(config[key] == 'yes') {
                    document.getElementById('pannellum_logo').style.display = 'inline';
                }
                break;
            
            case 'title':
                document.getElementById('title_box').innerHTML = config[key];
                break;
            
            case 'author':
                document.getElementById('author_box').innerHTML = 'by ' + config[key];
                break;
            
            case 'popout':
                if(config[key] == 'yes') {
                    document.getElementById('fullwindowtoggle_button').classList.add('fullwindowtoggle_button_active');
                    popoutMode = true;
                }
                break;
            
            case 'fallback':
                document.getElementById('nocanvas').innerHTML = '<p>Your browser does not support WebGL.<br><a href="' + config[key] + '" target="_blank">Click here to view this panorama in an alternative viewer.</a></p>';
                break;
            
            case 'preview':
                document.body.style.backgroundImage = "url('" + config[key] + "')";
                document.body.style.backgroundSize = "auto";
                break;
            
            case 'hfov':
                setHfov(config[key]);
                break;
            
            case 'pitch':
                pitch = config[key];
                // Keep pitch within bounds
                if(pitch < -85) {
                    pitch = -85;
                } else if(pitch > 85) {
                    pitch = 85;
                }
                break;
            
            case 'yaw':
                yaw = config[key];
                break;
            
            case 'haov':
                haov = config[key];
                break;
            
            case 'vaov':
                vaov = config[key];
                break;
            
            case 'voffset':
                voffset = config[key];
                break;
            
            case 'autoload':
                if(config[key] == 'yes') {
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
                if(config[key] == 'cw' || config[key] == 'ccw') {
                    autoRotate = config[key];
                }
                break;
            
            case 'license':
                var licenseType;
                switch(config[key]) {
                    case 0: licenseType = 'by'; break;
                    case 1: licenseType = 'by-sa'; break;
                    case 2: licenseType = 'by-nd'; break;
                    case 3: licenseType = 'by-nc'; break;
                    case 4: licenseType = 'by-nc-sa'; break;
                    case 5: licenseType = 'by-nc-nd'; break;
                }
                document.getElementById('author_box').innerHTML += '<a rel="license" target="_blank" href="//creativecommons.org/licenses/' + licenseType + '/3.0/"><div id="license"></div></a>';
                var license = document.getElementById('license').style;
                license.backgroundImage = "url('//i.creativecommons.org/l/" + licenseType + "/3.0/80x15.png')";
                license.width = '80px';
                break;
            
            case 'type':
                panoType = config[key];
                break;
            
            case 'panorama':
                panoSrc = config[key];
        }
    }
    
    // Create hot spots
    createHotSpots();
}

function toggleFullWindow() {
    if(loaded && !error) {
        if(!fullWindowActive && !popoutMode) {
            try {
                var page = document.getElementById('page');
                if (page.requestFullscreen) {
                    page.requestFullscreen();
                } else if (page.mozRequestFullScreen) {
                    page.mozRequestFullScreen();
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
            }
            
            if(popoutMode) {
                window.close();
            }
        }
    }
}

function onFullScreenChange() {
    if(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen) {
        document.getElementById('fullwindowtoggle_button').classList.add('fullwindowtoggle_button_active');
        fullWindowActive = true;
    } else {
        document.getElementById('fullwindowtoggle_button').classList.remove('fullwindowtoggle_button_active');
        fullWindowActive = false;
    }
}

function fullScreenError() {
    if(!popoutMode) {
        // Open new window instead
        var windowspecs = 'width=' + screen.width + ',height=' + screen.height + ',left=0,top=0';
        var windowlocation = window.location.href + '&popout=yes';
        windowlocation += '&popoutautoload';
        window.open(windowlocation,null,windowspecs)
    } else {
        window.close();
    }
}

function zoomIn(amount) {
    if(loaded) {
        setHfov(hfov -= amount);
    }
}

function zoomOut(amount) {
    if(loaded) {
        setHfov(hfov += amount);
    }
}

function setHfov(i) {
    // Keep field of view within bounds
    if(i < 40) {
        hfov = 40;
    } else if(i > 100) {
        hfov = 100;
    } else {
        hfov = i;
    }
    
    animate();
}

function load() {
    document.getElementById('load_button').style.display = 'none';
    document.getElementById('load_box').style.display = 'inline';
    init();
    animate();
}

function loadScene(sceneId){
	loaded = false;
	// Destroy hotspots from previous scene
	destroyHotSpots();
	// Create the new config for the scene
	loadSceneData(sceneId);
	// Reload scene
	processOptions();
	load();
}
