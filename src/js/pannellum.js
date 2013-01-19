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

try {
	document.addEventListener('contextmenu',onRightClick, false);
} catch(event) {
	// Lack of "about" display is not a big deal
}

if(getURLParameter('logo') == 'yes') {
	document.getElementById('pannellum_logo').style.display = 'inline';
}

if(getURLParameter('title')) {
	document.getElementById('title_box').innerHTML = getURLParameter('title');
}

if(getURLParameter('author')) {
	document.getElementById('author_box').innerHTML = 'by ' + getURLParameter('author');
}

if(getURLParameter('license')) {
	var licenseType;
	switch(parseInt(getURLParameter('license'))) {
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
}

var popoutmode = false;

if(getURLParameter('popout') == 'yes') {
	document.getElementById('fullwindowtoggle_button').classList.add('fullwindowtoggle_button_active');
	popoutmode = true;
}

if(getURLParameter('fallback')) {
	document.getElementById('nocanvas').innerHTML = '<p>Your browser does not support WebGL.<br><a href="' + getURLParameter('fallback') + '" target="_blank">Click here to view this panorama in an alternative viewer.</a></p>';
}

if(getURLParameter('preview')) {
	document.body.style.backgroundImage = "url('" + getURLParameter('preview') + "')";
	document.body.style.backgroundSize = "auto";
}

var fov = 70, lat = 0, lon = 0, haov = 360, vaov = 180, voffset = 0;
if(getURLParameter('fov')) {
	fov = parseFloat(getURLParameter('fov'));
	
	// keep field of view within bounds
	if(fov < 40) {
		fov = 40;
	} else if(fov > 100) {
		fov = 100;
	}
}
if(getURLParameter('lat')) {
	lat = parseFloat(getURLParameter('lat'));
	
	// keep lat within bounds
	if(lat < -85) {
		lat = -85;
	} else if(lat > 85) {
		lat = 85;
	}
}
if(getURLParameter('lon')) {
	lon = parseFloat(getURLParameter('lon'));
}
if(getURLParameter('haov')) {
	haov = parseFloat(getURLParameter('haov'));
}
if(getURLParameter('vaov')) {
	vaov = parseFloat(getURLParameter('vaov'));
}
if(getURLParameter('voffset')) {
    voffset = parseFloat(getURLParameter('voffset'));
}

var camera, scene, renderer, renderGL;

var texture_placeholder,
isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
onMouseDownLon = 0, onMouseDownLat = 0,
phi = 0, theta = 0;

var keysDown = new Array(10);

var fullWindowActive = false;
var loaded = false;
var error = false;
var isTimedOut = false;

var about_box = document.getElementById('about_box');

if(getURLParameter('autoload') == 'yes' || getURLParameter('popoutautoload') == 'yes') {
	if(getURLParameter('popoutautoload') != 'yes') {
		// show loading box
		document.getElementById('load_box').style.display = 'inline';
	}
	// initialize
	init();
	animate();
} else {
	// show load button
	document.getElementById('load_button').style.display = 'table';
}

var autoRotate = false;

if(getURLParameter('autorotate') == 'cw') {
    autoRotate = 'cw';
}
if(getURLParameter('autorotate') == 'ccw') {
    autoRotate = 'ccw';
}

var canvas = document.getElementById('canvas');

function init() {
	var panoimage = new Image()
	panoimage.onload = function() {
		try {
			renderer = new libpannellum.renderer(canvas, panoimage);
		} catch (event) {
			// show error message if WebGL is not supported
			anError();
		}
		
		document.addEventListener('mousedown',onDocumentMouseDown,false);
		document.addEventListener('mousemove',onDocumentMouseMove,false);
		document.addEventListener('mouseup',onDocumentMouseUp,false);
		document.addEventListener('mousewheel',onDocumentMouseWheel,false);
		document.addEventListener('DOMMouseScroll',onDocumentMouseWheel,false);
		document.addEventListener('onresize',onDocumentResize,false);
		document.addEventListener('mozfullscreenchange',onFullScreenChange,false);
		document.addEventListener('webkitfullscreenchange',onFullScreenChange,false);
		document.addEventListener('fullscreenchange',onFullScreenChange,false);
		document.addEventListener('mozfullscreenerror',fullScreenError,false);
		document.addEventListener('webkitfullscreenerror',fullScreenError,false);
		document.addEventListener('fullscreenerror',fullScreenError,false);
		window.addEventListener('resize',onDocumentResize,false);
		document.addEventListener('keydown',onDocumentKeyPress,false);
		document.addEventListener('keyup',onDocumentKeyUp,false);
		window.addEventListener('blur',clearKeys,false);
		document.addEventListener('mouseout',onDocumentMouseUp,false);
		document.addEventListener('touchstart',onDocumentTouchStart,false);
		document.addEventListener('touchmove',onDocumentTouchMove,false);
		document.addEventListener('touchend',onDocumentTouchEnd,false);
		
		renderInit();
		var t=setTimeout('isTimedOut = true',500);
		
		setInterval('keyRepeat()',10);
	};
	panoimage.src = getURLParameter('panorama');
	
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
	onRightClick.t1 = setTimeout(function(){document.getElementById('about').style.opacity = 0;},2000);
	onRightClick.t2 = setTimeout(function(){document.getElementById('about').style.display = 'none';},2500);
	event.preventDefault();
}

function onDocumentMouseDown(event) {
	// override default action
	event.preventDefault();
	// but not all of it
	window.focus();
	
	// turn off auto-rotation if enabled
	autoRotate = false;
	
	isUserInteracting = true;
	
	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;
	
	onPointerDownLon = lon;
	onPointerDownLat = lat;	
	
	document.getElementById('page').className = 'grabbing';
}

function onDocumentMouseMove(event) {
	if (isUserInteracting) {		
		lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
		lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
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
	
	onPointerDownLon = lon;
	onPointerDownLat = lat;
}

function onDocumentTouchMove(event) {
	// override default action
	event.preventDefault();
		
	lon = (onPointerDownPointerX - event.targetTouches[0].clientX) * 0.1 + onPointerDownLon;
	lat = (event.targetTouches[0].clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
	animate();
}

function onDocumentTouchEnd(event) {
	// do nothing for now
}

function onDocumentMouseWheel(event) {
	event.preventDefault();
	if (fov >= 35 && fov <= 105) {
		if (event.wheelDeltaY) {
			// WebKit
			fov -= event.wheelDeltaY * 0.05;
		} else if (event.wheelDelta) {
			// Opera / Explorer 9
			fov -= event.wheelDelta * 0.05;
		} else if (event.detail) {
			// Firefox
			fov += event.detail * 1.5;
		}
	}
	
	// keep field of view within bounds
	if(fov < 35) {
		fov = 35;
	} else if(fov > 105) {
		fov = 105;
	}
	render();
}

function onDocumentKeyPress(event) {
	// override default action
	event.preventDefault();
	
	// turn off auto-rotation if enabled
	autoRotate = false;
	
	// record key pressed
	keynumber = event.keycode;
	if(event.which) {
		keynumber = event.which;
	}
	
	// if minus key is pressed
	if(keynumber == 109 || keynumber == 189 || keynumber == 17) {
		keysDown[0] = true;
	}
	
	// if plus key is pressed
	if(keynumber == 107 || keynumber == 187 || keynumber == 16) {
		keysDown[1] = true;
	}
	
	// if escape key is pressed
	if(keynumber == 27) {
		// if in full window / popout mode
		if(fullWindowActive == true || popoutmode == true) {
			toggleFullWindow();
		}
	}
	
	// if up arrow is pressed
	if(keynumber == 38) {
		keysDown[2] = true;
	}
	// if "w" is pressed
	if(keynumber == 87) {
		keysDown[6] = true;
	}
	
	// if down arrow is pressed
	if(keynumber == 40) {
		keysDown[3] = true;
	}
	// if "s" is pressed
	if(keynumber == 83) {
		keysDown[7] = true;
	}
	
	// if left arrow is pressed
	if(keynumber == 37) {
		keysDown[4] = true;
	}
	// if "a" is pressed
	if(keynumber == 65) {
		keysDown[8] = true;
	}
	
	// if right arrow is pressed
	if(keynumber == 39) {
		keysDown[5] = true;
	}
	// if "d" is pressed
	if(keynumber == 68) {
		keysDown[9] = true;
	}
}

function clearKeys() {
	for(i=0;i<10;i++) {
		keysDown[i] = false;
	}
}

function onDocumentKeyUp(event) {
	// override default action
	event.preventDefault();
	
	// record key released
	keynumber = event.keycode;
	if(event.which) {
		keynumber = event.which;
	}
	
	// if minus key is released
	if(keynumber == 109 || keynumber == 189 || keynumber == 17) {
		keysDown[0] = false;
	}
	
	// if plus key is released
	if(keynumber == 107 || keynumber == 187 || keynumber == 16) {
		keysDown[1] = false;
	}
	
	// if up arrow is released
	if(keynumber == 38) {
		keysDown[2] = false;
	}
	// if "w" is released
	if(keynumber == 87) {
		keysDown[6] = false;
	}
	
	// if down arrow is released
	if(keynumber == 40) {
		keysDown[3] = false;
	}
	// if "s" is released
	if(keynumber == 83) {
		keysDown[7] = false;
	}
	
	// if left arrow is released
	if(keynumber == 37) {
		//alert('left arrow released');
		keysDown[4] = false;
	}
	// if "a" is released
	if(keynumber == 65) {
		keysDown[8] = false;
	}
	
	// if right arrow is released
	if(keynumber == 39) {
		keysDown[5] = false;
	}
	// if "d" is released
	if(keynumber == 68) {
		keysDown[9] = false;
	}
}

function keyRepeat() {
	// if minus key is down
	if(keysDown[0] == true) {
		zoomOut(1);
	}
	
	// if plus key is down
	if(keysDown[1] == true) {
		zoomIn(1);
	}
	
	// if up arrow or "w" is down
	if(keysDown[2] == true || keysDown[6] == true) {
		// pan up
		lat += 1;
		animate();
	}
	
	// if down arrow or "s" is down
	if(keysDown[3] == true || keysDown[7] == true) {
		// pan down
		lat -= 1;
		animate();
	}
	
	// if left arrow or "a" is down
	if(keysDown[4] == true || keysDown[8] == true) {
		// pan left
		lon -= 1;
		animate();
	}
	
	// if right arrow or "d" is down
	if(keysDown[5] == true || keysDown[9] == true) {
		// pan right
		lon += 1;
		animate();
	}
	
	// if clockwise auto-rotate
	if(autoRotate == 'cw') {
		// pan left
		lon -= .25;
		animate();
	}
	
	// if counter-clockwise auto-rotate
	if(autoRotate == 'ccw') {
		// pan right
		lon += .25;
		animate();
	}
}

function onDocumentResize() {
	// reset panorama renderer
	try {
		renderInit();
		
		// Kludge to deal with WebKit regression: https://bugs.webkit.org/show_bug.cgi?id=93525
		onFullScreenChange();
	} catch(event) {
		// panorama not loaded
	}
}

function animate() {
	render();
	
	if(isUserInteracting) {
		requestAnimationFrame(animate);
	}
}

function render() {
	try {
		if(lon > 180) {
		    lon -= 360;
		} else if(lon < -180) {
		    lon += 360;
		}
		
		lat = Math.max(-85,Math.min(85,lat));
		renderer.render(lat * Math.PI / 180,lon * Math.PI / 180,fov * Math.PI / 180);
		
		renderHotSpots();
	} catch(event) {
		// panorama not loaded
	}
}

function renderInit() {
	try {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		renderer.init(haov * Math.PI / 180,vaov * Math.PI / 180,voffset * Math.PI / 180);
		
		render();
		
		if(!isTimedOut) {
			requestAnimationFrame(renderInit);
		} else {
			// hide loading display
			document.getElementById('load_box').style.display = 'none';
			loaded = true;
		}
	} catch(event) {
		// panorama not loaded
		
		// display error if there is a bad texture
		if(event == "bad texture") {
			anError();
		}
	}
}

var hotspots = new Array();
//hotspots[0] = new hotspot(10, 20);
//hotspots[1] = new hotspot(10, -30);
function hotspot(lat, lon) {
    var div = document.createElement('div');
    div.setAttribute('class', 'hotspot');
    document.getElementById('page').appendChild(div);
    this.div = div;
    this.lat = lat;
    this.lon = lon;
}

function renderHotSpots() {
	hotspots.forEach(function(hs) {
	    var z = Math.sin(hs.lat * Math.PI / 180) * Math.sin(lat * Math.PI /
	        180) + Math.cos(hs.lat * Math.PI / 180) * Math.cos((hs.lon + lon) *
	        Math.PI / 180) * Math.cos(lat * Math.PI / 180);
    	if((hs.lon <= 90 && hs.lon > -90 && z <= 0) ||
    	  (hs.lon > 90 || hs.lon <= -90 && z <= 0)) {
	        hs.div.style.display = 'none';
	    } else {
    	    hs.div.style.display = 'inline';
    	    hs.div.style.top = -canvas.height / Math.tan(fov * Math.PI / 360) *
    	        (Math.sin(hs.lat * Math.PI / 180) * Math.cos(lat * Math.PI /
    	        180) - Math.cos(hs.lat * Math.PI / 180) * Math.cos((hs.lon +
    	        lon) * Math.PI / 180) * Math.sin(lat * Math.PI / 180)) / z /
    	        2 + canvas.height / 2 - 10 + 'px';
    	    hs.div.style.left = -canvas.height / Math.tan(fov * Math.PI / 360) *
    	        Math.sin((hs.lon + lon) * Math.PI / 180) * Math.cos(hs.lat *
    	        Math.PI / 180) / z / 2 + canvas.width / 2 - 10 + 'px';
    	}
	});
}

function getURLParameter(name) {
	name = name.replace(/[\[]/,'\\\[').replace(/[\]]/,'\\\]');
	var regexS = '[\\?&]'+name+'=([^&#]*)';
	var regex = new RegExp(regexS);
	var results = regex.exec(unescape(window.location.href))
	if(results == null) {
		return '';
	} else {
		return results[1];
	}
}

function toggleFullWindow() {
	if(loaded && !error) {
		if(!fullWindowActive && !popoutmode) {
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
			
			if(getURLParameter('popout') == 'yes') {
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
	if(getURLParameter('popout') != 'yes') {
		// open new window instead
		var windowspecs = 'width=' + screen.width + ',height=' + screen.height + ',left=0,top=0';
		var windowlocation = window.location.href + '&popout=yes';
		try {
			camera.aspect = window.innerWidth / window.innerHeight;
			windowlocation += '&popoutautoload=yes';
		} catch(event) {
			// panorama not loaded
		}
		window.open(windowlocation,null,windowspecs)
	} else {
		window.close();
	}
}

function zoomIn(amount) {
	if(loaded) {
		if( fov >= 40 ) {
			fov -= amount;
			render();
		}
		// keep field of view within bounds
		if(fov < 40) {
			fov = 40;
		} else if(fov > 100) {
			fov = 100;
		}
	}
}

function zoomOut(amount) {
	if(loaded) {
		if(fov <= 100) {
			fov += amount;
			render();
		}
		// keep field of view within bounds
		if(fov < 40) {
			fov = 40;
		} else if(fov > 100) {
			fov = 100;
		}
	}
}

function load() {
	document.getElementById('load_button').style.display = 'none';
	document.getElementById('load_box').style.display = 'inline';
	init();
	animate();
}
