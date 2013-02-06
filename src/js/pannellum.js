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

var config, popoutmode = false, hfov = 70, pitch = 0, yaw = 0, haov = 360,
    vaov = 180, voffset = 0, renderer, isUserInteracting = false,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0, onMouseDownYaw = 0,
    onMouseDownPitch = 0, phi = 0, theta = 0, keysDown = new Array(10),
    fullWindowActive = false, loaded = false, error = false, isTimedOut = false,
    about_box = document.getElementById('about_box'), autoRotate = false,
    canvas = document.getElementById('canvas');

if(getURLParameter('config')) {
    // Get JSON configuration file
    var request = new XMLHttpRequest();
    request.open("GET", getURLParameter('config'), false);
    request.send();
    config = JSON.parse(request.responseText);
    
    // Create hot spots
    createHotSpots();
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

if(getURLParameter('hfov')) {
	hfov = parseFloat(getURLParameter('hfov'));
	
	// keep field of view within bounds
	if(hfov < 40) {
		hfov = 40;
	} else if(hfov > 100) {
		hfov = 100;
	}
}

if(getURLParameter('pitch')) {
	pitch = parseFloat(getURLParameter('pitch'));
	
	// keep pitch within bounds
	if(pitch < -85) {
		pitch = -85;
	} else if(pitch > 85) {
		pitch = 85;
	}
}

if(getURLParameter('yaw')) {
	yaw = parseFloat(getURLParameter('yaw'));
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

if(getURLParameter('autorotate') == 'cw') {
    autoRotate = 'cw';
}

if(getURLParameter('autorotate') == 'ccw') {
    autoRotate = 'ccw';
}

function init() {
	var panotype = getURLParameter('panotype');
	if( panotype == '' ) panotype = "equirectangular";
	var panoimage;
  
	if( panotype != "cubemap" ){
        panoimage = new Image();
    }else{
        panoimage = new Array();
        for( var i=0; i < 6; i++ )panoimage.push( new Image() );
    }

    function finishloadimage() {
		try {
			renderer = new libpannellum.renderer(canvas, panoimage, panotype);
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
	}
	
	//set event handlers
    if( panotype != "cubemap" ){
        panoimage.onload = finishloadimage;
        panoimage.src = getURLParameter('panorama');
    }else{
        //quick loading counter for syncronous loading
        var itemstoload = 6;
        function loadCounter(){
            itemstoload --;
            if( itemstoload == 0 ){
                finishloadimage();
            }
        }
        //set the onload and src
        for(var i=0; i < panoimage.length; i++){
            panoimage[i].onload = loadCounter;
            panoimage[i].src = getURLParameter('panorama' + i.toString());
        }
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
	// override default action
	event.preventDefault();
		
	yaw = (onPointerDownPointerX - event.targetTouches[0].clientX) * 0.1 + onPointerDownYaw;
	pitch = (event.targetTouches[0].clientY - onPointerDownPointerY) * 0.1 + onPointerDownPitch;
	animate();
}

function onDocumentTouchEnd(event) {
	// do nothing for now
}

function onDocumentMouseWheel(event) {
	event.preventDefault();
	if (hfov >= 35 && hfov <= 105) {
		if (event.wheelDeltaY) {
			// WebKit
			hfov -= event.wheelDeltaY * 0.05;
		} else if (event.wheelDelta) {
			// Opera / Explorer 9
			hfov -= event.wheelDelta * 0.05;
		} else if (event.detail) {
			// Firefox
			hfov += event.detail * 1.5;
		}
	}
	
	// keep field of view within bounds
	if(hfov < 35) {
		hfov = 35;
	} else if(hfov > 105) {
		hfov = 105;
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
		pitch += 1;
		animate();
	}
	
	// if down arrow or "s" is down
	if(keysDown[3] == true || keysDown[7] == true) {
		// pan down
		pitch -= 1;
		animate();
	}
	
	// if left arrow or "a" is down
	if(keysDown[4] == true || keysDown[8] == true) {
		// pan left
		yaw -= 1;
		animate();
	}
	
	// if right arrow or "d" is down
	if(keysDown[5] == true || keysDown[9] == true) {
		// pan right
		yaw += 1;
		animate();
	}
	
	// if clockwise auto-rotate
	if(autoRotate == 'cw') {
		// pan left
		yaw -= .25;
		animate();
	}
	
	// if counter-clockwise auto-rotate
	if(autoRotate == 'ccw') {
		// pan right
		yaw += .25;
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
		if(yaw > 180) {
		    yaw -= 360;
		} else if(yaw < -180) {
		    yaw += 360;
		}
		
		pitch = Math.max(-85,Math.min(85,pitch));
		renderer.render(pitch * Math.PI / 180,yaw * Math.PI / 180,hfov * Math.PI / 180);
		
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

function createHotSpots() {
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
		windowlocation += '&popoutautoload=yes';
		window.open(windowlocation,null,windowspecs)
	} else {
		window.close();
	}
}

function zoomIn(amount) {
	if(loaded) {
		if( hfov >= 40 ) {
			hfov -= amount;
			render();
		}
		// keep field of view within bounds
		if(hfov < 40) {
			hfov = 40;
		} else if(hfov > 100) {
			hfov = 100;
		}
	}
}

function zoomOut(amount) {
	if(loaded) {
		if(hfov <= 100) {
			hfov += amount;
			render();
		}
		// keep field of view within bounds
		if(hfov < 40) {
			hfov = 40;
		} else if(hfov > 100) {
			hfov = 100;
		}
	}
}

function load() {
	document.getElementById('load_button').style.display = 'none';
	document.getElementById('load_box').style.display = 'inline';
	init();
	animate();
}
