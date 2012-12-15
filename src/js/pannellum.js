/*
 * Pannellum - An HTML5 based Panorama Viewer
 * Copyright (c) 2011-2012 Matthew Petroff
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

var fov = 70, lat = 0, lon = 0;
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
	if(fov < -85) {
		fov = -85;
	} else if(fov > 85) {
		fov = 85;
	}
}
if(getURLParameter('lon')) {
	lon = parseFloat(getURLParameter('lon'));
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

function init() {
	var container, mesh;
	
	container = document.getElementById('container');
	
	camera = new THREE.Camera(fov,window.innerWidth / window.innerHeight,1,1100);
	
	scene = new THREE.Scene();
	
	var panoimage = new Image(),panotexture = new THREE.Texture(panoimage);
	panoimage.onload = function() {
		panotexture.needsUpdate = true;
		mesh = new THREE.Mesh(new THREE.Sphere(500,60,40), new THREE.MeshBasicMaterial({map:panotexture}));
		mesh.scale.x = -1;
		try {
			scene.addObject(mesh);
		} catch (event) {
			// show error message if canvas is not supported
			anError();
		}
		
		try {
			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth,window.innerHeight);
			renderer.initWebGLObjects(scene);
		} catch (event) {
			// show error message if WebGL is not supported
			anError();
		}
		
		container.appendChild(renderer.domElement);
		
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
	camera.projectionMatrix = THREE.Matrix4.makePerspective(fov,window.innerWidth / window.innerHeight,1,1100);
	render();
}

function onDocumentKeyPress(event) {
	// override default action
	event.preventDefault();
	
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
}

function onDocumentResize() {
	// reset panorama renderer
	try {
		camera.aspect = window.innerWidth / window.innerHeight;
		renderer.setSize(window.innerWidth,window.innerHeight);
		camera.projectionMatrix = THREE.Matrix4.makePerspective(fov,window.innerWidth / window.innerHeight,1,1100);
		render();
		
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
		lat = Math.max(-85,Math.min(85,lat));
		phi = (90 - lat) * Math.PI / 180;
		theta = lon * Math.PI / 180;
		
		camera.target.position.x = 500 * Math.sin(phi) * Math.cos(theta);
		camera.target.position.y = 500 * Math.cos(phi);
		camera.target.position.z = 500 * Math.sin(phi) * Math.sin(theta);
		
		renderer.render(scene,camera);
	} catch(event) {
		// panorama not loaded
	}
}

function renderInit() {
	try {
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
			camera.projectionMatrix = THREE.Matrix4.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
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
			camera.projectionMatrix = THREE.Matrix4.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
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
