/*
 * pannellum - an HTML5 based panorama viewer
 * Copyright (C) 2011-2012 Matthew Petroff
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

if(getURLParameter('logo') == 'yes')
{
	document.getElementById('pannellum_logo').style.display = 'inline';
}

if(getURLParameter('title'))
{
	document.getElementById('title_box').innerHTML = getURLParameter('title');
}

if(getURLParameter('author'))
{
	document.getElementById('author_box').innerHTML = 'by ' + getURLParameter('author');
}
var popoutmode = false;
if(getURLParameter('popout') == 'yes')
{
	document.getElementById('fullwindowtoggle_button').id = 'fullwindowtoggle_button_active';
	popoutmode = true;
}

var camera, scene, renderer, renderGL;

var fov = 70,
texture_placeholder,
isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;

var fullWindowActive = false;

var isTimedOut = false;

var about_box = document.getElementById('about_box');

if(getURLParameter('autoload') == 'yes' || getURLParameter('popoutautoload') == 'yes')
{
	if(getURLParameter('popoutautoload') != 'yes')
	{
		// show loading box
		document.getElementById('load_box').load_box.style.display = 'inline';
	}
	// initialize
	init();
	animate();
}
else
{
	// show load button
	var load_button = document.getElementById('load_button');
	load_button.style.display = 'table';
}

function init()
{
	var container, mesh;
	
	container = document.getElementById('container');
	
	camera = new THREE.Camera(fov,window.innerWidth / window.innerHeight,1,1100);
	
	scene = new THREE.Scene();
	
	var panoimage = new Image(),panotexture = new THREE.Texture(panoimage);
	panoimage.onload = function()
	{
		//var panotexture = new THREE.Texture(panoimage);
		
		panotexture.needsUpdate = true;
		mesh = new THREE.Mesh(new THREE.Sphere(500,60,40), new THREE.MeshBasicMaterial({map:panotexture}));
		mesh.scale.x = -1;
		try
		{
			scene.addObject(mesh);
		}
		catch (event)
		{
			// show error message if canvas is not supported
			document.getElementById('nocanvas').style.display = 'table';
		}
		
		// try to use WebGL, else fallback to 2D canvas
		try
		{
			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth,window.innerHeight);
			renderer.initWebGLObjects(scene);
		}
		catch (event)
		{
			renderer = new THREE.CanvasRenderer();
			renderer.setSize(window.innerWidth,window.innerHeight);
		}
		
		container.appendChild(renderer.domElement);
		
		document.addEventListener('mousedown',onDocumentMouseDown,false);
		document.addEventListener('mousemove',onDocumentMouseMove,false);
		document.addEventListener('mouseup',onDocumentMouseUp,false);
		document.addEventListener('mousewheel',onDocumentMouseWheel,false);
		document.addEventListener('DOMMouseScroll',onDocumentMouseWheel,false);
		document.addEventListener('onresize',onDocumentResize,false);
		
		document.onkeydown = onDocumentKeyPress;
		
		renderinit();
		var t=setTimeout("isTimedOut = true",500);
	};
	panoimage.src = getURLParameter('panorama');
}

function onDocumentMouseDown(event)
{
	event.preventDefault();
	
	isUserInteracting = true;
	
	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;
	
	onPointerDownLon = lon;
	onPointerDownLat = lat;	
}

function onDocumentMouseMove(event)
{
	if (isUserInteracting)
	{		
		lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
		lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
		animate();	
	}
}

function onDocumentMouseUp(event)
{
	isUserInteracting = false;
}

function onDocumentMouseWheel(event)
{
	if (fov >= 35 && fov <= 105)
	{	
		// WebKit
		if (event.wheelDeltaY)
		{
			fov -= event.wheelDeltaY * 0.05;
		}
		// Opera / Explorer 9
		else if (event.wheelDelta)
		{
			fov -= event.wheelDelta * 0.05;
		}
		// Firefox
		else if (event.detail)
		{
			fov += event.detail * 1.5;
		}
	}
	
	// keep field of view within bounds
	if(fov < 35)
	{
		fov = 35;
	}
	if(fov > 105)
	{
		fov = 105;
	}
	camera.projectionMatrix = THREE.Matrix4.makePerspective(fov,window.innerWidth / window.innerHeight,1,1100);
	render();
}

function onDocumentKeyPress (event)
{
	// record key pressed
	keynumber = event.keycode;
	if(event.which)
	{
		keynumber = event.which;
	}
	
	// if minus key is pressed
	if(keynumber == 109)
	{
		// zoom out
		if(fov <= 100)
		{
			fov += 5;
			camera.projectionMatrix = THREE.Matrix4.makePerspective(fov,window.innerWidth / window.innerHeight,1,1100);
			render();
		}
		// keep field of view within bounds
		if(fov < 40)
		{
			fov = 40;
		}
		if(fov > 100)
		{
			fov = 100;
		}
	}
	
	// if plus key is pressed
	if(keynumber == 107)
	{
		// zoom in
		if(fov >= 40)
		{
			fov -= 5;
			camera.projectionMatrix = THREE.Matrix4.makePerspective(fov,window.innerWidth / window.innerHeight,1,1100);
			render();
		}
		// keep field of view within bounds
		if(fov < 40)
		{
			fov = 40;
		}
		if(fov > 100)
		{
			fov = 100;
		}
	}
	
	// if in full window / popout mode
	if(fullWindowActive == true || popoutmode == true)
	{
		// if escape key is pressed
		if(keynumber == 27)
		{
			toggleFullWindow();
		}
	}
}

window.onresize = function(){onDocumentResize();};
function onDocumentResize()
{
	// reset panorama renderer
	try
	{
		camera.aspect = window.innerWidth / window.innerHeight;
		renderer.setSize(window.innerWidth,window.innerHeight);
		camera.projectionMatrix = THREE.Matrix4.makePerspective(fov,window.innerWidth / window.innerHeight,1,1100);
		render();
	}
	catch(event)
	{
		// panorama not loaded
	}
}

function animate()
{
	render();
	if(isUserInteracting)
	{
		requestAnimationFrame(animate);
	}
}

function render()
{
	try
	{
		lat = Math.max(-85,Math.min(85,lat));
		phi = (90 - lat) * Math.PI / 180;
		theta = lon * Math.PI / 180;
		
		camera.target.position.x = 500 * Math.sin(phi) * Math.cos(theta);
		camera.target.position.y = 500 * Math.cos(phi);
		camera.target.position.z = 500 * Math.sin(phi) * Math.sin(theta);
		
		renderer.render(scene,camera);
	}
	catch(event)
	{
		// panorama not loaded
	}
}

function renderinit()
{
	try
	{
		camera.target.x = 0;
		camera.target.y = 0;
		camera.target.z = 0;
		
		renderer.render(scene,camera);
		
		if(!isTimedOut)
		{
			requestAnimationFrame(renderinit);
		}
		else
		{
			// hide loading display
			document.getElementById('load_box').style.display = 'none';
		}
	}
	catch(event)
	{
		// panorama not loaded
	}
}

function getURLParameter(name)
{
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(unescape(window.location.href))
	if(results == null)
	{
		return "";
	}
	else
	{
		return results[1];
	}
}

function toggleFullWindow()
{
	if(fullWindowActive == false)
	{
		try
		{
			var page = document.getElementById('page');
			if (page.requestFullscreen) {
				page.requestFullscreen();
			} else if (page.mozRequestFullScreen) {
				page.mozRequestFullScreen();
			} else {
				page.webkitRequestFullScreen();
			}
			
			document.getElementById('fullwindowtoggle_button').id = 'fullwindowtoggle_button_active';
			fullWindowActive = true;
		}
		catch(event)
		{
			if(getURLParameter('popout') != 'yes')
			{
				// open new window instead
				var windowspecs = 'width=' + screen.width + ',height=' + screen.height + ',left=0,top=0';
				var windowlocation = window.location.href + '&popout=yes';
				try
				{
					camera.aspect = window.innerWidth / window.innerHeight;
					windowlocation += '&popoutautoload=yes';
				}
				catch(event)
				{
					// panorama not loaded
				}
				window.open(windowlocation,null,windowspecs)
			}
			else
			{
				window.close();
			}
		}
	}
	else
	{
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
		else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		}
		else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
		
		if(getURLParameter('popout') == 'yes') {
			window.close();
		}
		
		document.getElementById('fullwindowtoggle_button_active').id = 'fullwindowtoggle_button';
		fullWindowActive = false;
	}
}
