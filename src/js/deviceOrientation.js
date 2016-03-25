/*
 * Device Orientation Handler for Pannellum
 * Copyright (c) 2016 Markus Breunig
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

/**
 * Handler for device orientation events.
 * The events will be handled and converted to Yaw and Pitch.
 * 
 * @param fctAvailability(bool bAvailable) is called as soon as the availability was determined
 * 
 * Availability will be true, wenn device orientation is available and values are absolute in earth frame.
 * 
 * Yaw: -180,180 (180 is north)
 * Pitch: -90,90 (90 bottom, -90 top)
 */
var DeviceOrientationHandler = function( fctAvailability ) {
	
	var fctAvailability = fctAvailability;
	
	var _this = this;
	
	var data = null;
	var availabilityCheckTryCount = 0;
	var availabilityCheckInterval = null;
	
	var degtorad = Math.PI / 180; // Degree-to-Radian conversion
	
	/**
	 * Get raw data as returned by event
	 */
	this.GetRaw = function() {
		return data;
	}
	
	/**
	 * Get the yaw of the last updated device orientation.
	 * @return Pitch [-360,360) 
	 */
	this.GetYaw = function() {
		// source: http://w3c.github.io/deviceorientation/spec-source-orientation.html

		var _x = data.beta  ? data.beta  * degtorad : 0; // beta value
		var _y = data.gamma ? data.gamma * degtorad : 0; // gamma value
		var _z = data.alpha ? data.alpha * degtorad : 0; // alpha value

		var cX = Math.cos( _x );
		var cY = Math.cos( _y );
		var cZ = Math.cos( _z );
		var sX = Math.sin( _x );
		var sY = Math.sin( _y );
		var sZ = Math.sin( _z );

		// Calculate Vx and Vy components
		var Vx = - cZ * sY - sZ * sX * cY;
		var Vy = - sZ * sY + cZ * sX * cY;

		// Calculate compass heading
		var compassHeading = Math.atan( Vx / Vy );

		// Convert compass heading to use whole unit circle
		if( Vy < 0 ) {
			compassHeading += Math.PI;
		} else if( Vx < 0 ) {
			compassHeading += 2 * Math.PI;
		}
		
		// convert range  to [-PI,PI]
		compassHeading -= Math.PI;

		return compassHeading / degtorad; // Compass Heading (in degrees)
	}

	/**
	 * Get the pitch of the last updated device orientation.
	 * @return Pitch [-90,90) 
	 */
	this.GetPitch = function() {
		var _x = data.beta  ? data.beta  * degtorad : 0; // beta value
		var _y = data.gamma ? data.gamma * degtorad : 0; // gamma value
		var _z = data.alpha ? data.alpha * degtorad : 0; // alpha value
		
		var pitch = Math.asin(-Math.cos(_x)*Math.cos(_y));
		
		return pitch / degtorad;
	}
	
	this.UpdateOrientation = function(e) {
		data = e;
	}
	
	/**
	 * This function is called to check if the device orientation data was provided
	 * and notifies the client about the availability.
	 */
	this.CheckAvailability = function() {
	    if(data !== null && data.alpha !== null && data.absolute === true){
	        // Clear interval
	        clearInterval(availabilityCheckInterval);
	        availabilityCheckInterval = null;
	        fctAvailability(true);
	    }else{
	        availabilityCheckTryCount++;
	        if(availabilityCheckTryCount === 10) {
	            // Clear interval
	            clearInterval(availabilityCheckInterval);
	            fctAvailability(false);
	        }
	    }
	}
	
	window.addEventListener('deviceorientation', function(e) { _this.UpdateOrientation(e); } );
	
	availabilityCheckInterval = window.setInterval(function() { _this.CheckAvailability(); }, 200 );
}
