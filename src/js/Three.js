// Based on ThreeWebGL.js r40 - http://github.com/mrdoob/three.js
/*
The MIT License

Copyright (c) 2010-2011 three.js Authors. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/**
 * @author mr.doob / http://mrdoob.com/
 */

var THREE = THREE || {};

if ( ! window.Int32Array ) {

	window.Int32Array = Array;
	window.Float32Array = Array;

}
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Color = function ( hex ) {

	this.setHex( hex );

};

THREE.Color.prototype = {

	autoUpdate : true,

	/*copy : function ( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		this.hex = color.hex;
		this.__styleString = color.__styleString;

	},

	setRGB : function ( r, g, b ) {

		this.r = r;
		this.g = g;
		this.b = b;

		if ( this.autoUpdate ) {

			this.updateHex();
			this.updateStyleString();

		}

	},

	setHSV : function ( h, s, v ) {

		// based on MochiKit implementation by Bob Ippolito
		// h,s,v ranges are < 0.0 - 1.0 >

		this.h = h;
		this.s = s;
		this.v = v;
		
		var red, green, blue, i, f, p, q, t;

		if ( v == 0.0 ) {

			red = green = blue = 0;

		} else {

			i = Math.floor( h * 6 );
			f = ( h * 6 ) - i;
			p = v * ( 1 - s );
			q = v * ( 1 - ( s * f ) );
			t = v * ( 1 - ( s * ( 1 - f ) ) );

			switch ( i ) {

				case 1: red = q; green = v; blue = p; break;
				case 2: red = p; green = v; blue = t; break;
				case 3: red = p; green = q; blue = v; break;
				case 4: red = t; green = p; blue = v; break;
				case 5: red = v; green = p; blue = q; break;
				case 6: // fall through
				case 0: red = v; green = t; blue = p; break;

			}

		}

		this.r = red;
		this.g = green;
		this.b = blue;

		if ( this.autoUpdate ) {

			this.updateHex();
			this.updateStyleString();

		}

	},
	
	updateHSV : function () {
		
		// based on MochiKit implementation by Bob Ippolito

		this.h = 0;
		this.s = 0;
		this.v = 0;
		
		var max = Math.max( Math.max( this.r, this.g ), this.b );
		var min = Math.min( Math.min( this.r, this.g ), this.b );

		var hue;
		var saturation;
		var value = max;

		if ( min == max )	{

			hue = 0;
			saturation = 0;

		} else {

			var delta = ( max - min );
			saturation = delta / max;

			if ( this.r == max )	{

				hue = ( this.g - this.b ) / delta;

			} else if ( this.g == max ) {

				hue = 2 + ( ( this.b - this.r ) / delta );

			} else	{

				hue = 4 + ( ( this.r - this.g ) / delta );
			}

			hue /= 6;

			if ( hue < 0 ) {

				hue += 1;

			}
			
			if ( hue > 1 ) {

				hue -= 1;

			}

		}
		
		this.h = hue;
		this.s = saturation;
		this.v = value;

	},*/

	setHex : function ( hex ) {

		this.hex = ( ~~ hex ) & 0xffffff;

		if ( this.autoUpdate ) {

			this.updateRGB();
			this.updateStyleString();

		}

	},

	/*updateHex : function () {

		this.hex = ~~ ( this.r * 255 ) << 16 ^ ~~ ( this.g * 255 ) << 8 ^ ~~ ( this.b * 255 );

	},*/

	updateRGB : function () {

		this.r = ( this.hex >> 16 & 255 ) / 255;
		this.g = ( this.hex >> 8 & 255 ) / 255;
		this.b = ( this.hex & 255 ) / 255;

	},

	updateStyleString : function () {

		this.__styleString = 'rgb(' + ~~ ( this.r * 255 ) + ',' + ~~ ( this.g * 255 ) + ',' + ~~ ( this.b * 255 ) + ')';

	},

	clone : function () {

		return new THREE.Color( this.hex );

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 */

/*THREE.Vector2 = function ( x, y ) {

	this.set(

		x || 0,
		y || 0

	);

};

THREE.Vector2.prototype = {

	set : function ( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	},

	copy : function ( v ) {

		this.set(

			v.x,
			v.y

		);

		return this;

	},

	addSelf : function ( v ) {

		this.set(

			this.x + v.x,
			this.y + v.y

		);

		return this;

	},

	add : function ( v1, v2 ) {

		this.set(

			v1.x + v2.x,
			v1.y + v2.y

		);

		return this;

	},

	subSelf : function ( v ) {

		this.set(

			this.x - v.x,
			this.y - v.y

		);

		return this;

	},

	sub : function ( v1, v2 ) {

		this.set(

			v1.x - v2.x,
			v1.y - v2.y

		);

		return this;

	},

	multiplyScalar : function ( s ) {

		this.set(

			this.x * s,
			this.y * s

		);

		return this;

	},

	negate : function() {

		this.set(

			- this.x,
			- this.y

		);

		return this;

	},

	unit : function () {

		this.multiplyScalar( 1 / this.length() );

		return this;

	},

	length : function () {

		return Math.sqrt( this.lengthSq() );

	},

	lengthSq : function () {

		return this.x * this.x + this.y * this.y;

	},

	clone : function () {

		return new THREE.Vector2( this.x, this.y );

	}

};*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Vector3 = function ( x, y, z ) {

	this.set(

		x || 0,
		y || 0,
		z || 0

	);

};


THREE.Vector3.prototype = {

	set : function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	copy : function ( v ) {

		this.set(

			v.x,
			v.y,
			v.z

		);

		return this;

	},


	/*add : function ( a, b ) {

		this.set(

			a.x + b.x,
			a.y + b.y,
			a.z + b.z

		);

		return this;

	},
*/

	addSelf : function ( v ) {

		this.set(

			this.x + v.x,
			this.y + v.y,
			this.z + v.z

		);

		return this;

	},


/*	addScalar : function ( s ) {

		this.set(

			this.x + s,
			this.y + s,
			this.z + s

		);

		return this;

	},
*/

	sub : function ( a, b ) {

		this.set(

			a.x - b.x,
			a.y - b.y,
			a.z - b.z

		);

		return this;

	},

/*	subSelf : function ( v ) {

		this.set(

			this.x - v.x,
			this.y - v.y,
			this.z - v.z

		);

		return this;

	},
*/

	cross : function ( a, b ) {

		this.set(

			a.y * b.z - a.z * b.y,
			a.z * b.x - a.x * b.z,
			a.x * b.y - a.y * b.x

		);

		return this;

	},

	crossSelf : function ( v ) {

		var tx = this.x, ty = this.y, tz = this.z;

		this.set(

			ty * v.z - tz * v.y,
			tz * v.x - tx * v.z,
			tx * v.y - ty * v.x

		);

		return this;

	},

/*	multiply : function ( a, b ) {

		this.set(

			a.x * b.x,
			a.y * b.y,
			a.z * b.z

		);

		return this;

	},

	multiplySelf : function ( v ) {

		this.set(

			this.x * v.x,
			this.y * v.y,
			this.z * v.z

		);

		return this;

	},
*/
	multiplyScalar : function ( s ) {

		this.set(

			this.x * s,
			this.y * s,
			this.z * s

		);

		return this;

	},

/*	divideSelf : function ( v ) {

		this.set(

			this.x / v.x,
			this.y / v.y,
			this.z / v.z

		);

		return this;

	},
*/
	divideScalar : function ( s ) {

		this.set(

			this.x / s,
			this.y / s,
			this.z / s

		);

		return this;

	},

/*	negate : function () {

		this.set(

			- this.x,
			- this.y,
			- this.z

		);

		return this;

	},

	dot : function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	distanceTo : function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared : function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;

	},
*/
	length : function () {

		return Math.sqrt( this.lengthSq() );

	},

	lengthSq : function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

/*	lengthManhattan : function () {

		return this.x + this.y + this.z;

	},
*/
	normalize : function () {

		var l = this.length();

		l > 0 ? this.multiplyScalar( 1 / l ) : this.set( 0, 0, 0 );

		return this;

	},

/*	setPositionFromMatrix : function ( m ) {

		this.x = m.n14;
		this.y = m.n24;
		this.z = m.n34;

	},

	setRotationFromMatrix : function ( m ) {

		var cosY = Math.cos( this.y );

		this.y = Math.asin( m.n13 );

		if ( Math.abs( cosY ) > 0.00001 ) {

			this.x = Math.atan2( - m.n23 / cosY, m.n33 / cosY );
			this.z = Math.atan2( - m.n12 / cosY, m.n11 / cosY );

		} else {

			this.x = 0;
			this.z = Math.atan2( m.n21, m.n22 );

		}

	},

	setLength : function ( l ) {

		return this.normalize().multiplyScalar( l );

	},
*/
	isZero : function () {

		var almostZero = 0.0001;
		return ( Math.abs( this.x ) < almostZero ) && ( Math.abs( this.y ) < almostZero ) && ( Math.abs( this.z ) < almostZero );

	},

	clone : function () {

		return new THREE.Vector3( this.x, this.y, this.z );

	}

};
/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Vector4 = function ( x, y, z, w ) {

	this.set(

		x || 0,
		y || 0,
		z || 0,
		w || 1

	);

};

THREE.Vector4.prototype = {

	set : function ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	},

	copy : function ( v ) {

		this.set(

			v.x,
			v.y,
			v.z,
			v.w || 1.0

		);

		return this;

	},

/*	add : function ( v1, v2 ) {

		this.set(

			v1.x + v2.x,
			v1.y + v2.y,
			v1.z + v2.z,
			v1.w + v2.w

		);

		return this;

	},

	addSelf : function ( v ) {

		this.set(

			this.x + v.x,
			this.y + v.y,
			this.z + v.z,
			this.w + v.w

		);

		return this;

	},

	sub : function ( v1, v2 ) {

		this.set(

			v1.x - v2.x,
			v1.y - v2.y,
			v1.z - v2.z,
			v1.w - v2.w

		);

		return this;

	},

	subSelf : function ( v ) {

		this.set(

			this.x - v.x,
			this.y - v.y,
			this.z - v.z,
			this.w - v.w

		);

		return this;

	},

	multiplyScalar : function ( s ) {

		this.set(

			this.x * s,
			this.y * s,
			this.z * s,
			this.w * s

		);

		return this;

	},
*/
	divideScalar : function ( s ) {

		this.set(

			this.x / s,
			this.y / s,
			this.z / s,
			this.w / s

		);

		return this;

	}

/*	lerpSelf : function ( v, alpha ) {

		this.set(

			this.x + (v.x - this.x) * alpha,
			this.y + (v.y - this.y) * alpha,
			this.z + (v.z - this.z) * alpha,
			this.w + (v.w - this.w) * alpha

		);

	},

	clone : function () {

		return new THREE.Vector4( this.x, this.y, this.z, this.w );

	}
*/
};
/**
 * @author mr.doob / http://mrdoob.com/
 */
/*
THREE.Ray = function ( origin, direction ) {

	this.origin = origin || new THREE.Vector3();
	this.direction = direction || new THREE.Vector3();

}

THREE.Ray.prototype = {

	intersectScene : function ( scene ) {

		var i, l, object,
		objects = scene.objects,
		intersects = [];

		for ( i = 0, l = objects.length; i < l; i++ ) {

			object = objects[i];

			if ( object instanceof THREE.Mesh ) {

				intersects = intersects.concat( this.intersectObject( object ) );

			}

		}

		intersects.sort( function ( a, b ) { return a.distance - b.distance; } );

		return intersects;

	},

	intersectObject : function ( object ) {

		var f, fl, face, a, b, c, d, normal,
		dot, scalar,
		origin, direction,
		geometry = object.geometry,
		vertices = geometry.vertices,
		objMatrix,
		intersect, intersects = [],
		intersectPoint;

		for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

			face = geometry.faces[ f ];

			origin = this.origin.clone();
			direction = this.direction.clone();

			objMatrix = object.matrixWorld;

			a = objMatrix.multiplyVector3( vertices[ face.a ].position.clone() );
			b = objMatrix.multiplyVector3( vertices[ face.b ].position.clone() );
			c = objMatrix.multiplyVector3( vertices[ face.c ].position.clone() );
			d = face instanceof THREE.Face4 ? objMatrix.multiplyVector3( vertices[ face.d ].position.clone() ) : null;

			normal = object.matrixRotationWorld.multiplyVector3( face.normal.clone() );
			dot = direction.dot( normal );

			if ( object.doubleSided || ( object.flipSided ? dot > 0 : dot < 0 ) ) { // Math.abs( dot ) > 0.0001

				scalar = normal.dot( new THREE.Vector3().sub( a, origin ) ) / dot;
				intersectPoint = origin.addSelf( direction.multiplyScalar( scalar ) );

				if ( face instanceof THREE.Face3 ) {

					if ( pointInFace3( intersectPoint, a, b, c ) ) {

						intersect = {

							distance: this.origin.distanceTo( intersectPoint ),
							point: intersectPoint,
							face: face,
							object: object

						};

						intersects.push( intersect );

					}

				} else if ( face instanceof THREE.Face4 ) {

					if ( pointInFace3( intersectPoint, a, b, d ) || pointInFace3( intersectPoint, b, c, d ) ) {

						intersect = {

							distance: this.origin.distanceTo( intersectPoint ),
							point: intersectPoint,
							face: face,
							object: object

						};

						intersects.push( intersect );

					}

				}

			}

		}

		return intersects;

		// http://www.blackpawn.com/texts/pointinpoly/default.html

		function pointInFace3( p, a, b, c ) {

			var v0 = c.clone().subSelf( a ), v1 = b.clone().subSelf( a ), v2 = p.clone().subSelf( a ),
			dot00 = v0.dot( v0 ), dot01 = v0.dot( v1 ), dot02 = v0.dot( v2 ), dot11 = v1.dot( v1 ), dot12 = v1.dot( v2 ),

			invDenom = 1 / ( dot00 * dot11 - dot01 * dot01 ),
			u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom,
			v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

			return ( u > 0 ) && ( v > 0 ) && ( u + v < 1 );

		}

	}

};*/
/**
 * @author mr.doob / http://mrdoob.com/
 */
/*
THREE.Rectangle = function () {

	var _left, _top, _right, _bottom,
	_width, _height, _isEmpty = true;

	function resize() {

		_width = _right - _left;
		_height = _bottom - _top;

	}

	this.getX = function () {

		return _left;

	};

	this.getY = function () {

		return _top;

	};

	this.getWidth = function () {

		return _width;

	};

	this.getHeight = function () {

		return _height;

	};

	this.getLeft = function() {

		return _left;

	};

	this.getTop = function() {

		return _top;

	};

	this.getRight = function() {

		return _right;

	};

	this.getBottom = function() {

		return _bottom;

	};

	this.set = function ( left, top, right, bottom ) {

		_isEmpty = false;

		_left = left; _top = top;
		_right = right; _bottom = bottom;

		resize();

	};

	this.addPoint = function ( x, y ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_left = x; _top = y;
			_right = x; _bottom = y;

			resize();

		} else {

			_left = _left < x ? _left : x; // Math.min( _left, x );
			_top = _top < y ? _top : y; // Math.min( _top, y );
			_right = _right > x ? _right : x; // Math.max( _right, x );
			_bottom = _bottom > y ? _bottom : y; // Math.max( _bottom, y );

			resize();
		}

	};

	this.add3Points = function ( x1, y1, x2, y2, x3, y3 ) {

		if (_isEmpty) {

			_isEmpty = false;
			_left = x1 < x2 ? ( x1 < x3 ? x1 : x3 ) : ( x2 < x3 ? x2 : x3 );
			_top = y1 < y2 ? ( y1 < y3 ? y1 : y3 ) : ( y2 < y3 ? y2 : y3 );
			_right = x1 > x2 ? ( x1 > x3 ? x1 : x3 ) : ( x2 > x3 ? x2 : x3 );
			_bottom = y1 > y2 ? ( y1 > y3 ? y1 : y3 ) : ( y2 > y3 ? y2 : y3 );

			resize();

		} else {

			_left = x1 < x2 ? ( x1 < x3 ? ( x1 < _left ? x1 : _left ) : ( x3 < _left ? x3 : _left ) ) : ( x2 < x3 ? ( x2 < _left ? x2 : _left ) : ( x3 < _left ? x3 : _left ) );
			_top = y1 < y2 ? ( y1 < y3 ? ( y1 < _top ? y1 : _top ) : ( y3 < _top ? y3 : _top ) ) : ( y2 < y3 ? ( y2 < _top ? y2 : _top ) : ( y3 < _top ? y3 : _top ) );
			_right = x1 > x2 ? ( x1 > x3 ? ( x1 > _right ? x1 : _right ) : ( x3 > _right ? x3 : _right ) ) : ( x2 > x3 ? ( x2 > _right ? x2 : _right ) : ( x3 > _right ? x3 : _right ) );
			_bottom = y1 > y2 ? ( y1 > y3 ? ( y1 > _bottom ? y1 : _bottom ) : ( y3 > _bottom ? y3 : _bottom ) ) : ( y2 > y3 ? ( y2 > _bottom ? y2 : _bottom ) : ( y3 > _bottom ? y3 : _bottom ) );

			resize();

		};

	};

	this.addRectangle = function ( r ) {

		if ( _isEmpty ) {

			_isEmpty = false;
			_left = r.getLeft(); _top = r.getTop();
			_right = r.getRight(); _bottom = r.getBottom();

			resize();

		} else {

			_left = _left < r.getLeft() ? _left : r.getLeft(); // Math.min(_left, r.getLeft() );
			_top = _top < r.getTop() ? _top : r.getTop(); // Math.min(_top, r.getTop() );
			_right = _right > r.getRight() ? _right : r.getRight(); // Math.max(_right, r.getRight() );
			_bottom = _bottom > r.getBottom() ? _bottom : r.getBottom(); // Math.max(_bottom, r.getBottom() );

			resize();

		}

	};

	this.inflate = function ( v ) {

		_left -= v; _top -= v;
		_right += v; _bottom += v;

		resize();

	};

	this.minSelf = function ( r ) {

		_left = _left > r.getLeft() ? _left : r.getLeft(); // Math.max( _left, r.getLeft() );
		_top = _top > r.getTop() ? _top : r.getTop(); // Math.max( _top, r.getTop() );
		_right = _right < r.getRight() ? _right : r.getRight(); // Math.min( _right, r.getRight() );
		_bottom = _bottom < r.getBottom() ? _bottom : r.getBottom(); // Math.min( _bottom, r.getBottom() );

		resize();

	};

	
	//this.contains = function ( x, y ) {
	//
	//	return x > _left && x < _right && y > _top && y < _bottom;
	//
	//};
	

	this.instersects = function ( r ) {

		// return this.contains( r.getLeft(), r.getTop() ) || this.contains( r.getRight(), r.getTop() ) || this.contains( r.getLeft(), r.getBottom() ) || this.contains( r.getRight(), r.getBottom() );

		return Math.min( _right, r.getRight() ) - Math.max( _left, r.getLeft() ) >= 0 &&
		        Math.min( _bottom, r.getBottom() ) - Math.max( _top, r.getTop() ) >= 0;

	};

	this.empty = function () {

		_isEmpty = true;

		_left = 0; _top = 0;
		_right = 0; _bottom = 0;

		resize();

	};

	this.isEmpty = function () {

		return _isEmpty;

	};

};*/
THREE.Matrix3 = function () {

	this.m = [];

};

THREE.Matrix3.prototype = {

	/*transpose : function () {

		var tmp, m = this.m;

		tmp = m[1]; m[1] = m[3]; m[3] = tmp;
		tmp = m[2]; m[2] = m[6]; m[6] = tmp;
		tmp = m[5]; m[5] = m[7]; m[7] = tmp;

		return this;

	},*/

	transposeIntoArray : function ( r ) {

		var m = this.m;

		r[ 0 ] = m[ 0 ];
		r[ 1 ] = m[ 3 ];
		r[ 2 ] = m[ 6 ];
		r[ 3 ] = m[ 1 ];
		r[ 4 ] = m[ 4 ];
		r[ 5 ] = m[ 7 ];
		r[ 6 ] = m[ 2 ];
		r[ 7 ] = m[ 5 ];
		r[ 8 ] = m[ 8 ];

		return this;

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Matrix4 = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

	this.set(

		n11 || 1, n12 || 0, n13 || 0, n14 || 0,
		n21 || 0, n22 || 1, n23 || 0, n24 || 0,
		n31 || 0, n32 || 0, n33 || 1, n34 || 0,
		n41 || 0, n42 || 0, n43 || 0, n44 || 1

	);

	this.flat = new Array( 16 );
	this.m33 = new THREE.Matrix3();

};

THREE.Matrix4.prototype = {

	set : function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		this.n11 = n11; this.n12 = n12; this.n13 = n13; this.n14 = n14;
		this.n21 = n21; this.n22 = n22; this.n23 = n23; this.n24 = n24;
		this.n31 = n31; this.n32 = n32; this.n33 = n33; this.n34 = n34;
		this.n41 = n41; this.n42 = n42; this.n43 = n43; this.n44 = n44;

		return this;

	},

	/*identity : function () {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	},*/

	copy : function ( m ) {

		this.set(

			m.n11, m.n12, m.n13, m.n14,
			m.n21, m.n22, m.n23, m.n24,
			m.n31, m.n32, m.n33, m.n34,
			m.n41, m.n42, m.n43, m.n44

		);

		return this;

	},

	lookAt : function ( eye, center, up ) {

		var x = THREE.Matrix4.__v1, y = THREE.Matrix4.__v2, z = THREE.Matrix4.__v3;

		z.sub( eye, center ).normalize();

		if ( z.length() === 0 ) {

			z.z = 1;

		}

		x.cross( up, z ).normalize();

		if ( x.length() === 0 ) {

			z.x += 0.0001;
			x.cross( up, z ).normalize();

		}

		y.cross( z, x ).normalize();


		this.n11 = x.x; this.n12 = y.x; this.n13 = z.x;
		this.n21 = x.y; this.n22 = y.y; this.n23 = z.y;
		this.n31 = x.z; this.n32 = y.z; this.n33 = z.z;

		return this;

	},

	multiplyVector3 : function ( v ) {

		var vx = v.x, vy = v.y, vz = v.z,
		d = 1 / ( this.n41 * vx + this.n42 * vy + this.n43 * vz + this.n44 );

		v.x = ( this.n11 * vx + this.n12 * vy + this.n13 * vz + this.n14 ) * d;
		v.y = ( this.n21 * vx + this.n22 * vy + this.n23 * vz + this.n24 ) * d;
		v.z = ( this.n31 * vx + this.n32 * vy + this.n33 * vz + this.n34 ) * d;

		return v;

	},

	/*multiplyVector4 : function ( v ) {

		var vx = v.x, vy = v.y, vz = v.z, vw = v.w;

		v.x = this.n11 * vx + this.n12 * vy + this.n13 * vz + this.n14 * vw;
		v.y = this.n21 * vx + this.n22 * vy + this.n23 * vz + this.n24 * vw;
		v.z = this.n31 * vx + this.n32 * vy + this.n33 * vz + this.n34 * vw;
		v.w = this.n41 * vx + this.n42 * vy + this.n43 * vz + this.n44 * vw;

		return v;

	},

	rotateAxis : function ( v ) {

		var vx = v.x, vy = v.y, vz = v.z;

		v.x = vx * this.n11 + vy * this.n12 + vz * this.n13;
		v.y = vx * this.n21 + vy * this.n22 + vz * this.n23;
		v.z = vx * this.n31 + vy * this.n32 + vz * this.n33;

		v.normalize();

		return v;

	},

	crossVector : function ( a ) {

		var v = new THREE.Vector4();

		v.x = this.n11 * a.x + this.n12 * a.y + this.n13 * a.z + this.n14 * a.w;
		v.y = this.n21 * a.x + this.n22 * a.y + this.n23 * a.z + this.n24 * a.w;
		v.z = this.n31 * a.x + this.n32 * a.y + this.n33 * a.z + this.n34 * a.w;

		v.w = ( a.w ) ? this.n41 * a.x + this.n42 * a.y + this.n43 * a.z + this.n44 * a.w : 1;

		return v;

	},*/

	multiply : function ( a, b ) {

		var a11 = a.n11, a12 = a.n12, a13 = a.n13, a14 = a.n14,
		a21 = a.n21, a22 = a.n22, a23 = a.n23, a24 = a.n24,
		a31 = a.n31, a32 = a.n32, a33 = a.n33, a34 = a.n34,
		a41 = a.n41, a42 = a.n42, a43 = a.n43, a44 = a.n44,

		b11 = b.n11, b12 = b.n12, b13 = b.n13, b14 = b.n14,
		b21 = b.n21, b22 = b.n22, b23 = b.n23, b24 = b.n24,
		b31 = b.n31, b32 = b.n32, b33 = b.n33, b34 = b.n34,
		b41 = b.n41, b42 = b.n42, b43 = b.n43, b44 = b.n44;

		this.n11 = a11 * b11 + a12 * b21 + a13 * b31;
		this.n12 = a11 * b12 + a12 * b22 + a13 * b32;
		this.n13 = a11 * b13 + a12 * b23 + a13 * b33;
		this.n14 = a11 * b14 + a12 * b24 + a13 * b34 + a14;

		this.n21 = a21 * b11 + a22 * b21 + a23 * b31;
		this.n22 = a21 * b12 + a22 * b22 + a23 * b32;
		this.n23 = a21 * b13 + a22 * b23 + a23 * b33;
		this.n24 = a21 * b14 + a22 * b24 + a23 * b34 + a24;

		this.n31 = a31 * b11 + a32 * b21 + a33 * b31;
		this.n32 = a31 * b12 + a32 * b22 + a33 * b32;
		this.n33 = a31 * b13 + a32 * b23 + a33 * b33;
		this.n34 = a31 * b14 + a32 * b24 + a33 * b34 + a34;

		this.n41 = a41 * b11 + a42 * b21 + a43 * b31;
		this.n42 = a41 * b12 + a42 * b22 + a43 * b32;
		this.n43 = a41 * b13 + a42 * b23 + a43 * b33;
		this.n44 = a41 * b14 + a42 * b24 + a43 * b34 + a44;

		/*
		this.n11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		this.n12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		this.n13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		this.n14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		this.n21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		this.n22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		this.n23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		this.n24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		this.n31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		this.n32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		this.n33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		this.n34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		this.n41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		this.n42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		this.n43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		this.n44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
		*/

		return this;

	},

	multiplyToArray : function ( a, b, r ) {

		this.multiply( a, b );

		r[ 0 ] = this.n11; r[ 1 ] = this.n21; r[ 2 ] = this.n31; r[ 3 ] = this.n41;
		r[ 4 ] = this.n12; r[ 5 ] = this.n22; r[ 6 ] = this.n32; r[ 7 ] = this.n42;
		r[ 8 ]  = this.n13; r[ 9 ]  = this.n23; r[ 10 ] = this.n33; r[ 11 ] = this.n43;
		r[ 12 ] = this.n14; r[ 13 ] = this.n24; r[ 14 ] = this.n34; r[ 15 ] = this.n44;

		return this;

	},

	/*multiplySelf : function ( m ) {

		this.multiply( this, m );

		return this;

	},*/

	multiplyScalar : function ( s ) {

		this.n11 *= s; this.n12 *= s; this.n13 *= s; this.n14 *= s;
		this.n21 *= s; this.n22 *= s; this.n23 *= s; this.n24 *= s;
		this.n31 *= s; this.n32 *= s; this.n33 *= s; this.n34 *= s;
		this.n41 *= s; this.n42 *= s; this.n43 *= s; this.n44 *= s;

		return this;

	},

	determinant : function () {

		var n11 = this.n11, n12 = this.n12, n13 = this.n13, n14 = this.n14,
		n21 = this.n21, n22 = this.n22, n23 = this.n23, n24 = this.n24,
		n31 = this.n31, n32 = this.n32, n33 = this.n33, n34 = this.n34,
		n41 = this.n41, n42 = this.n42, n43 = this.n43, n44 = this.n44;

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )
		return (
			n14 * n23 * n32 * n41-
			n13 * n24 * n32 * n41-
			n14 * n22 * n33 * n41+
			n12 * n24 * n33 * n41+

			n13 * n22 * n34 * n41-
			n12 * n23 * n34 * n41-
			n14 * n23 * n31 * n42+
			n13 * n24 * n31 * n42+

			n14 * n21 * n33 * n42-
			n11 * n24 * n33 * n42-
			n13 * n21 * n34 * n42+
			n11 * n23 * n34 * n42+

			n14 * n22 * n31 * n43-
			n12 * n24 * n31 * n43-
			n14 * n21 * n32 * n43+
			n11 * n24 * n32 * n43+

			n12 * n21 * n34 * n43-
			n11 * n22 * n34 * n43-
			n13 * n22 * n31 * n44+
			n12 * n23 * n31 * n44+

			n13 * n21 * n32 * n44-
			n11 * n23 * n32 * n44-
			n12 * n21 * n33 * n44+
			n11 * n22 * n33 * n44
		);

	},

	/*transpose : function () {

		var tmp;

		tmp = this.n21; this.n21 = this.n12; this.n12 = tmp;
		tmp = this.n31; this.n31 = this.n13; this.n13 = tmp;
		tmp = this.n32; this.n32 = this.n23; this.n23 = tmp;

		tmp = this.n41; this.n41 = this.n14; this.n14 = tmp;
		tmp = this.n42; this.n42 = this.n24; this.n24 = tmp;
		tmp = this.n43; this.n43 = this.n34; this.n43 = tmp;

		return this;

	},

	clone : function () {

		var m = new THREE.Matrix4();

		m.n11 = this.n11; m.n12 = this.n12; m.n13 = this.n13; m.n14 = this.n14;
		m.n21 = this.n21; m.n22 = this.n22; m.n23 = this.n23; m.n24 = this.n24;
		m.n31 = this.n31; m.n32 = this.n32; m.n33 = this.n33; m.n34 = this.n34;
		m.n41 = this.n41; m.n42 = this.n42; m.n43 = this.n43; m.n44 = this.n44;

		return m;

	},

	flatten : function () {

		this.flat[ 0 ] = this.n11; this.flat[ 1 ] = this.n21; this.flat[ 2 ] = this.n31; this.flat[ 3 ] = this.n41;
		this.flat[ 4 ] = this.n12; this.flat[ 5 ] = this.n22; this.flat[ 6 ] = this.n32; this.flat[ 7 ] = this.n42;
		this.flat[ 8 ]  = this.n13; this.flat[ 9 ]  = this.n23; this.flat[ 10 ] = this.n33; this.flat[ 11 ] = this.n43;
		this.flat[ 12 ] = this.n14; this.flat[ 13 ] = this.n24; this.flat[ 14 ] = this.n34; this.flat[ 15 ] = this.n44;

		return this.flat;

	},*/

	flattenToArray : function ( flat ) {

		flat[ 0 ] = this.n11; flat[ 1 ] = this.n21; flat[ 2 ] = this.n31; flat[ 3 ] = this.n41;
		flat[ 4 ] = this.n12; flat[ 5 ] = this.n22; flat[ 6 ] = this.n32; flat[ 7 ] = this.n42;
		flat[ 8 ]  = this.n13; flat[ 9 ]  = this.n23; flat[ 10 ] = this.n33; flat[ 11 ] = this.n43;
		flat[ 12 ] = this.n14; flat[ 13 ] = this.n24; flat[ 14 ] = this.n34; flat[ 15 ] = this.n44;

		return flat;

	},

	/*flattenToArrayOffset : function( flat, offset ) {

		flat[ offset ] = this.n11;
		flat[ offset + 1 ] = this.n21;
		flat[ offset + 2 ] = this.n31;
		flat[ offset + 3 ] = this.n41;

		flat[ offset + 4 ] = this.n12;
		flat[ offset + 5 ] = this.n22;
		flat[ offset + 6 ] = this.n32;
		flat[ offset + 7 ] = this.n42;

		flat[ offset + 8 ]  = this.n13;
		flat[ offset + 9 ]  = this.n23;
		flat[ offset + 10 ] = this.n33;
		flat[ offset + 11 ] = this.n43;

		flat[ offset + 12 ] = this.n14;
		flat[ offset + 13 ] = this.n24;
		flat[ offset + 14 ] = this.n34;
		flat[ offset + 15 ] = this.n44;

		return flat;

	},

	setTranslation : function( x, y, z ) {

		this.set(

			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1

		);

		return this;

	},

	setScale : function ( x, y, z ) {

		this.set(

			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1

		);

		return this;

	},

	setRotationX : function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			1, 0,  0, 0,
			0, c, -s, 0,
			0, s,  c, 0,
			0, 0,  0, 1

		);

		return this;

	},

	setRotationY : function( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			 c, 0, s, 0,
			 0, 1, 0, 0,
			-s, 0, c, 0,
			 0, 0, 0, 1

		);

		return this;

	},

	setRotationZ : function( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			c, -s, 0, 0,
			s,  c, 0, 0,
			0,  0, 1, 0,
			0,  0, 0, 1

		);

		return this;

	},

	setRotationAxis : function( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		var c = Math.cos( angle ),
		s = Math.sin( angle ),
		t = 1 - c,
		x = axis.x, y = axis.y, z = axis.z,
		tx = t * x, ty = t * y;

		this.set(

		 	tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		 return this;

	},*/

	setPosition : function( v ) {

		this.n14 = v.x;
		this.n24 = v.y;
		this.n34 = v.z;

		return this;

	},
	
	/*getPosition : function() {
		
		if( !this.position ) {
			
			this.position = new THREE.Vector3();
			
		}
		
		this.position.set( this.n14, this.n24, this.n34 );
		
		return this.position;
		
	},

	getColumnX : function() {
		
		if( !this.columnX ) {
			
			this.columnX = new THREE.Vector3();
			
		}
		
		this.columnX.set( this.n11, this.n21, this.n31 );
		
		return this.columnX;
	},

	getColumnY : function() {
		
		if( !this.columnY ) {
			
			this.columnY = new THREE.Vector3();
			
		}
		
		this.columnY.set( this.n12, this.n22, this.n32 );
		
		return this.columnY;
	},

	getColumnZ : function() {
		
		if( !this.columnZ ) {
			
			this.columnZ = new THREE.Vector3();
			
		}
		
		this.columnZ.set( this.n13, this.n23, this.n33 );
		
		return this.columnZ;
	},*/

	setRotationFromEuler : function( v ) {

		var x = v.x, y = v.y, z = v.z,
		a = Math.cos( x ), b = Math.sin( x ),
		c = Math.cos( y ), d = Math.sin( y ),
		e = Math.cos( z ), f = Math.sin( z ),
		ad = a * d, bd = b * d;

		this.n11 = c * e;
		this.n12 = - c * f;
		this.n13 = d;

		this.n21 = bd * e + a * f;
		this.n22 = - bd * f + a * e;
		this.n23 = - b * c;

		this.n31 = - ad * e + b * f;
		this.n32 = ad * f + b * e;
		this.n33 = a * c;

		return this;

	},

	/*setRotationFromQuaternion : function( q ) {

		var x = q.x, y = q.y, z = q.z, w = q.w,
		x2 = x + x, y2 = y + y, z2 = z + z,
		xx = x * x2, xy = x * y2, xz = x * z2,
		yy = y * y2, yz = y * z2, zz = z * z2,
		wx = w * x2, wy = w * y2, wz = w * z2;

		this.n11 = 1 - ( yy + zz );
		this.n12 = xy - wz;
		this.n13 = xz + wy;

		this.n21 = xy + wz;
		this.n22 = 1 - ( xx + zz );
		this.n23 = yz - wx;

		this.n31 = xz - wy;
		this.n32 = yz + wx;
		this.n33 = 1 - ( xx + yy );

		return this;

	},*/

	scale : function ( v ) {

		var x = v.x, y = v.y, z = v.z;

		this.n11 *= x; this.n12 *= y; this.n13 *= z;
		this.n21 *= x; this.n22 *= y; this.n23 *= z;
		this.n31 *= x; this.n32 *= y; this.n33 *= z;
		this.n41 *= x; this.n42 *= y; this.n43 *= z;

		return this;

	},

	/*extractPosition : function ( m ) {

		this.n14 = m.n14;
		this.n24 = m.n24;
		this.n34 = m.n34;

	},*/

	extractRotation : function ( m, s ) {

		var invScaleX = 1 / s.x, invScaleY = 1 / s.y, invScaleZ = 1 / s.z;

		this.n11 = m.n11 * invScaleX;
		this.n21 = m.n21 * invScaleX;
		this.n31 = m.n31 * invScaleX;

		this.n12 = m.n12 * invScaleY;
		this.n22 = m.n22 * invScaleY;
		this.n32 = m.n32 * invScaleY;

		this.n13 = m.n13 * invScaleZ;
		this.n23 = m.n23 * invScaleZ;
		this.n33 = m.n33 * invScaleZ;

	}

};

THREE.Matrix4.makeInvert = function ( m1, m2 ) {

	// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

	var n11 = m1.n11, n12 = m1.n12, n13 = m1.n13, n14 = m1.n14,
	n21 = m1.n21, n22 = m1.n22, n23 = m1.n23, n24 = m1.n24,
	n31 = m1.n31, n32 = m1.n32, n33 = m1.n33, n34 = m1.n34,
	n41 = m1.n41, n42 = m1.n42, n43 = m1.n43, n44 = m1.n44;

	if( m2 === undefined ) m2 = new THREE.Matrix4();

	m2.n11 = n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44;
	m2.n12 = n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44;
	m2.n13 = n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44;
	m2.n14 = n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34;
	m2.n21 = n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44;
	m2.n22 = n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44;
	m2.n23 = n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44;
	m2.n24 = n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34;
	m2.n31 = n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44;
	m2.n32 = n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44;
	m2.n33 = n13*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44;
	m2.n34 = n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34;
	m2.n41 = n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43;
	m2.n42 = n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43;
	m2.n43 = n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43;
	m2.n44 = n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33;
	m2.multiplyScalar( 1 / m1.determinant() );

	return m2;

};

THREE.Matrix4.makeInvert3x3 = function ( m1 ) {

	// input:  THREE.Matrix4, output: THREE.Matrix3
	// ( based on http://code.google.com/p/webgl-mjs/ )

	var m33 = m1.m33, m33m = m33.m,
	a11 =   m1.n33 * m1.n22 - m1.n32 * m1.n23,
	a21 = - m1.n33 * m1.n21 + m1.n31 * m1.n23,
	a31 =   m1.n32 * m1.n21 - m1.n31 * m1.n22,
	a12 = - m1.n33 * m1.n12 + m1.n32 * m1.n13,
	a22 =   m1.n33 * m1.n11 - m1.n31 * m1.n13,
	a32 = - m1.n32 * m1.n11 + m1.n31 * m1.n12,
	a13 =   m1.n23 * m1.n12 - m1.n22 * m1.n13,
	a23 = - m1.n23 * m1.n11 + m1.n21 * m1.n13,
	a33 =   m1.n22 * m1.n11 - m1.n21 * m1.n12,

	det = m1.n11 * a11 + m1.n21 * a12 + m1.n31 * a13,

	idet;

	// no inverse
	if (det == 0) {
		throw "matrix not invertible";
	}
	
	idet = 1.0 / det;

	m33m[ 0 ] = idet * a11; m33m[ 1 ] = idet * a21; m33m[ 2 ] = idet * a31;
	m33m[ 3 ] = idet * a12; m33m[ 4 ] = idet * a22; m33m[ 5 ] = idet * a32;
	m33m[ 6 ] = idet * a13; m33m[ 7 ] = idet * a23; m33m[ 8 ] = idet * a33;

	return m33;

}

THREE.Matrix4.makeFrustum = function ( left, right, bottom, top, near, far ) {

	var m, x, y, a, b, c, d;

	m = new THREE.Matrix4();
	x = 2 * near / ( right - left );
	y = 2 * near / ( top - bottom );
	a = ( right + left ) / ( right - left );
	b = ( top + bottom ) / ( top - bottom );
	c = - ( far + near ) / ( far - near );
	d = - 2 * far * near / ( far - near );

	m.n11 = x;  m.n12 = 0;  m.n13 = a;   m.n14 = 0;
	m.n21 = 0;  m.n22 = y;  m.n23 = b;   m.n24 = 0;
	m.n31 = 0;  m.n32 = 0;  m.n33 = c;   m.n34 = d;
	m.n41 = 0;  m.n42 = 0;  m.n43 = - 1; m.n44 = 0;

	return m;

};

THREE.Matrix4.makePerspective = function ( fov, aspect, near, far ) {

	var ymax, ymin, xmin, xmax;

	ymax = near * Math.tan( fov * Math.PI / 360 );
	ymin = - ymax;
	xmin = ymin * aspect;
	xmax = ymax * aspect;

	return THREE.Matrix4.makeFrustum( xmin, xmax, ymin, ymax, near, far );

};

/*THREE.Matrix4.makeOrtho = function ( left, right, top, bottom, near, far ) {

	var m, x, y, z, w, h, p;

	m = new THREE.Matrix4();
	w = right - left;
	h = top - bottom;
	p = far - near;
	x = ( right + left ) / w;
	y = ( top + bottom ) / h;
	z = ( far + near ) / p;

	m.n11 = 2 / w; m.n12 = 0;     m.n13 = 0;      m.n14 = -x;
	m.n21 = 0;     m.n22 = 2 / h; m.n23 = 0;      m.n24 = -y;
	m.n31 = 0;     m.n32 = 0;     m.n33 = -2 / p; m.n34 = -z;
	m.n41 = 0;     m.n42 = 0;     m.n43 = 0;      m.n44 = 1;

	return m;

};*/

THREE.Matrix4.__v1 = new THREE.Vector3();
THREE.Matrix4.__v2 = new THREE.Vector3();
THREE.Matrix4.__v3 = new THREE.Vector3();
/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Object3D = function() {

	this.parent = undefined;
	this.children = [];

	this.up = new THREE.Vector3( 0, 1, 0 );

	this.position = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	this.rotationAutoUpdate = true;

	this.matrix = new THREE.Matrix4();
	this.matrixWorld = new THREE.Matrix4();
	this.matrixRotationWorld = new THREE.Matrix4();

	this.matrixAutoUpdate = true;
	this.matrixWorldNeedsUpdate = true;

	this.quaternion = new THREE.Quaternion();
	this.useQuaternion = false;

	this.boundRadius = 0.0;
	this.boundRadiusScale = 1.0;

	this.visible = true;

	this._vector = new THREE.Vector3();
	
	this.name = "";

};


THREE.Object3D.prototype = {

	/*translate : function ( distance, axis ) {

		this.matrix.rotateAxis( axis );
		this.position.addSelf( axis.multiplyScalar( distance ) );

	},

	translateX : function ( distance ) {

		this.translate( distance, this._vector.set( 1, 0, 0 ) );

	},

	translateY : function ( distance ) {

		this.translate( distance, this._vector.set( 0, 1, 0 ) );

	},

	translateZ : function ( distance ) {

		this.translate( distance, this._vector.set( 0, 0, 1 ) );

	},

	lookAt : function ( vector ) {

		// TODO: Add hierarchy support.

		this.matrix.lookAt( vector, this.position, this.up );

		if ( this.rotationAutoUpdate ) {

			this.rotation.setRotationFromMatrix( this.matrix );

		}

	},*/

	addChild: function ( child ) {

		if ( this.children.indexOf( child ) === - 1 ) {

			if( child.parent !== undefined ) {

				child.parent.removeChild( child );

			}

			child.parent = this;
			this.children.push( child );

			// add to scene

			var scene = this;

			while ( scene.parent !== undefined ) {

				scene = scene.parent;

			}

			if ( scene !== undefined && scene instanceof THREE.Scene )  {

				scene.addChildRecurse( child );

			}

		}

	},

	/*removeChild: function ( child ) {

		var childIndex = this.children.indexOf( child );

		if ( childIndex !== - 1 ) {

			child.parent = undefined;
			this.children.splice( childIndex, 1 );

		}

	},
	
	getChildByName: function ( name, doRecurse ) {
		
		var c, cl, child, recurseResult;
		
		for( c = 0, cl = this.children.length; c < cl; c++ ) {
			
			child = this.children[ c ];
			
			if( child.name === name ) {
				
				return child;
				
			}
			
			if( doRecurse ) {
				
				recurseResult = child.getChildByName( name, doRecurse );
				
				if( recurseResult !== undefined ) {
					
					return recurseResult;
					
				}
				
			}
			
		}
		
		return undefined;
		
	},*/

	updateMatrix: function () {

		this.matrix.setPosition( this.position );

		if ( this.useQuaternion )  {

			this.matrix.setRotationFromQuaternion( this.quaternion );

		} else {

			this.matrix.setRotationFromEuler( this.rotation );

		}

		if ( this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1 ) {

			this.matrix.scale( this.scale );
			this.boundRadiusScale = Math.max( this.scale.x, Math.max( this.scale.y, this.scale.z ) );

		}

		this.matrixWorldNeedsUpdate = true;

	},

	update: function ( parentMatrixWorld, forceUpdate, camera ) {

		this.matrixAutoUpdate && this.updateMatrix();

		// update matrixWorld

		if ( this.matrixWorldNeedsUpdate || forceUpdate ) {

			if ( parentMatrixWorld ) {

				this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

			} else {

				this.matrixWorld.copy( this.matrix );

			}

			this.matrixRotationWorld.extractRotation( this.matrixWorld, this.scale );

			this.matrixWorldNeedsUpdate = false;

			forceUpdate = true;

		}

		// update children

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].update( this.matrixWorld, forceUpdate, camera );

		}

	}

};
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Quaternion = function( x, y, z, w ) {

	this.set(

		x || 0,
		y || 0,
		z || 0,
		w !== undefined ? w : 1

	);

};

THREE.Quaternion.prototype = {

	set : function ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	}

	/*copy : function ( q ) {

		this.x = q.x;
		this.y = q.y;
		this.z = q.z;
		this.w = q.w;

		return this;

	},

	setFromEuler : function ( vec3 ) {

		var c = 0.5 * Math.PI / 360, // 0.5 is an optimization
		x = vec3.x * c,
		y = vec3.y * c,
		z = vec3.z * c,

		c1 = Math.cos( y  ),
		s1 = Math.sin( y  ),
		c2 = Math.cos( -z ),
		s2 = Math.sin( -z ),
		c3 = Math.cos( x  ),
		s3 = Math.sin( x  ),

		c1c2 = c1 * c2,
		s1s2 = s1 * s2;

		this.w = c1c2 * c3  - s1s2 * s3;
	  	this.x = c1c2 * s3  + s1s2 * c3;
		this.y = s1 * c2 * c3 + c1 * s2 * s3;
		this.z = c1 * s2 * c3 - s1 * c2 * s3;

		return this;

	},

	setFromAxisAngle: function ( axis, angle ) {

		// from http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
		// axis have to be normalized

		var halfAngle = angle / 2,
			s = Math.sin( halfAngle );

		this.x = axis.x * s;
		this.y = axis.y * s;
		this.z = axis.z * s;
		this.w = Math.cos( halfAngle );

		return this;

	},
	
	calculateW  : function () {

		this.w = - Math.sqrt( Math.abs( 1.0 - this.x * this.x - this.y * this.y - this.z * this.z ) );

		return this;

	},

	inverse : function () {

		this.x *= -1;
		this.y *= -1;
		this.z *= -1;

		return this;

	},

	length : function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );

	},

	normalize : function () {

		var l = Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );

		if ( l == 0 ) {

			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 0;

		} else {

			l = 1 / l;

			this.x = this.x * l;
			this.y = this.y * l;
			this.z = this.z * l;
			this.w = this.w * l;

		}

		return this;

	},

	multiplySelf : function ( quat2 ) {

		var qax = this.x,  qay = this.y,  qaz = this.z,  qaw = this.w,
		qbx = quat2.x, qby = quat2.y, qbz = quat2.z, qbw = quat2.w;

		this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		return this;

	},

	multiply: function ( q1, q2 ) {

		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		this.x =  q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
		this.y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
		this.z =  q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
		this.w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
		
		return this;

	},

	multiplyVector3 : function ( vec, dest ) {

		if( !dest ) { dest = vec; }

		var x    = vec.x,  y  = vec.y,  z  = vec.z,
			qx   = this.x, qy = this.y, qz = this.z, qw = this.w;

		// calculate quat * vec

		var ix =  qw * x + qy * z - qz * y,
			iy =  qw * y + qz * x - qx * z,
			iz =  qw * z + qx * y - qy * x,
			iw = -qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

		return dest;

	}*/

}

/*THREE.Quaternion.slerp = function ( qa, qb, qm, t ) {

	var cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;

	if ( Math.abs( cosHalfTheta ) >= 1.0 ) {

		qm.w = qa.w; qm.x = qa.x; qm.y = qa.y; qm.z = qa.z;
		return qm;

	}

	var halfTheta = Math.acos( cosHalfTheta ),
	sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

	if ( Math.abs( sinHalfTheta ) < 0.001 ) { 

		qm.w = 0.5 * ( qa.w + qb.w );
		qm.x = 0.5 * ( qa.x + qb.x );
		qm.y = 0.5 * ( qa.y + qb.y );
		qm.z = 0.5 * ( qa.z + qb.z );

		return qm;

	}

	var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
	ratioB = Math.sin( t * halfTheta ) / sinHalfTheta; 

	qm.w = ( qa.w * ratioA + qb.w * ratioB );
	qm.x = ( qa.x * ratioA + qb.x * ratioB );
	qm.y = ( qa.y * ratioA + qb.y * ratioB );
	qm.z = ( qa.z * ratioA + qb.z * ratioB );

	return qm;

}*/
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Vertex = function ( position ) {

	this.position = position || new THREE.Vector3();

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Face3 = function ( a, b, c, normal, color, materials ) {

	this.a = a; 
	this.b = b;
	this.c = c;

	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [ ];

	this.color = color instanceof THREE.Color ? color : new THREE.Color();
	this.vertexColors = color instanceof Array ? color : [];

	this.vertexTangents = [];

	this.materials = materials instanceof Array ? materials : [ materials ];

	this.centroid = new THREE.Vector3();

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

/*THREE.Face4 = function ( a, b, c, d, normal, color, materials ) {

	this.a = a; 
	this.b = b;
	this.c = c;
	this.d = d;

	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [ ];

	this.color = color instanceof THREE.Color ? color : new THREE.Color();
	this.vertexColors = color instanceof Array ? color : [];

	this.vertexTangents = [];

	this.materials = materials instanceof Array ? materials : [ materials ];

	this.centroid = new THREE.Vector3();

};*/
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.UV = function ( u, v ) {

	this.set(

		u || 0,
		v || 0

	);

};

THREE.UV.prototype = {

	set : function ( u, v ) {

		this.u = u;
		this.v = v;

		return this;

	}

	/*copy : function ( uv ) {

		this.set(

			uv.u,
			uv.v

		);

		return this;

	}*/

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Geometry = function () {

	this.id = "Geometry" + THREE.GeometryIdCounter ++;

	this.vertices = [];
	this.colors = []; // one-to-one vertex colors, used in ParticleSystem, Line and Ribbon

	this.faces = [];

	this.edges = [];

	this.faceUvs = [[]];
	this.faceVertexUvs = [[]];

	this.morphTargets = [];
	this.morphColors = [];

	this.skinWeights = [];
	this.skinIndices = [];

	this.boundingBox = null;
	this.boundingSphere = null;

	this.hasTangents = false;

};

THREE.Geometry.prototype = {

	computeCentroids: function () {

		var f, fl, face;

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];
			face.centroid.set( 0, 0, 0 );

			if ( face instanceof THREE.Face3 ) {

				face.centroid.addSelf( this.vertices[ face.a ].position );
				face.centroid.addSelf( this.vertices[ face.b ].position );
				face.centroid.addSelf( this.vertices[ face.c ].position );
				face.centroid.divideScalar( 3 );

			} else if ( face instanceof THREE.Face4 ) {

				face.centroid.addSelf( this.vertices[ face.a ].position );
				face.centroid.addSelf( this.vertices[ face.b ].position );
				face.centroid.addSelf( this.vertices[ face.c ].position );
				face.centroid.addSelf( this.vertices[ face.d ].position );
				face.centroid.divideScalar( 4 );

			}

		}

	},

	computeFaceNormals: function ( useVertexNormals ) {

		var n, nl, v, vl, vertex, f, fl, face, vA, vB, vC,
		cb = new THREE.Vector3(), ab = new THREE.Vector3();

		/*
		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertex = this.vertices[ v ];
			vertex.normal.set( 0, 0, 0 );

		}
		*/

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( useVertexNormals && face.vertexNormals.length  ) {

				cb.set( 0, 0, 0 );

				for ( n = 0, nl = face.vertexNormals.length; n < nl; n++ ) {

					cb.addSelf( face.vertexNormals[n] );

				}

				cb.divideScalar( 3 );

				if ( ! cb.isZero() ) {

					cb.normalize();

				}

				face.normal.copy( cb );

			} else {

				vA = this.vertices[ face.a ];
				vB = this.vertices[ face.b ];
				vC = this.vertices[ face.c ];

				cb.sub( vC.position, vB.position );
				ab.sub( vA.position, vB.position );
				cb.crossSelf( ab );

				if ( !cb.isZero() ) {

					cb.normalize();

				}

				face.normal.copy( cb );

			}

		}

	},

	computeVertexNormals: function () {

		var v, vl, f, fl, face, vertices;

		// create internal buffers for reuse when calling this method repeatedly
		// (otherwise memory allocation / deallocation every frame is big resource hog)

		if ( this.__tmpVertices == undefined ) {

			this.__tmpVertices = new Array( this.vertices.length );
			vertices = this.__tmpVertices;

			for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

				vertices[ v ] = new THREE.Vector3();

			}

			for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

				face = this.faces[ f ];

				if ( face instanceof THREE.Face3 ) {

					face.vertexNormals = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

				} else if ( face instanceof THREE.Face4 ) {

					face.vertexNormals = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

				}

			}

		} else {

			vertices = this.__tmpVertices;

			for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

				vertices[ v ].set( 0, 0, 0 );

			}

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( face instanceof THREE.Face3 ) {

				vertices[ face.a ].addSelf( face.normal );
				vertices[ face.b ].addSelf( face.normal );
				vertices[ face.c ].addSelf( face.normal );

			} else if ( face instanceof THREE.Face4 ) {

				vertices[ face.a ].addSelf( face.normal );
				vertices[ face.b ].addSelf( face.normal );
				vertices[ face.c ].addSelf( face.normal );
				vertices[ face.d ].addSelf( face.normal );

			}

		}

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			vertices[ v ].normalize();

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			if ( face instanceof THREE.Face3 ) {

				face.vertexNormals[ 0 ].copy( vertices[ face.a ] );
				face.vertexNormals[ 1 ].copy( vertices[ face.b ] );
				face.vertexNormals[ 2 ].copy( vertices[ face.c ] );

			} else if ( face instanceof THREE.Face4 ) {

				face.vertexNormals[ 0 ].copy( vertices[ face.a ] );
				face.vertexNormals[ 1 ].copy( vertices[ face.b ] );
				face.vertexNormals[ 2 ].copy( vertices[ face.c ] );
				face.vertexNormals[ 3 ].copy( vertices[ face.d ] );

			}

		}

	}

	/*computeTangents: function () {

		// based on http://www.terathon.com/code/tangent.html
		// tangents go to vertices

		var f, fl, v, vl, i, il, vertexIndex,
			face, uv, vA, vB, vC, uvA, uvB, uvC,
			x1, x2, y1, y2, z1, z2,
			s1, s2, t1, t2, r, t, test,
			tan1 = [], tan2 = [],
			sdir = new THREE.Vector3(), tdir = new THREE.Vector3(),
			tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(),
			n = new THREE.Vector3(), w;

		for ( v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			tan1[ v ] = new THREE.Vector3();
			tan2[ v ] = new THREE.Vector3();

		}

		function handleTriangle( context, a, b, c, ua, ub, uc ) {

			vA = context.vertices[ a ].position;
			vB = context.vertices[ b ].position;
			vC = context.vertices[ c ].position;

			uvA = uv[ ua ];
			uvB = uv[ ub ];
			uvC = uv[ uc ];

			x1 = vB.x - vA.x;
			x2 = vC.x - vA.x;
			y1 = vB.y - vA.y;
			y2 = vC.y - vA.y;
			z1 = vB.z - vA.z;
			z2 = vC.z - vA.z;

			s1 = uvB.u - uvA.u;
			s2 = uvC.u - uvA.u;
			t1 = uvB.v - uvA.v;
			t2 = uvC.v - uvA.v;

			r = 1.0 / ( s1 * t2 - s2 * t1 );
			sdir.set( ( t2 * x1 - t1 * x2 ) * r,
					  ( t2 * y1 - t1 * y2 ) * r,
					  ( t2 * z1 - t1 * z2 ) * r );
			tdir.set( ( s1 * x2 - s2 * x1 ) * r,
					  ( s1 * y2 - s2 * y1 ) * r,
					  ( s1 * z2 - s2 * z1 ) * r );

			tan1[ a ].addSelf( sdir );
			tan1[ b ].addSelf( sdir );
			tan1[ c ].addSelf( sdir );

			tan2[ a ].addSelf( tdir );
			tan2[ b ].addSelf( tdir );
			tan2[ c ].addSelf( tdir );

		}

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];
			uv = this.faceVertexUvs[ 0 ][ f ]; // use UV layer 0 for tangents

			if ( face instanceof THREE.Face3 ) {

				handleTriangle( this, face.a, face.b, face.c, 0, 1, 2 );

			} else if ( face instanceof THREE.Face4 ) {

				handleTriangle( this, face.a, face.b, face.c, 0, 1, 2 );
				handleTriangle( this, face.a, face.b, face.d, 0, 1, 3 );

			}

		}

		var faceIndex = [ 'a', 'b', 'c', 'd' ];

		for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {

			face = this.faces[ f ];

			for ( i = 0; i < face.vertexNormals.length; i++ ) {

				n.copy( face.vertexNormals[ i ] );

				vertexIndex = face[ faceIndex[ i ] ];

				t = tan1[ vertexIndex ];

				// Gram-Schmidt orthogonalize

				tmp.copy( t );
				tmp.subSelf( n.multiplyScalar( n.dot( t ) ) ).normalize();

				// Calculate handedness

				tmp2.cross( face.vertexNormals[ i ], t );
				test = tmp2.dot( tan2[ vertexIndex ] );
				w = (test < 0.0) ? -1.0 : 1.0;

				face.vertexTangents[ i ] = new THREE.Vector4( tmp.x, tmp.y, tmp.z, w );

			}

		}

		this.hasTangents = true;

	},

	computeBoundingBox: function () {

		var vertex;

		if ( this.vertices.length > 0 ) {

			this.boundingBox = { 'x': [ this.vertices[ 0 ].position.x, this.vertices[ 0 ].position.x ],
			'y': [ this.vertices[ 0 ].position.y, this.vertices[ 0 ].position.y ],
			'z': [ this.vertices[ 0 ].position.z, this.vertices[ 0 ].position.z ] };

			for ( var v = 1, vl = this.vertices.length; v < vl; v ++ ) {

				vertex = this.vertices[ v ];

				if ( vertex.position.x < this.boundingBox.x[ 0 ] ) {

					this.boundingBox.x[ 0 ] = vertex.position.x;

				} else if ( vertex.position.x > this.boundingBox.x[ 1 ] ) {

					this.boundingBox.x[ 1 ] = vertex.position.x;

				}

				if ( vertex.position.y < this.boundingBox.y[ 0 ] ) {

					this.boundingBox.y[ 0 ] = vertex.position.y;

				} else if ( vertex.position.y > this.boundingBox.y[ 1 ] ) {

					this.boundingBox.y[ 1 ] = vertex.position.y;

				}

				if ( vertex.position.z < this.boundingBox.z[ 0 ] ) {

					this.boundingBox.z[ 0 ] = vertex.position.z;

				} else if ( vertex.position.z > this.boundingBox.z[ 1 ] ) {

					this.boundingBox.z[ 1 ] = vertex.position.z;

				}

			}

		}

	},

	computeBoundingSphere: function () {

		var radius = this.boundingSphere === null ? 0 : this.boundingSphere.radius;

		for ( var v = 0, vl = this.vertices.length; v < vl; v ++ ) {

			radius = Math.max( radius, this.vertices[ v ].position.length() );

		}

		this.boundingSphere = { radius: radius };

	},

	computeEdgeFaces: function () {

		function edge_hash( a, b ) {

			return Math.min( a, b ) + "_" + Math.max( a, b );

		};

		function addToMap( map, hash, i ) {

			if ( map[ hash ] === undefined ) {

				map[ hash ] = { "set": {}, "array": [] };
				map[ hash ].set[ i ] = 1;
				map[ hash ].array.push( i );

			} else {

				if( map[ hash ].set[ i ] === undefined ) {

					map[ hash ].set[ i ] = 1;
					map[ hash ].array.push( i );

				}

			}

		};

		var i, il, v1, v2, j, k,
			face, faceIndices, faceIndex,
			edge,
			hash,
			vfMap = {};

		// construct vertex -> face map

		for( i = 0, il = this.faces.length; i < il; i ++ ) {

			face = this.faces[ i ];

			if ( face instanceof THREE.Face3 ) {

				hash = edge_hash( face.a, face.b );
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.b, face.c );
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.a, face.c );
				addToMap( vfMap, hash, i );

			} else if ( face instanceof THREE.Face4 ) {

				// in WebGLRenderer quad is tesselated
				// to triangles: a,b,d / b,c,d
				// shared edge is: b,d

				// should shared edge be included?
				// comment out if not

				hash = edge_hash( face.b, face.d ); 
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.a, face.b );
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.a, face.d );
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.b, face.c );
				addToMap( vfMap, hash, i );

				hash = edge_hash( face.c, face.d );
				addToMap( vfMap, hash, i );

			}

		}

		// extract faces

		for( i = 0, il = this.edges.length; i < il; i ++ ) {

			edge = this.edges[ i ];

			v1 = edge.vertexIndices[ 0 ];
			v2 = edge.vertexIndices[ 1 ];

			edge.faceIndices = vfMap[ edge_hash( v1, v2 ) ].array;

			for( j = 0; j < edge.faceIndices.length; j ++ ) {

				faceIndex = edge.faceIndices[ j ];
				edge.faces.push( this.faces[ faceIndex ] );

			}

		}

	}*/

};

THREE.GeometryIdCounter = 0;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Camera = function ( fov, aspect, near, far, target ) {

	THREE.Object3D.call( this );

	this.fov = fov || 50;
	this.aspect = aspect || 1;
	this.near = near || 0.1;
	this.far = far || 2000;

	this.target = target || new THREE.Object3D();
	this.useTarget = true;

	this.matrixWorldInverse = new THREE.Matrix4();
	this.projectionMatrix = null;

	this.updateProjectionMatrix();

};

THREE.Camera.prototype = new THREE.Object3D();
THREE.Camera.prototype.constructor = THREE.Camera;
THREE.Camera.prototype.supr = THREE.Object3D.prototype;


/*THREE.Camera.prototype.translate = function ( distance, axis ) {

	this.matrix.rotateAxis( axis );
	this.position.addSelf( axis.multiplyScalar( distance ) );
	this.target.position.addSelf( axis.multiplyScalar( distance ) );

};
*/

THREE.Camera.prototype.updateProjectionMatrix = function () {

	this.projectionMatrix = THREE.Matrix4.makePerspective( this.fov, this.aspect, this.near, this.far );

};

THREE.Camera.prototype.update = function ( parentMatrixWorld, forceUpdate, camera ) {

	if ( this.useTarget ) {

		// local

		this.matrix.lookAt( this.position, this.target.position, this.up );
		this.matrix.setPosition( this.position );


		// global

		if( parentMatrixWorld ) {

			this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

		} else {

			this.matrixWorld.copy( this.matrix );

		}

		THREE.Matrix4.makeInvert( this.matrixWorld, this.matrixWorldInverse );

		forceUpdate = true;

	} else {

		this.matrixAutoUpdate && this.updateMatrix();

		if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

			if ( parentMatrixWorld ) {

				this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

			} else {

				this.matrixWorld.copy( this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;
			forceUpdate = true;

			THREE.Matrix4.makeInvert( this.matrixWorld, this.matrixWorldInverse );

		}

	}

	// update children

	for ( var i = 0; i < this.children.length; i ++ ) {

		this.children[ i ].update( this.matrixWorld, forceUpdate, camera );

	}

};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
 
/*THREE.Light = function ( hex ) {

	THREE.Object3D.call( this );

	this.color = new THREE.Color( hex );

};

THREE.Light.prototype = new THREE.Object3D();
THREE.Light.prototype.constructor = THREE.Light;
THREE.Light.prototype.supr = THREE.Object3D.prototype;*/
/**
 * @author mr.doob / http://mrdoob.com/
 */

/*THREE.AmbientLight = function ( hex ) {

	THREE.Light.call( this, hex );

};

THREE.AmbientLight.prototype = new THREE.Light();
THREE.AmbientLight.prototype.constructor = THREE.AmbientLight; */
/**
 * @author mr.doob / http://mrdoob.com/
 */

/*THREE.DirectionalLight = function ( hex, intensity, distance, castShadow ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3( 0, 1, 0 );
	this.intensity = intensity || 1;
	this.distance = distance || 0;
	this.castShadow = castShadow !== undefined ? castShadow : false;

};

THREE.DirectionalLight.prototype = new THREE.Light();
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight; */
/**
 * @author mr.doob / http://mrdoob.com/
 */

/*THREE.PointLight = function ( hex, intensity, distance ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3();
	this.intensity = intensity || 1;
	this.distance = distance || 0;

};

THREE.PointLight.prototype = new THREE.Light();
THREE.PointLight.prototype.constructor = THREE.PointLight; */
/**
 * @author Mikael Emtinger
 */
 
/*THREE.LensFlare = function ( texture, size, distance, blending ) {

	THREE.Object3D.call( this );

	this.positionScreen = new THREE.Vector3();
	this.lensFlares = [];
	this.customUpdateCallback = undefined;

	if( texture !== undefined ) {
		
		this.add( texture, size, distance, blending );
		
	}

};

THREE.LensFlare.prototype = new THREE.Object3D();
THREE.LensFlare.prototype.constructor = THREE.LensFlare;
THREE.LensFlare.prototype.supr = THREE.Object3D.prototype;*/


/*
 * Add: adds another flare 
 */

/*THREE.LensFlare.prototype.add = function( texture, size, distance, blending ) {
	
	if( size === undefined ) size = -1;
	if( distance === undefined ) distance = 0;
	if( blending === undefined ) blending = THREE.BillboardBlending;
	
	distance = Math.min( distance, Math.max( 0, distance ));

	this.lensFlares.push( { texture: texture, 			// THREE.Texture
		                    size: size, 				// size in pixels (-1 = use texture.width)
		                    distance: distance, 		// distance (0-1) from light source (0=at light source)
		                    x: 0, y: 0, z: 0,			// screen position (-1 => 1) z = 0 is ontop z = 1 is back 
		                    scale: 1, 					// scale
		                    rotation: 1, 				// rotation
		                    opacity: 1,					// opacity
		                    blending: blending } );		// blending

};*/


/*
 * Update lens flares update positions on all flares based on the screen position
 * Set myLensFlare.customUpdateCallback to alter the flares in your project specific way.
 */

/*THREE.LensFlare.prototype.updateLensFlares = function() {
	
	var f, fl = this.lensFlares.length;
	var flare;
	var vecX = -this.positionScreen.x * 2;
	var vecY = -this.positionScreen.y * 2; 
	
	
	for( f = 0; f < fl; f++ ) {
		
		flare = this.lensFlares[ f ];
		
		flare.x = this.positionScreen.x + vecX * flare.distance;
		flare.y = this.positionScreen.y + vecY * flare.distance;

		flare.wantedRotation = flare.x * Math.PI * 0.25;
		flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.25;

	}

};*/












/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Material = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;

	parameters = parameters || {};

	this.opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
	this.transparent = parameters.transparent !== undefined ? parameters.transparent : false;

	this.blending = parameters.blending !== undefined ? parameters.blending : THREE.NormalBlending;
	this.depthTest = parameters.depthTest !== undefined ? parameters.depthTest : true;


}

THREE.NoShading = 0;
THREE.FlatShading = 1;
THREE.SmoothShading = 2;

THREE.NoColors = 0;
THREE.FaceColors = 1;
THREE.VertexColors = 2;

THREE.NormalBlending = 0;
THREE.AdditiveBlending = 1;
THREE.SubtractiveBlending = 2;
THREE.MultiplyBlending = 3;
THREE.AdditiveAlphaBlending = 4;


THREE.MaterialCounter = { value: 0 };
/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CubeReflectionMapping = function () {};
THREE.CubeRefractionMapping = function () {};

THREE.LatitudeReflectionMapping = function () {};
THREE.LatitudeRefractionMapping = function () {};

THREE.SphericalReflectionMapping = function () {};
THREE.SphericalRefractionMapping = function () {};

THREE.UVMapping = function () {};
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  linewidth: <float>,
 *  linecap: "round",  
 *  linejoin: "round",
 
 *  vertexColors: <bool>
 * }
 */

/*THREE.LineBasicMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );

	this.linewidth = parameters.linewidth !== undefined ? parameters.linewidth : 1;
	this.linecap = parameters.linecap !== undefined ? parameters.linecap : 'round';
	this.linejoin = parameters.linejoin !== undefined ? parameters.linejoin : 'round';

	this.vertexColors = parameters.vertexColors ? parameters.vertexColors : false;

};

THREE.LineBasicMaterial.prototype = new THREE.Material();
THREE.LineBasicMaterial.prototype.constructor = THREE.LineBasicMaterial;*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: false / THREE.VertexColors / THREE.FaceColors,
 *  skinning: <bool>
 * }
 */

THREE.MeshBasicMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.lightMap = parameters.lightMap !== undefined ? parameters.lightMap : null;

	this.envMap = parameters.envMap !== undefined ? parameters.envMap : null;
	this.combine = parameters.combine !== undefined ? parameters.combine : THREE.MultiplyOperation;
	this.reflectivity = parameters.reflectivity !== undefined ? parameters.reflectivity : 1;
	this.refractionRatio = parameters.refractionRatio !== undefined ? parameters.refractionRatio : 0.98;

	// this.enableFog = parameters.enableFog ? parameters.enableFog : true;

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;
	this.wireframeLinecap = parameters.wireframeLinecap !== undefined ? parameters.wireframeLinecap : 'round';
	this.wireframeLinejoin = parameters.wireframeLinejoin !== undefined ? parameters.wireframeLinejoin : 'round';

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : false;

	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false;
	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false;

};

THREE.MeshBasicMaterial.prototype = new THREE.Material();
THREE.MeshBasicMaterial.prototype.constructor = THREE.MeshBasicMaterial;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: false / THREE.VertexColors / THREE.FaceColors,
 *  skinning: <bool>
 * }
 */

/*THREE.MeshLambertMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.lightMap = parameters.lightMap !== undefined ? parameters.lightMap : null;

	this.envMap = parameters.envMap !== undefined ? parameters.envMap : null;
	this.combine = parameters.combine !== undefined ? parameters.combine : THREE.MultiplyOperation;
	this.reflectivity = parameters.reflectivity !== undefined ? parameters.reflectivity : 1;
	this.refractionRatio = parameters.refractionRatio !== undefined ? parameters.refractionRatio : 0.98;

	// this.enableFog = parameters.enableFog ? parameters.enableFog : true;

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;
	this.wireframeLinecap = parameters.wireframeLinecap !== undefined ? parameters.wireframeLinecap : 'round';
	this.wireframeLinejoin = parameters.wireframeLinejoin !== undefined ? parameters.wireframeLinejoin : 'round';

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : false;

	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false;
	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false;

};

THREE.MeshLambertMaterial.prototype = new THREE.Material();
THREE.MeshLambertMaterial.prototype.constructor = THREE.MeshLambertMaterial;*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  ambient: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: false / THREE.VertexColors / THREE.FaceColors,
 *  skinning: <bool>
 * }
 */

/*THREE.MeshPhongMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );
	this.ambient = parameters.ambient !== undefined ? new THREE.Color( parameters.ambient ) : new THREE.Color( 0x050505 );
	this.specular = parameters.specular !== undefined ? new THREE.Color( parameters.specular ) : new THREE.Color( 0x111111 );
	this.shininess = parameters.shininess !== undefined ? parameters.shininess : 30;

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.lightMap = parameters.lightMap !== undefined ? parameters.lightMap : null;

	this.envMap = parameters.envMap !== undefined ? parameters.envMap : null;
	this.combine = parameters.combine !== undefined ? parameters.combine : THREE.MultiplyOperation;
	this.reflectivity = parameters.reflectivity !== undefined ? parameters.reflectivity : 1;
	this.refractionRatio = parameters.refractionRatio !== undefined ? parameters.refractionRatio : 0.98;

	// this.enableFog = parameters.enableFog ? parameters.enableFog : true;

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;
	this.wireframeLinecap = parameters.wireframeLinecap !== undefined ? parameters.wireframeLinecap : 'round';
	this.wireframeLinejoin = parameters.wireframeLinejoin !== undefined ? parameters.wireframeLinejoin : 'round';

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : false;

	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false;
	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false;

};

THREE.MeshPhongMaterial.prototype = new THREE.Material();
THREE.MeshPhongMaterial.prototype.constructor = THREE.MeshPhongMaterial;*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  opacity: <float>,
 
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * } 
 */

/*THREE.MeshDepthMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading; // doesn't really apply here, normals are not used

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;

};

THREE.MeshDepthMaterial.prototype = new THREE.Material();
THREE.MeshDepthMaterial.prototype.constructor = THREE.MeshDepthMaterial;*/
/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 
 *  shading: THREE.FlatShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */

/*THREE.MeshNormalMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.shading = parameters.shading ? parameters.shading : THREE.FlatShading;

	this.wireframe = parameters.wireframe ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth ? parameters.wireframeLinewidth : 1;

};

THREE.MeshNormalMaterial.prototype = new THREE.Material();
THREE.MeshNormalMaterial.prototype.constructor = THREE.MeshNormalMaterial;*/
/**
 * @author mr.doob / http://mrdoob.com/
 */

/*THREE.MeshFaceMaterial = function () {

};*/
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  fragmentShader: <string>,
 *  vertexShader: <string>,
 
 *  uniforms: { "parameter1": { type: "f", value: 1.0 }, "parameter2": { type: "i" value2: 2 } },
 
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 
 *  lights: <bool>,
 *  vertexColors: <bool>,
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 * }
 */

/*THREE.MeshShaderMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.fragmentShader = parameters.fragmentShader !== undefined ? parameters.fragmentShader : "void main() {}";
	this.vertexShader = parameters.vertexShader !== undefined ? parameters.vertexShader : "void main() {}";
	this.uniforms = parameters.uniforms !== undefined ? parameters.uniforms : {};
	this.attributes = parameters.attributes;

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;

	this.fog = parameters.fog !== undefined ? parameters.fog : false; // set to use scene fog
	this.lights = parameters.lights !== undefined ? parameters.lights : false; // set to use scene lights
	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : false; // set to use "color" attribute stream
	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false; // set to use skinning attribute streams
	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false; // set to use morph targets

};

THREE.MeshShaderMaterial.prototype = new THREE.Material();
THREE.MeshShaderMaterial.prototype.constructor = THREE.MeshShaderMaterial;*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 
 *  size: <float>,
 
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  vertexColors: <bool>
 * }
 */

/*THREE.ParticleBasicMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.size = parameters.size !== undefined ? parameters.size : 1;
	this.sizeAttenuation = parameters.sizeAttenuation !== undefined ? parameters.sizeAttenuation : true;

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : false;

};

THREE.ParticleBasicMaterial.prototype = new THREE.Material();
THREE.ParticleBasicMaterial.prototype.constructor = THREE.ParticleBasicMaterial;*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 
 *  lightMap: new THREE.Texture( <Image> ),
 
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 
 *  vertexColors: <bool>,
 *  skinning: <bool>
 * }
 */

/*THREE.ShadowVolumeDynamicMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );

	parameters = parameters || {};

	this.color = parameters.color !== undefined ? new THREE.Color( parameters.color ) : new THREE.Color( 0xffffff );

	this.map = parameters.map !== undefined ? parameters.map : null;

	this.lightMap = parameters.lightMap !== undefined ? parameters.lightMap : null;

	this.envMap = parameters.envMap !== undefined ? parameters.envMap : null;
	this.combine = parameters.combine !== undefined ? parameters.combine : THREE.MultiplyOperation;
	this.reflectivity = parameters.reflectivity !== undefined ? parameters.reflectivity : 1;
	this.refractionRatio = parameters.refractionRatio !== undefined ? parameters.refractionRatio : 0.98;

	// this.enableFog = parameters.enableFog ? parameters.enableFog : true;

	this.shading = parameters.shading !== undefined ? parameters.shading : THREE.SmoothShading;

	this.wireframe = parameters.wireframe !== undefined ? parameters.wireframe : false;
	this.wireframeLinewidth = parameters.wireframeLinewidth !== undefined ? parameters.wireframeLinewidth : 1;
	this.wireframeLinecap = parameters.wireframeLinecap !== undefined ? parameters.wireframeLinecap : 'round';
	this.wireframeLinejoin = parameters.wireframeLinejoin !== undefined ? parameters.wireframeLinejoin : 'round';

	this.vertexColors = parameters.vertexColors !== undefined ? parameters.vertexColors : false;

	this.skinning = parameters.skinning !== undefined ? parameters.skinning : false;
	this.morphTargets = parameters.morphTargets !== undefined ? parameters.morphTargets : false;

};

THREE.ShadowVolumeDynamicMaterial.prototype = new THREE.Material();
THREE.ShadowVolumeDynamicMaterial.prototype.constructor = THREE.ShadowVolumeDynamicMaterial;*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */

THREE.Texture = function ( image, mapping, wrapS, wrapT, magFilter, minFilter ) {

	this.image = image;

	this.mapping = mapping !== undefined ? mapping : new THREE.UVMapping();

	this.wrapS = wrapS !== undefined ? wrapS : THREE.ClampToEdgeWrapping;
	this.wrapT = wrapT !== undefined ? wrapT : THREE.ClampToEdgeWrapping;

	this.magFilter = magFilter !== undefined ? magFilter : THREE.LinearFilter;
	this.minFilter = minFilter !== undefined ? minFilter : THREE.LinearMipMapLinearFilter;

	this.needsUpdate = false;

};

/*THREE.Texture.prototype = {

	clone: function () {

		return new THREE.Texture( this.image, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter );

	}

};*/

THREE.MultiplyOperation = 0;
THREE.MixOperation = 1;

// Wrapping modes

THREE.RepeatWrapping = 0;
THREE.ClampToEdgeWrapping = 1;
THREE.MirroredRepeatWrapping = 2;

// Filters

THREE.NearestFilter = 3;
THREE.NearestMipMapNearestFilter = 4;
THREE.NearestMipMapLinearFilter = 5;
THREE.LinearFilter = 6;
THREE.LinearMipMapNearestFilter = 7;
THREE.LinearMipMapLinearFilter = 8;

// Types

THREE.ByteType = 9;
THREE.UnsignedByteType = 10;
THREE.ShortType = 11;
THREE.UnsignedShortType = 12;
THREE.IntType = 13;
THREE.UnsignedIntType = 14;
THREE.FloatType = 15;

// Formats

THREE.AlphaFormat = 16;
THREE.RGBFormat = 17;
THREE.RGBAFormat = 18;
THREE.LuminanceFormat = 19;
THREE.LuminanceAlphaFormat = 20;
/**
 * @author mr.doob / http://mrdoob.com/
 */
/*
THREE.Particle = function ( materials ) {

	THREE.Object3D.call( this );

	this.materials = materials instanceof Array ? materials : [ materials ];

};

THREE.Particle.prototype = new THREE.Object3D();
THREE.Particle.prototype.constructor = THREE.Particle;*/
/**
 * @author alteredq / http://alteredqualia.com/
 */

/*THREE.ParticleSystem = function ( geometry, materials ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials instanceof Array ? materials : [ materials ];

	this.sortParticles = false;

};

THREE.ParticleSystem.prototype = new THREE.Object3D();
THREE.ParticleSystem.prototype.constructor = THREE.ParticleSystem;*/
/**
 * @author mr.doob / http://mrdoob.com/
 */

/*THREE.Line = function ( geometry, materials, type ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials instanceof Array ? materials : [ materials ];

	this.type = ( type != undefined ) ? type : THREE.LineStrip;

};

THREE.LineStrip = 0;
THREE.LinePieces = 1;

THREE.Line.prototype = new THREE.Object3D();
THREE.Line.prototype.constructor = THREE.Line;*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Mesh = function ( geometry, materials ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials && materials.length ? materials : [ materials ];

	this.flipSided = false;
	this.doubleSided = false;

	this.overdraw = false; // TODO: Move to material?


	if ( this.geometry ) {

		// calc bound radius

		if( !this.geometry.boundingSphere ) {

			this.geometry.computeBoundingSphere();

		}

		this.boundRadius = geometry.boundingSphere.radius;


		// setup morph targets

		if( this.geometry.morphTargets.length ) {

			this.morphTargetBase = -1;
			this.morphTargetForcedOrder = [];
			this.morphTargetInfluences = [];
			this.morphTargetDictionary = {};

			for( var m = 0; m < this.geometry.morphTargets.length; m++ ) {

				this.morphTargetInfluences.push( 0 );
				this.morphTargetDictionary[ this.geometry.morphTargets[ m ].name ] = m;

			}

		}

	}

}

THREE.Mesh.prototype = new THREE.Object3D();
THREE.Mesh.prototype.constructor = THREE.Mesh;
THREE.Mesh.prototype.supr = THREE.Object3D.prototype;


/*
 * Get Morph Target Index by Name
 */

/*THREE.Mesh.prototype.getMorphTargetIndexByName = function( name ) {

	if ( this.morphTargetDictionary[ name ] !== undefined ) {

		return this.morphTargetDictionary[ name ];
	}

	console.log( "THREE.Mesh.getMorphTargetIndexByName: morph target " + name + " does not exist. Returning 0." );	
	return 0;
}*/
/**
 * @author mikael emtinger / http://gomo.se/
 */

/*THREE.Bone = function( belongsToSkin ) {

	THREE.Object3D.call( this );

	this.skin = belongsToSkin;
	this.skinMatrix = new THREE.Matrix4();
	this.hasNoneBoneChildren = false;

};

THREE.Bone.prototype = new THREE.Object3D();
THREE.Bone.prototype.constructor = THREE.Bone;
THREE.Bone.prototype.supr = THREE.Object3D.prototype;*/


/*
 * Update
 */

/*THREE.Bone.prototype.update = function( parentSkinMatrix, forceUpdate, camera ) {

	// update local

	if ( this.matrixAutoUpdate ) {

		forceUpdate |= this.updateMatrix();

	}

	// update skin matrix

	if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

		if( parentSkinMatrix ) {

			this.skinMatrix.multiply( parentSkinMatrix, this.matrix );

		} else {

			this.skinMatrix.copy( this.matrix );

		}

		this.matrixWorldNeedsUpdate = false;
		forceUpdate = true;

	}

	// update children

	var child, i, l = this.children.length;

	if ( this.hasNoneBoneChildren ) {

		this.matrixWorld.multiply( this.skin.matrixWorld, this.skinMatrix );


		for ( i = 0; i < l; i++ ) {

			child = this.children[ i ];

			if ( ! ( child instanceof THREE.Bone ) ) {

				child.update( this.matrixWorld, true, camera );

			} else {

				child.update( this.skinMatrix, forceUpdate, camera );

			}

		}

	} else {

		for ( i = 0; i < l; i++ ) {

			this.children[ i ].update( this.skinMatrix, forceUpdate, camera );

		}

	}

};*/


/*
 * Add child
 */

/*THREE.Bone.prototype.addChild = function( child ) {

	if ( this.children.indexOf( child ) === - 1 ) {

		if ( child.parent !== undefined ) {

			child.parent.removeChild( child );

		}

		child.parent = this;
		this.children.push( child );

		if ( ! ( child instanceof THREE.Bone ) ) {

			this.hasNoneBoneChildren = true;

		}

	}

};*/

/*
 * TODO: Remove Children: see if any remaining are none-Bone
 */
/**
 * @author mikael emtinger / http://gomo.se/
 */

/*THREE.SkinnedMesh = function( geometry, materials ) {

	THREE.Mesh.call( this, geometry, materials );

	// init bones

	this.identityMatrix = new THREE.Matrix4();
	this.bones = [];
	this.boneMatrices = [];

	var b, bone, gbone, p, q, s;

	if ( this.geometry.bones !== undefined ) {

		for ( b = 0; b < this.geometry.bones.length; b++ ) {

			gbone = this.geometry.bones[ b ];

			p = gbone.pos;
			q = gbone.rotq;
			s = gbone.scl;

			bone = this.addBone();

			bone.name = gbone.name;
			bone.position.set( p[0], p[1], p[2] ); 
			bone.quaternion.set( q[0], q[1], q[2], q[3] );
			bone.useQuaternion = true;

			if ( s !== undefined ) {

				bone.scale.set( s[0], s[1], s[2] );

			} else {

				bone.scale.set( 1, 1, 1 );

			}

		}

		for ( b = 0; b < this.bones.length; b++ ) {

			gbone = this.geometry.bones[ b ];
			bone = this.bones[ b ];

			if ( gbone.parent === -1 ) {

				this.addChild( bone );

			} else {

				this.bones[ gbone.parent ].addChild( bone );

			}

		}

		this.boneMatrices = new Float32Array( 16 * this.bones.length );

		this.pose();

	}

};

THREE.SkinnedMesh.prototype = new THREE.Mesh();
THREE.SkinnedMesh.prototype.constructor = THREE.SkinnedMesh;*/


/*
 * Update
 */

/*THREE.SkinnedMesh.prototype.update = function ( parentMatrixWorld, forceUpdate, camera ) {

	// visible?

	if ( this.visible ) {

		// update local

		if ( this.matrixAutoUpdate ) {

			forceUpdate |= this.updateMatrix();

		}


		// update global

		if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

			if ( parentMatrixWorld ) {

				this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

			} else {

				this.matrixWorld.copy( this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;
			forceUpdate = true;

		}


		// update children

		var child, i, l = this.children.length;

		for ( i = 0; i < l; i++ ) {

			child = this.children[ i ];

			if ( child instanceof THREE.Bone ) {

				child.update( this.identityMatrix, false, camera );

			} else {

				child.update( this.matrixWorld, forceUpdate, camera );

			}

		}


		// flatten to array

		var b, bl = this.bones.length;
			ba = this.bones;
			bm = this.boneMatrices;

		for ( b = 0; b < bl; b++ ) {

			ba[ b ].skinMatrix.flattenToArrayOffset( bm, b * 16 );

		}

	}

};*/


/*
 * Add 
 */

/*THREE.SkinnedMesh.prototype.addBone = function( bone ) {

	if ( bone === undefined ) {

		bone = new THREE.Bone( this );

	}

	this.bones.push( bone );

	return bone;

};*/

/*
 * Pose
 */

/*THREE.SkinnedMesh.prototype.pose = function() {

	this.update( undefined, true );

	var bim, bone, boneInverses = [];

	for ( var b = 0; b < this.bones.length; b++ ) {

		bone = this.bones[ b ];

		boneInverses.push( THREE.Matrix4.makeInvert( bone.skinMatrix ) );

		bone.skinMatrix.flattenToArrayOffset( this.boneMatrices, b * 16 );

	}

	// project vertices to local 

	if ( this.geometry.skinVerticesA === undefined ) {

		this.geometry.skinVerticesA = [];
		this.geometry.skinVerticesB = [];

		var orgVertex, vertex;

		for ( var i = 0; i < this.geometry.skinIndices.length; i++ ) {

			orgVertex = this.geometry.vertices[ i ].position;

			var indexA = this.geometry.skinIndices[ i ].x;
			var indexB = this.geometry.skinIndices[ i ].y;

			vertex = new THREE.Vector3( orgVertex.x, orgVertex.y, orgVertex.z );
			this.geometry.skinVerticesA.push( boneInverses[ indexA ].multiplyVector3( vertex ) );

			vertex = new THREE.Vector3( orgVertex.x, orgVertex.y, orgVertex.z );
			this.geometry.skinVerticesB.push( boneInverses[ indexB ].multiplyVector3( vertex ) );

			// todo: add more influences

			// normalize weights

			if ( this.geometry.skinWeights[ i ].x + this.geometry.skinWeights[ i ].y !== 1 ) {

				var len = ( 1.0 - ( this.geometry.skinWeights[ i ].x + this.geometry.skinWeights[ i ].y )) * 0.5;
				this.geometry.skinWeights[ i ].x += len;
				this.geometry.skinWeights[ i ].y += len;

			}

		}

	}

};*/
/**
 * @author alteredq / http://alteredqualia.com/
 */

/*THREE.Ribbon = function ( geometry, materials ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.materials = materials instanceof Array ? materials : [ materials ];

	this.flipSided = false;
	this.doubleSided = false;

};

THREE.Ribbon.prototype = new THREE.Object3D();
THREE.Ribbon.prototype.constructor = THREE.Ribbon;*/
/**
 * @author mikael emtinger / http://gomo.se/
 */

/*THREE.Sound = function ( sources, radius, volume, loop ) {

	THREE.Object3D.call( this );

	this.isLoaded = false;
	this.isAddedToDOM = false;
	this.isPlaying = false;
	this.duration = -1;
	this.radius = radius !== undefined ? Math.abs( radius ) : 100;
	this.volume = Math.min( 1, Math.max( 0, volume !== undefined ? volume : 1 ) );

	this.domElement = document.createElement( 'audio' );
	this.domElement.volume = 0;
	this.domElement.pan = 0;
	this.domElement.loop = loop !== undefined ? loop : true;

	// init sources

	this.sources = sources instanceof Array ? sources : [ sources ];

	var element, source, type, s, sl = this.sources.length;

	for ( s = 0; s < sl; s++ ) {

		source = this.sources[ s ];
		source.toLowerCase();

		if ( source.indexOf( ".mp3" ) !== -1 ) {

			type = "audio/mpeg";

		} else if( source.indexOf( ".ogg" ) !== -1 ) {

			type = "audio/ogg";

		} else if( source.indexOf( ".wav" ) !== -1 ) {

			type = "audio/wav";

		}

		if ( this.domElement.canPlayType( type ) ) {

			element = document.createElement( "source" );
			element.src = this.sources[ s ];

			this.domElement.THREESound = this;
			this.domElement.appendChild( element );
			this.domElement.addEventListener( "canplay", this.onLoad, true );
			this.domElement.load();

			break;

		}

	}

};


THREE.Sound.prototype = new THREE.Object3D();
THREE.Sound.prototype.constructor = THREE.Sound;
THREE.Sound.prototype.supr = THREE.Object3D.prototype;


THREE.Sound.prototype.onLoad = function () {

	var sound = this.THREESound;

	if ( sound.isLoaded ) {

		return;

	}

	this.removeEventListener( "canplay", this.onLoad, true );

	sound.isLoaded = true;
	sound.duration = this.duration;

	if ( sound.isPlaying ) {

		sound.play();

	}

};

THREE.Sound.prototype.addToDOM = function ( parent ) {

	this.isAddedToDOM = true;
	parent.appendChild( this.domElement );

};

THREE.Sound.prototype.play = function ( startTime ) {

	this.isPlaying = true;

	if ( this.isLoaded ) {

		this.domElement.play();

		if ( startTime ) {

			this.domElement.currentTime = startTime % this.duration;

		}

	}

};

THREE.Sound.prototype.pause = function () {

	this.isPlaying = false;
	this.domElement.pause();

};

THREE.Sound.prototype.stop = function (){

	this.isPlaying = false;
	this.domElement.pause();
	this.domElement.currentTime = 0;

};

THREE.Sound.prototype.calculateVolumeAndPan = function ( cameraRelativePosition ) {

	var distance = cameraRelativePosition.length();

	if( distance <= this.radius ) {

		this.domElement.volume = this.volume * ( 1 - distance / this.radius );

	} else {

		this.domElement.volume = 0;

	}

};

THREE.Sound.prototype.update = function ( parentMatrixWorld, forceUpdate, camera ) {

	// update local (rotation/scale is not used)

	if ( this.matrixAutoUpdate ) {

		this.matrix.setPosition( this.position );
		forceUpdate = true;

	}

	// update global

	if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

		if ( parentMatrixWorld ) {

			this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

		} else {

			this.matrixWorld.copy( this.matrix );

		}

		this.matrixWorldNeedsUpdate = false;
		forceUpdate = true;

	}

	// update children

	var i, l = this.children.length;

	for ( i = 0; i < l; i++ ) {

		this.children[ i ].update( this.matrixWorld, forceUpdate, camera );

	}

};*/
/**
 * @author mikael emtinger / http://gomo.se/
 */

/*THREE.LOD = function() {

	THREE.Object3D.call( this );

	this.LODs = [];

};

THREE.LOD.prototype = new THREE.Object3D();
THREE.LOD.prototype.constructor = THREE.LOD;
THREE.LOD.prototype.supr = THREE.Object3D.prototype;*/

/*
 * Add
 */

/*THREE.LOD.prototype.add = function ( object3D, visibleAtDistance ) {

	if ( visibleAtDistance === undefined ) {

		visibleAtDistance = 0;

	}

	visibleAtDistance = Math.abs( visibleAtDistance );

	for ( var l = 0; l < this.LODs.length; l++ ) {

		if ( visibleAtDistance < this.LODs[ l ].visibleAtDistance ) {

			break;

		}

	}

	this.LODs.splice( l, 0, { visibleAtDistance: visibleAtDistance, object3D: object3D } );
	this.addChild( object3D );

};*/


/*
 * Update
 */

/*THREE.LOD.prototype.update = function ( parentMatrixWorld, forceUpdate, camera ) {

	// update local

	if ( this.matrixAutoUpdate ) {

		forceUpdate |= this.updateMatrix();

	}

	// update global

	if ( forceUpdate || this.matrixWorldNeedsUpdate ) {

		if ( parentMatrixWorld ) {

			this.matrixWorld.multiply( parentMatrixWorld, this.matrix );

		} else {

			this.matrixWorld.copy( this.matrix );

		}

		this.matrixWorldNeedsUpdate = false;
		forceUpdate = true;

	}


	// update LODs

	if ( this.LODs.length > 1 ) {


		var inverse  = camera.matrixWorldInverse;
		var radius   = this.boundRadius * this.boundRadiusScale;
		var distance = -( inverse.n31 * this.position.x + inverse.n32 * this.position.y + inverse.n33 * this.position.z + inverse.n34 );

		this.LODs[ 0 ].object3D.visible = true;

		for ( var l = 1; l < this.LODs.length; l++ ) {

			if( distance >= this.LODs[ l ].visibleAtDistance ) {

				this.LODs[ l - 1 ].object3D.visible = false;
				this.LODs[ l     ].object3D.visible = true;

			} else {

				break;

			}

		}

		for( ; l < this.LODs.length; l++ ) {

			this.LODs[ l ].object3D.visible = false;

		}

	}

	// update children

	for ( var c = 0; c < this.children.length; c++ ) {

		this.children[ c ].update( this.matrixWorld, forceUpdate, camera );

	}


};*/
/**
 * @author mikael emtinger / http://gomo.se/
 */

/*THREE.ShadowVolume = function( meshOrGeometry, isStatic ) {

	if( meshOrGeometry instanceof THREE.Mesh ) {

		THREE.Mesh.call( this, meshOrGeometry.geometry, isStatic ? [ new THREE.ShadowVolumeDynamicMaterial() ] : [ new THREE.ShadowVolumeDynamicMaterial() ] );
		meshOrGeometry.addChild( this );

	} else {

		THREE.Mesh.call( this, meshOrGeometry, isStatic ? [ new THREE.ShadowVolumeDynamicMaterial() ] : [ new THREE.ShadowVolumeDynamicMaterial() ] );

	}

	this.calculateShadowVolumeGeometry();

};

THREE.ShadowVolume.prototype             = new THREE.Mesh();
THREE.ShadowVolume.prototype.constructor = THREE.ShadowVolume;
THREE.ShadowVolume.prototype.supr        = THREE.Mesh.prototype;*/


/*
 * Calculate Shadow Faces
 */

/*THREE.ShadowVolume.prototype.calculateShadowVolumeGeometry = function() {

	if ( this.geometry.edges && this.geometry.edges.length ) {

		var f, fl, face, faceA, faceB, faceAIndex, faceBIndex, vertexA, vertexB;
		var faceACombination, faceBCombination;
		var faceAvertexAIndex, faceAvertexBIndex, faceBvertexAIndex, faceBvertexBIndex;
		var e, el, edge, temp;

		var newGeometry = new THREE.Geometry();
		var vertices = newGeometry.vertices = this.geometry.vertices;
		var faces = newGeometry.faces = this.geometry.faces;
		var edges = newGeometry.egdes = this.geometry.edges;
		var edgeFaces = newGeometry.edgeFaces = [];

		var vertexOffset = 0;
		var vertexOffsetPerFace = [];

		for( f = 0, fl = faces.length; f < fl; f++ ) {

			face = faces[ f ];

			// calculate faces vertex offset

			vertexOffsetPerFace.push( vertexOffset );
			vertexOffset += face instanceof THREE.Face3 ? 3 : 4;

			// set vertex normals to face normal

			face.vertexNormals[ 0 ] = face.normal;
			face.vertexNormals[ 1 ] = face.normal;
			face.vertexNormals[ 2 ] = face.normal;

			if( face instanceof THREE.Face4 ) face.vertexNormals[ 3 ] = face.normal;

		}


		// setup edge faces

		for( e = 0, el = edges.length; e < el; e++ ) {

			edge = edges[ e ];

			faceA = edge.faces[ 0 ];
			faceB = edge.faces[ 1 ];

			faceAIndex = edge.faceIndices[ 0 ];
			faceBIndex = edge.faceIndices[ 1 ];

			vertexA = edge.vertexIndices[ 0 ];
			vertexB = edge.vertexIndices[ 1 ];

			// find combination and processed vertex index (vertices are split up by renderer)

			     if( faceA.a === vertexA ) { faceACombination = "a"; faceAvertexAIndex = vertexOffsetPerFace[ faceAIndex ] + 0; }
			else if( faceA.b === vertexA ) { faceACombination = "b"; faceAvertexAIndex = vertexOffsetPerFace[ faceAIndex ] + 1; }
			else if( faceA.c === vertexA ) { faceACombination = "c"; faceAvertexAIndex = vertexOffsetPerFace[ faceAIndex ] + 2; }
			else if( faceA.d === vertexA ) { faceACombination = "d"; faceAvertexAIndex = vertexOffsetPerFace[ faceAIndex ] + 3; }

			     if( faceA.a === vertexB ) { faceACombination += "a"; faceAvertexBIndex = vertexOffsetPerFace[ faceAIndex ] + 0; }
			else if( faceA.b === vertexB ) { faceACombination += "b"; faceAvertexBIndex = vertexOffsetPerFace[ faceAIndex ] + 1; }
			else if( faceA.c === vertexB ) { faceACombination += "c"; faceAvertexBIndex = vertexOffsetPerFace[ faceAIndex ] + 2; }
			else if( faceA.d === vertexB ) { faceACombination += "d"; faceAvertexBIndex = vertexOffsetPerFace[ faceAIndex ] + 3; }

			     if( faceB.a === vertexA ) { faceBCombination = "a"; faceBvertexAIndex = vertexOffsetPerFace[ faceBIndex ] + 0; }
			else if( faceB.b === vertexA ) { faceBCombination = "b"; faceBvertexAIndex = vertexOffsetPerFace[ faceBIndex ] + 1; }
			else if( faceB.c === vertexA ) { faceBCombination = "c"; faceBvertexAIndex = vertexOffsetPerFace[ faceBIndex ] + 2; }
 			else if( faceB.d === vertexA ) { faceBCombination = "d"; faceBvertexAIndex = vertexOffsetPerFace[ faceBIndex ] + 3; }

			     if( faceB.a === vertexB ) { faceBCombination += "a"; faceBvertexBIndex = vertexOffsetPerFace[ faceBIndex ] + 0; }
			else if( faceB.b === vertexB ) { faceBCombination += "b"; faceBvertexBIndex = vertexOffsetPerFace[ faceBIndex ] + 1; }
			else if( faceB.c === vertexB ) { faceBCombination += "c"; faceBvertexBIndex = vertexOffsetPerFace[ faceBIndex ] + 2; }
			else if( faceB.d === vertexB ) { faceBCombination += "d"; faceBvertexBIndex = vertexOffsetPerFace[ faceBIndex ] + 3; }

			if( faceACombination === "ac" ||
				faceACombination === "ad" ||
				faceACombination === "ca" ||
				faceACombination === "da" ) {

				if( faceAvertexAIndex > faceAvertexBIndex ) {

					temp = faceAvertexAIndex;
					faceAvertexAIndex = faceAvertexBIndex;
					faceAvertexBIndex = temp;

				}

			} else {

				if( faceAvertexAIndex < faceAvertexBIndex ) {

					temp = faceAvertexAIndex;
					faceAvertexAIndex = faceAvertexBIndex;
					faceAvertexBIndex = temp;

				}

			}

			if( faceBCombination === "ac" ||
				faceBCombination === "ad" ||
				faceBCombination === "ca" ||
				faceBCombination === "da" ) {

				if( faceBvertexAIndex > faceBvertexBIndex ) {

					temp = faceBvertexAIndex;
					faceBvertexAIndex = faceBvertexBIndex;
					faceBvertexBIndex = temp;

				}

			} else {

				if( faceBvertexAIndex < faceBvertexBIndex ) {

					temp = faceBvertexAIndex;
					faceBvertexAIndex = faceBvertexBIndex;
					faceBvertexBIndex = temp;

				}

			}

			face = new THREE.Face4( faceAvertexAIndex, faceAvertexBIndex, faceBvertexAIndex, faceBvertexBIndex );
			face.normal.set( 1, 0, 0 );
			edgeFaces.push( face );

		}

		this.geometry = newGeometry;

	} else {

		this.calculateShadowVolumeGeometryWithoutEdgeInfo( this.geometry );

	}
}


THREE.ShadowVolume.prototype.calculateShadowVolumeGeometryWithoutEdgeInfo = function( originalGeometry ) {

	// create geometry

	this.geometry = new THREE.Geometry();
	this.geometry.boundingSphere = originalGeometry.boundingSphere;
	this.geometry.edgeFaces = [];

	// copy vertices / faces from original mesh

	var vertexTypes = this.geometry.vertexTypes;
	var vertices    = this.geometry.vertices;
	var	faces       = this.geometry.faces;
	var edgeFaces   = this.geometry.edgeFaces;

	var originalFaces    = originalGeometry.faces;
	var originalVertices = originalGeometry.vertices;
	var	fl               = originalFaces.length;

	var	originalFace, face, i, f, n, vertex, numVertices;
	var indices = [ "a", "b", "c", "d" ];


	for( f = 0; f < fl; f++ ) {

		numVertices = vertices.length;
		originalFace = originalFaces[ f ];

		if ( originalFace instanceof THREE.Face4 ) {

			n = 4;
			face = new THREE.Face4( numVertices, numVertices + 1, numVertices + 2, numVertices + 3 );

		} else {

          	n = 3;
			face = new THREE.Face3( numVertices, numVertices + 1, numVertices + 2 );

		}

		face.normal.copy( originalFace.normal );
		faces.push( face );


		for( i = 0; i < n; i++ ) {

			vertex = originalVertices[ originalFace[ indices[ i ]]];
			vertices.push( new THREE.Vertex( vertex.position.clone()));

		}

	}


	// calculate edge faces

	var result, faceA, faceB, v, vl;

	for( var fa = 0; fa < originalFaces.length - 1; fa++ ) {

		faceA = faces[ fa ];

		for( var fb = fa + 1; fb < originalFaces.length; fb++ ) {

			faceB = faces[ fb ];
			result = this.facesShareEdge( vertices, faceA, faceB );

			if( result !== undefined ) {

				numVertices = vertices.length;
				face = new THREE.Face4( result.indices[ 0 ], result.indices[ 3 ], result.indices[ 2 ], result.indices[ 1 ] );
				face.normal.set( 1, 0, 0 );
				edgeFaces.push( face );

			}

		}

	}

};


THREE.ShadowVolume.prototype.facesShareEdge = function( vertices, faceA, faceB ) {

	var indicesA,
		indicesB,
		indexA,
		indexB,
		vertexA,
		vertexB,
		savedVertexA,
		savedVertexB,
		savedIndexA,
		savedIndexB,
		indexLetters,
		a, b,
		numMatches = 0,
		indices = [ "a", "b", "c", "d" ];

	if( faceA instanceof THREE.Face4 ) indicesA = 4;
	else                               indicesA = 3;

	if( faceB instanceof THREE.Face4 ) indicesB = 4;
	else                               indicesB = 3;


	for( a = 0; a < indicesA; a++ ) {

		indexA  = faceA[ indices[ a ] ];
		vertexA = vertices[ indexA ];

		for( b = 0; b < indicesB; b++ ) {

			indexB  = faceB[ indices[ b ] ];
			vertexB = vertices[ indexB ];

			if( Math.abs( vertexA.position.x - vertexB.position.x ) < 0.0001 &&
				Math.abs( vertexA.position.y - vertexB.position.y ) < 0.0001 &&
				Math.abs( vertexA.position.z - vertexB.position.z ) < 0.0001 ) {

				numMatches++;

				if( numMatches === 1 ) {

 					savedVertexA = vertexA;
 					savedVertexB = vertexB;
					savedIndexA  = indexA;
					savedIndexB  = indexB;
					indexLetters = indices[ a ];

				}

				if( numMatches === 2 ) {

					indexLetters += indices[ a ];

					if( indexLetters === "ad" || indexLetters === "ac" ) {

						return {

							faces   	: [ faceA, faceB ],
							vertices	: [ savedVertexA, savedVertexB, vertexB, vertexA  ],
							indices		: [ savedIndexA,  savedIndexB,  indexB,  indexA   ],
							vertexTypes	: [ 1, 2, 2, 1 ],
							extrudable	: true

						};

					} else {

						return {

							faces   	: [ faceA, faceB ],
							vertices	: [ savedVertexA, vertexA, vertexB, savedVertexB ],
							indices		: [ savedIndexA,  indexA,  indexB,  savedIndexB  ],
							vertexTypes	: [ 1, 1, 2, 2 ],
							extrudable	: true

						};

					}

				}

			}

		}

	}

	return undefined;

};*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Scene = function () {

	THREE.Object3D.call( this );

	this.matrixAutoUpdate = false;

	//this.fog = null;

	//this.collisions = null;
	
	this.objects = [];
	//this.lights = [];
	//this.sounds = [];

	this.__objectsAdded = [];
	//this.__objectsRemoved = [];

};

THREE.Scene.prototype = new THREE.Object3D();
THREE.Scene.prototype.constructor = THREE.Scene;
THREE.Scene.prototype.supr = THREE.Object3D.prototype;

THREE.Scene.prototype.addChild = function( child ) {

	this.supr.addChild.call( this, child );
	this.addChildRecurse( child );

}

THREE.Scene.prototype.addChildRecurse = function( child ) {

	/*if ( child instanceof THREE.Light ) {

		if ( this.lights.indexOf( child ) === -1 ) {

			this.lights.push( child );

		}

	} else if ( child instanceof THREE.Sound ) {

		if ( this.sounds.indexOf( child ) === -1 ) {

			this.sounds.push( child );

		}

	} else*/ if ( !( child instanceof THREE.Camera /*|| child instanceof THREE.Bone */) ) {

		if ( this.objects.indexOf( child ) === -1 ) {

			this.objects.push( child );
			this.__objectsAdded.push( child );

		}

	}

	for ( var c = 0; c < child.children.length; c++ ) {

		this.addChildRecurse( child.children[ c ] );

	}

}


/*THREE.Scene.prototype.removeChild = function( child ) {

	this.supr.removeChild.call( this, child );
	this.removeChildRecurse( child );

}*/

/*THREE.Scene.prototype.removeChildRecurse = function( child ) {

	if ( child instanceof THREE.Light ) {

		var i = this.lights.indexOf( child );

		if ( i !== -1 ) {

			this.lights.splice( i, 1 );

		}

	} else if ( child instanceof THREE.Sound ) {

		var i = this.sounds.indexOf( child );

		if( i !== -1 ) {

			this.sounds.splice( i, 1 );

		}

	} else if ( !( child instanceof THREE.Camera ) ) {

		var i = this.objects.indexOf( child );

		if( i !== -1 ) {

			this.objects.splice( i, 1 );
			this.__objectsRemoved.push( child );

		}

	}

	for ( var c = 0; c < child.children.length; c++ ) {

		this.removeChildRecurse( child.children[ c ] );

	}

}*/

THREE.Scene.prototype.addObject = THREE.Scene.prototype.addChild;
//THREE.Scene.prototype.removeObject = THREE.Scene.prototype.removeChild;
//THREE.Scene.prototype.addLight = THREE.Scene.prototype.addChild;
//THREE.Scene.prototype.removeLight = THREE.Scene.prototype.removeChild;
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
/*
THREE.Fog = function ( hex, near, far ) {

	this.color = new THREE.Color( hex );
	this.near = near || 1;
	this.far = far || 1000;

};*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

/*THREE.FogExp2 = function ( hex, density ) {

	this.color = new THREE.Color( hex );
	this.density = ( density !== undefined ) ? density : 0.00025;

};*/
/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */

/*THREE.Projector = function() {

	var _object, _objectCount, _objectPool = [],
	_vertex, _vertexCount, _vertexPool = [],
	_face, _face3Count, _face3Pool = [], _face4Count, _face4Pool = [],
	_line, _lineCount, _linePool = [],
	_particle, _particleCount, _particlePool = [],

	_vector3 = new THREE.Vector4(),
	_vector4 = new THREE.Vector4(),
	_projScreenMatrix = new THREE.Matrix4(),
	_projScreenObjectMatrix = new THREE.Matrix4(),

	_frustum = [
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4()
	 ],

	_clippedVertex1PositionScreen = new THREE.Vector4(),
	_clippedVertex2PositionScreen = new THREE.Vector4(),

	_face3VertexNormals;


	this.projectVector = function ( vector, camera ) {

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
		_projScreenMatrix.multiplyVector3( vector );

		return vector;

	};

	this.unprojectVector = function ( vector, camera ) {

		_projScreenMatrix.multiply( camera.matrixWorld, THREE.Matrix4.makeInvert( camera.projectionMatrix ) );
		_projScreenMatrix.multiplyVector3( vector );

		return vector;

	};

	this.projectObjects = function ( scene, camera, sort ) {

		var renderList = [],
		o, ol, objects, object, matrix;

		_objectCount = 0;

		objects = scene.objects;

		for ( o = 0, ol = objects.length; o < ol; o ++ ) {

			object = objects[ o ];

			if ( !object.visible || ( object instanceof THREE.Mesh && !isInFrustum( object ) ) ) continue;

			_object = getNextObjectInPool();

			_vector3.copy( object.position );
			_projScreenMatrix.multiplyVector3( _vector3 );

			_object.object = object;
			_object.z = _vector3.z;

			renderList.push( _object );

		}

		sort && renderList.sort( painterSort );

		return renderList;

	};

	// TODO: Rename to projectElements?

	this.projectScene = function ( scene, camera, sort ) {

		var renderList = [], near = camera.near, far = camera.far,
		o, ol, v, vl, f, fl, n, nl, c, cl, u, ul, objects, object,
		objectMatrix, objectMatrixRotation, objectMaterials, objectOverdraw,
		geometry, vertices, vertex, vertexPositionScreen,
		faces, face, faceVertexNormals, normal, faceVertexUvs, uvs,
		v1, v2, v3, v4;

		_face3Count = 0;
		_face4Count = 0;
		_lineCount = 0;
		_particleCount = 0;
	
		camera.matrixAutoUpdate && camera.update( undefined, true );

		scene.update( undefined, false, camera );

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
		computeFrustum( _projScreenMatrix );

		objects = this.projectObjects( scene, camera, true );

		for ( o = 0, ol = objects.length; o < ol; o++ ) {

			object = objects[ o ].object;

			if ( !object.visible ) continue;

			objectMatrix = object.matrixWorld;
			objectMatrixRotation = object.matrixRotationWorld;

			objectMaterials = object.materials;
			objectOverdraw = object.overdraw;

			_vertexCount = 0;

			if ( object instanceof THREE.Mesh ) {

				geometry = object.geometry;
				vertices = geometry.vertices;
				faces = geometry.faces;
				faceVertexUvs = geometry.faceVertexUvs;

				for ( v = 0, vl = vertices.length; v < vl; v ++ ) {

					_vertex = getNextVertexInPool();
					_vertex.positionWorld.copy( vertices[ v ].position );

					objectMatrix.multiplyVector3( _vertex.positionWorld );

					_vertex.positionScreen.copy( _vertex.positionWorld );
					_projScreenMatrix.multiplyVector4( _vertex.positionScreen );

					_vertex.positionScreen.x /= _vertex.positionScreen.w;
					_vertex.positionScreen.y /= _vertex.positionScreen.w;

					_vertex.visible = _vertex.positionScreen.z > near && _vertex.positionScreen.z < far;

				}

				for ( f = 0, fl = faces.length; f < fl; f ++ ) {

					face = faces[ f ];

					if ( face instanceof THREE.Face3 ) {

						v1 = _vertexPool[ face.a ];
						v2 = _vertexPool[ face.b ];
						v3 = _vertexPool[ face.c ];

						if ( v1.visible && v2.visible && v3.visible &&
							( object.doubleSided || ( object.flipSided !=
							( v3.positionScreen.x - v1.positionScreen.x ) * ( v2.positionScreen.y - v1.positionScreen.y ) -
							( v3.positionScreen.y - v1.positionScreen.y ) * ( v2.positionScreen.x - v1.positionScreen.x ) < 0 ) ) ) {

							_face = getNextFace3InPool();

							_face.v1.copy( v1 );
							_face.v2.copy( v2 );
							_face.v3.copy( v3 );

						} else {

							continue;

						}

					} else if ( face instanceof THREE.Face4 ) {

						v1 = _vertexPool[ face.a ];
						v2 = _vertexPool[ face.b ];
						v3 = _vertexPool[ face.c ];
						v4 = _vertexPool[ face.d ];

						if ( v1.visible && v2.visible && v3.visible && v4.visible &&
							( object.doubleSided || ( object.flipSided !=
							( ( v4.positionScreen.x - v1.positionScreen.x ) * ( v2.positionScreen.y - v1.positionScreen.y ) -
							( v4.positionScreen.y - v1.positionScreen.y ) * ( v2.positionScreen.x - v1.positionScreen.x ) < 0 ||
							( v2.positionScreen.x - v3.positionScreen.x ) * ( v4.positionScreen.y - v3.positionScreen.y ) -
							( v2.positionScreen.y - v3.positionScreen.y ) * ( v4.positionScreen.x - v3.positionScreen.x ) < 0 ) ) ) ) {

							_face = getNextFace4InPool();

							_face.v1.copy( v1 );
							_face.v2.copy( v2 );
							_face.v3.copy( v3 );
							_face.v4.copy( v4 );

						} else {

							continue;

						}

					}

					_face.normalWorld.copy( face.normal );
					objectMatrixRotation.multiplyVector3( _face.normalWorld );

					_face.centroidWorld.copy( face.centroid );
					objectMatrix.multiplyVector3( _face.centroidWorld );

					_face.centroidScreen.copy( _face.centroidWorld );
					_projScreenMatrix.multiplyVector3( _face.centroidScreen );

					faceVertexNormals = face.vertexNormals;

					for ( n = 0, nl = faceVertexNormals.length; n < nl; n ++ ) {

						normal = _face.vertexNormalsWorld[ n ];
						normal.copy( faceVertexNormals[ n ] );
						objectMatrixRotation.multiplyVector3( normal );

					}

					for ( c = 0, cl = faceVertexUvs.length; c < cl; c ++ ) {

						uvs = faceVertexUvs[ c ][ f ];

						if ( !uvs ) continue;

						for ( u = 0, ul = uvs.length; u < ul; u ++ ) {

							_face.uvs[ c ][ u ] = uvs[ u ];

						}

					}

					_face.meshMaterials = objectMaterials;
					_face.faceMaterials = face.materials;
					_face.overdraw = objectOverdraw;

					_face.z = _face.centroidScreen.z;

					renderList.push( _face );

				}

			} else if ( object instanceof THREE.Line ) {

				_projScreenObjectMatrix.multiply( _projScreenMatrix, objectMatrix );

				vertices = object.geometry.vertices;

				v1 = getNextVertexInPool();
				v1.positionScreen.copy( vertices[ 0 ].position );
				_projScreenObjectMatrix.multiplyVector4( v1.positionScreen );

				for ( v = 1, vl = vertices.length; v < vl; v++ ) {

					v1 = getNextVertexInPool();
					v1.positionScreen.copy( vertices[ v ].position );
					_projScreenObjectMatrix.multiplyVector4( v1.positionScreen );

					v2 = _vertexPool[ _vertexCount - 2 ];

					_clippedVertex1PositionScreen.copy( v1.positionScreen );
					_clippedVertex2PositionScreen.copy( v2.positionScreen );

					if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) ) {

						// Perform the perspective divide
						_clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
						_clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );

						_line = getNextLineInPool();
						_line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
						_line.v2.positionScreen.copy( _clippedVertex2PositionScreen );

						_line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );

						_line.materials = object.materials;

						renderList.push( _line );

					}
				}

			} else if ( object instanceof THREE.Particle ) {

				_vector4.set( object.matrixWorld.n14, object.matrixWorld.n24, object.matrixWorld.n34, 1 );
				_projScreenMatrix.multiplyVector4( _vector4 );

				_vector4.z /= _vector4.w;

				if ( _vector4.z > 0 && _vector4.z < 1 ) {

					_particle = getNextParticleInPool();
					_particle.x = _vector4.x / _vector4.w;
					_particle.y = _vector4.y / _vector4.w;
					_particle.z = _vector4.z;

					_particle.rotation = object.rotation.z;

					_particle.scale.x = object.scale.x * Math.abs( _particle.x - ( _vector4.x + camera.projectionMatrix.n11 ) / ( _vector4.w + camera.projectionMatrix.n14 ) );
					_particle.scale.y = object.scale.y * Math.abs( _particle.y - ( _vector4.y + camera.projectionMatrix.n22 ) / ( _vector4.w + camera.projectionMatrix.n24 ) );

					_particle.materials = object.materials;

					renderList.push( _particle );

				}

			}

		}

		sort && renderList.sort( painterSort );

		return renderList;

	};

	// Pools

	function getNextObjectInPool() {

		var object = _objectPool[ _objectCount ] = _objectPool[ _objectCount ] || new THREE.RenderableObject();

		_objectCount ++;

		return object;

	}

	function getNextVertexInPool() {

		var vertex = _vertexPool[ _vertexCount ] = _vertexPool[ _vertexCount ] || new THREE.RenderableVertex();

		_vertexCount ++;

		return vertex;

	}

	function getNextFace3InPool() {

		var face = _face3Pool[ _face3Count ] = _face3Pool[ _face3Count ] || new THREE.RenderableFace3();

		_face3Count ++;

		return face;

	}

	function getNextFace4InPool() {

		var face = _face4Pool[ _face4Count ] = _face4Pool[ _face4Count ] || new THREE.RenderableFace4();

		_face4Count ++;

		return face;

	}

	function getNextLineInPool() {

		var line = _linePool[ _lineCount ] = _linePool[ _lineCount ] || new THREE.RenderableLine();

		_lineCount ++;

		return line;

	}

	function getNextParticleInPool() {

		var particle = _particlePool[ _particleCount ] = _particlePool[ _particleCount ] || new THREE.RenderableParticle();
		_particleCount ++;
		return particle;

	}

	//

	function painterSort( a, b ) {

		return b.z - a.z;

	}

	function computeFrustum( m ) {

		_frustum[ 0 ].set( m.n41 - m.n11, m.n42 - m.n12, m.n43 - m.n13, m.n44 - m.n14 );
		_frustum[ 1 ].set( m.n41 + m.n11, m.n42 + m.n12, m.n43 + m.n13, m.n44 + m.n14 );
		_frustum[ 2 ].set( m.n41 + m.n21, m.n42 + m.n22, m.n43 + m.n23, m.n44 + m.n24 );
		_frustum[ 3 ].set( m.n41 - m.n21, m.n42 - m.n22, m.n43 - m.n23, m.n44 - m.n24 );
		_frustum[ 4 ].set( m.n41 - m.n31, m.n42 - m.n32, m.n43 - m.n33, m.n44 - m.n34 );
		_frustum[ 5 ].set( m.n41 + m.n31, m.n42 + m.n32, m.n43 + m.n33, m.n44 + m.n34 );

		for ( var i = 0; i < 6; i ++ ) {

			var plane = _frustum[ i ];
			plane.divideScalar( Math.sqrt( plane.x * plane.x + plane.y * plane.y + plane.z * plane.z ) );

		}

	}

	function isInFrustum( object ) {

		var distance, matrix = object.matrixWorld,
		radius = - object.geometry.boundingSphere.radius * Math.max( object.scale.x, Math.max( object.scale.y, object.scale.z ) );

		for ( var i = 0; i < 6; i ++ ) {

			distance = _frustum[ i ].x * matrix.n14 + _frustum[ i ].y * matrix.n24 + _frustum[ i ].z * matrix.n34 + _frustum[ i ].w;
			if ( distance <= radius ) return false;

		}

		return true;

	};

	function clipLine( s1, s2 ) {

		var alpha1 = 0, alpha2 = 1,

		// Calculate the boundary coordinate of each vertex for the near and far clip planes,
		// Z = -1 and Z = +1, respectively.
		bc1near =  s1.z + s1.w,
		bc2near =  s2.z + s2.w,
		bc1far =  - s1.z + s1.w,
		bc2far =  - s2.z + s2.w;

		if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {

			// Both vertices lie entirely within all clip planes.
			return true;

		} else if ( ( bc1near < 0 && bc2near < 0) || (bc1far < 0 && bc2far < 0 ) ) {

			// Both vertices lie entirely outside one of the clip planes.
			return false;

		} else {

			// The line segment spans at least one clip plane.

			if ( bc1near < 0 ) {

				// v1 lies outside the near plane, v2 inside
				alpha1 = Math.max( alpha1, bc1near / ( bc1near - bc2near ) );

			} else if ( bc2near < 0 ) {

				// v2 lies outside the near plane, v1 inside
				alpha2 = Math.min( alpha2, bc1near / ( bc1near - bc2near ) );

			}

			if ( bc1far < 0 ) {

				// v1 lies outside the far plane, v2 inside
				alpha1 = Math.max( alpha1, bc1far / ( bc1far - bc2far ) );

			} else if ( bc2far < 0 ) {

				// v2 lies outside the far plane, v2 inside
				alpha2 = Math.min( alpha2, bc1far / ( bc1far - bc2far ) );

			}

			if ( alpha2 < alpha1 ) {

				// The line segment spans two boundaries, but is outside both of them.
				// (This can't happen when we're only clipping against just near/far but good
				//  to leave the check here for future usage if other clip planes are added.)
				return false;

			} else {

				// Update the s1 and s2 vertices to match the clipped line segment.
				s1.lerpSelf( s2, alpha1 );
				s2.lerpSelf( s1, 1 - alpha2 );

				return true;

			}

		}

	}

};*/
/**
 * @author mikael emtinger / http://gomo.se/
 */

/*THREE.SoundRenderer = function() {

	this.volume = 1;
	this.domElement = document.createElement( "div" );
	this.domElement.id = "THREESound";

	this.cameraPosition = new THREE.Vector3();
	this.soundPosition = new THREE.Vector3();

	this.render = function ( scene, camera, callSceneUpdate ) {

		if ( callSceneUpdate ) {

			scene.update( undefined, false, camera );

		}

		var sound;
		var sounds = scene.sounds;
		var s, l = sounds.length;

		for ( s = 0; s < l; s++ ) {

			sound = sounds[ s ];

			this.soundPosition.set(

				sound.matrixWorld.n14,
				sound.matrixWorld.n24,
				sound.matrixWorld.n34

			);

			this.soundPosition.subSelf( camera.position );

			if( sound.isPlaying && sound.isLoaded ) {

				if ( !sound.isAddedToDOM ) {

					sound.addToDOM( this.domElement );

				}

				sound.calculateVolumeAndPan( this.soundPosition );

			}

		}

	}

}*/
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.ShaderChunk = {


	// FOG

	/*fog_pars_fragment: [

	"#ifdef USE_FOG",

		"uniform vec3 fogColor;",

		"#ifdef FOG_EXP2",
			"uniform float fogDensity;",
		"#else",
			"uniform float fogNear;",
			"uniform float fogFar;",
		"#endif",

	"#endif"

	].join("\n"),

	fog_fragment: [

	"#ifdef USE_FOG",

		"float depth = gl_FragCoord.z / gl_FragCoord.w;",

		"#ifdef FOG_EXP2",
			"const float LOG2 = 1.442695;",
			"float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );",
			"fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );",
		"#else",
			"float fogFactor = smoothstep( fogNear, fogFar, depth );",
		"#endif",

		"gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );",

	"#endif"

	].join("\n"),*/

	// ENVIRONMENT MAP

	/*envmap_pars_fragment: [

	"#ifdef USE_ENVMAP",

		"varying vec3 vReflect;",
		"uniform float reflectivity;",
		"uniform samplerCube envMap;",
		"uniform int combine;",

	"#endif"

	].join("\n"),

	envmap_fragment: [

	"#ifdef USE_ENVMAP",

		"vec4 cubeColor = textureCube( envMap, vec3( -vReflect.x, vReflect.yz ) );",

		"if ( combine == 1 ) {",

			//"gl_FragColor = mix( gl_FragColor, cubeColor, reflectivity );",
			"gl_FragColor = vec4( mix( gl_FragColor.xyz, cubeColor.xyz, reflectivity ), opacity );",

		"} else {",

			"gl_FragColor = gl_FragColor * cubeColor;",

		"}",

	"#endif"

	].join("\n"),

	envmap_pars_vertex: [

	"#ifdef USE_ENVMAP",

		"varying vec3 vReflect;",
		"uniform float refractionRatio;",
		"uniform bool useRefract;",

	"#endif"

	].join("\n"),

	envmap_vertex : [

	"#ifdef USE_ENVMAP",

		"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
		"vec3 nWorld = mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal;",

		"if ( useRefract ) {",

			"vReflect = refract( normalize( mPosition.xyz - cameraPosition ), normalize( nWorld.xyz ), refractionRatio );",

		"} else {",

			"vReflect = reflect( normalize( mPosition.xyz - cameraPosition ), normalize( nWorld.xyz ) );",

		"}",

	"#endif"

	].join("\n"),*/

	// COLOR MAP (particles)

	/*map_particle_pars_fragment: [

	"#ifdef USE_MAP",

		"uniform sampler2D map;",

	"#endif"

	].join("\n"),


	map_particle_fragment: [

	"#ifdef USE_MAP",

		"gl_FragColor = gl_FragColor * texture2D( map, gl_PointCoord );",

	"#endif"

	].join("\n"),*/

	// COLOR MAP (triangles)

	map_pars_fragment: [

	"#ifdef USE_MAP",

		"varying vec2 vUv;",
		"uniform sampler2D map;",

	"#endif"

	].join("\n"),

	map_pars_vertex: [

	"#ifdef USE_MAP",

		"varying vec2 vUv;",

	"#endif"

	].join("\n"),

	map_fragment: [

	"#ifdef USE_MAP",

		"gl_FragColor = gl_FragColor * texture2D( map, vUv );",

	"#endif"

	].join("\n"),

	map_vertex: [

	"#ifdef USE_MAP",

		"vUv = uv;",

	"#endif"

	].join("\n"),

	// LIGHT MAP

	/*lightmap_pars_fragment: [

	"#ifdef USE_LIGHTMAP",

		"varying vec2 vUv2;",
		"uniform sampler2D lightMap;",

	"#endif"

	].join("\n"),

	lightmap_pars_vertex: [

	"#ifdef USE_LIGHTMAP",

		"varying vec2 vUv2;",

	"#endif"

	].join("\n"),

	lightmap_fragment: [

	"#ifdef USE_LIGHTMAP",

		"gl_FragColor = gl_FragColor * texture2D( lightMap, vUv2 );",

	"#endif"

	].join("\n"),

	lightmap_vertex: [

	"#ifdef USE_LIGHTMAP",

		"vUv2 = uv2;",

	"#endif"

	].join("\n"),

	lights_pars_vertex: [

	"uniform bool enableLighting;",
	"uniform vec3 ambientLightColor;",

	"#if MAX_DIR_LIGHTS > 0",

		"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
		"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",

	"#endif",

	"#if MAX_POINT_LIGHTS > 0",

		"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
		"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
		"uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",

		"#ifdef PHONG",
			"varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",
		"#endif",

	"#endif"

	].join("\n"),*/

	// LIGHTS

	/*lights_vertex: [

	"if ( !enableLighting ) {",

		"vLightWeighting = vec3( 1.0 );",

	"} else {",

		"vLightWeighting = ambientLightColor;",

		"#if MAX_DIR_LIGHTS > 0",

		"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

			"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
			"float directionalLightWeighting = max( dot( transformedNormal, normalize( lDirection.xyz ) ), 0.0 );",
			"vLightWeighting += directionalLightColor[ i ] * directionalLightWeighting;",

		"}",

		"#endif",

		"#if MAX_POINT_LIGHTS > 0",

			"for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",

				"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",

				"vec3 lVector = lPosition.xyz - mvPosition.xyz;",

				"float lDistance = 1.0;",

				"if ( pointLightDistance[ i ] > 0.0 )",
					"lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );",

				"lVector = normalize( lVector );",

				"float pointLightWeighting = max( dot( transformedNormal, lVector ), 0.0 );",
				"vLightWeighting += pointLightColor[ i ] * pointLightWeighting * lDistance;",

				"#ifdef PHONG",
					"vPointLight[ i ] = vec4( lVector, lDistance );",
				"#endif",

			"}",

		"#endif",

	"}"

	].join("\n"),

	lights_pars_fragment: [

	"#if MAX_DIR_LIGHTS > 0",
		"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
	"#endif",

	"#if MAX_POINT_LIGHTS > 0",
		"varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",
	"#endif",

	"varying vec3 vViewPosition;",
	"varying vec3 vNormal;"

	].join("\n"),

	lights_fragment: [

	"vec3 normal = normalize( vNormal );",
	"vec3 viewPosition = normalize( vViewPosition );",

	"vec4 mColor = vec4( diffuse, opacity );",
	"vec4 mSpecular = vec4( specular, opacity );",

	"#if MAX_POINT_LIGHTS > 0",

		"vec4 pointDiffuse  = vec4( 0.0 );",
		"vec4 pointSpecular = vec4( 0.0 );",

		"for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

			"vec3 pointVector = normalize( vPointLight[ i ].xyz );",
			"vec3 pointHalfVector = normalize( vPointLight[ i ].xyz + vViewPosition );",
			"float pointDistance = vPointLight[ i ].w;",

			"float pointDotNormalHalf = dot( normal, pointHalfVector );",
			"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

			"float pointSpecularWeight = 0.0;",

			"if ( pointDotNormalHalf >= 0.0 )",
				"pointSpecularWeight = pow( pointDotNormalHalf, shininess );",

			"pointDiffuse  += mColor * pointDiffuseWeight * pointDistance;",
			"pointSpecular += mSpecular * pointSpecularWeight * pointDistance;",

		"}",

	"#endif",

	"#if MAX_DIR_LIGHTS > 0",

		"vec4 dirDiffuse  = vec4( 0.0 );",
		"vec4 dirSpecular = vec4( 0.0 );" ,

		"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

			"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",

			"vec3 dirVector = normalize( lDirection.xyz );",
			"vec3 dirHalfVector = normalize( lDirection.xyz + vViewPosition );",

			"float dirDotNormalHalf = dot( normal, dirHalfVector );",

			"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

			"float dirSpecularWeight = 0.0;",
			"if ( dirDotNormalHalf >= 0.0 )",
				"dirSpecularWeight = pow( dirDotNormalHalf, shininess );",

			"dirDiffuse  += mColor * dirDiffuseWeight;",
			"dirSpecular += mSpecular * dirSpecularWeight;",

		"}",

	"#endif",

	"vec4 totalLight = vec4( ambient, opacity );",

	"#if MAX_DIR_LIGHTS > 0",
		"totalLight += dirDiffuse + dirSpecular;",
	"#endif",

	"#if MAX_POINT_LIGHTS > 0",
		"totalLight += pointDiffuse + pointSpecular;",
	"#endif",

	"gl_FragColor = gl_FragColor * totalLight;"

	].join("\n"),*/

	// VERTEX COLORS

	/*color_pars_fragment: [

	"#ifdef USE_COLOR",

		"varying vec3 vColor;",

	"#endif"

	].join("\n"),


	color_fragment: [

	"#ifdef USE_COLOR",

		"gl_FragColor = gl_FragColor * vec4( vColor, opacity );",

	"#endif"

	].join("\n"),

	color_pars_vertex: [

	"#ifdef USE_COLOR",

		"varying vec3 vColor;",

	"#endif"

	].join("\n"),


	color_vertex: [

	"#ifdef USE_COLOR",

		"vColor = color;",

	"#endif"

	].join("\n"),*/

	// skinning

	/*skinning_pars_vertex: [

	"#ifdef USE_SKINNING",

		"uniform mat4 boneGlobalMatrices[ MAX_BONES ];",

	"#endif"

	].join("\n"),

	skinning_vertex: [

	"#ifdef USE_SKINNING",

		"gl_Position  = ( boneGlobalMatrices[ int( skinIndex.x ) ] * skinVertexA ) * skinWeight.x;",
		"gl_Position += ( boneGlobalMatrices[ int( skinIndex.y ) ] * skinVertexB ) * skinWeight.y;",

		// this doesn't work, no idea why
		//"gl_Position  = projectionMatrix * cameraInverseMatrix * objectMatrix * gl_Position;",

		"gl_Position  = projectionMatrix * viewMatrix * objectMatrix * gl_Position;",

	"#endif"

	].join("\n"),*/

	// morphing

	/*morphtarget_pars_vertex: [

	"#ifdef USE_MORPHTARGETS",

		"uniform float morphTargetInfluences[ 8 ];",

	"#endif"

	].join("\n"),

	morphtarget_vertex: [

	"#ifdef USE_MORPHTARGETS",

		"vec3 morphed = vec3( 0.0, 0.0, 0.0 );",
		"morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];",
		"morphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];",
		"morphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];",
		"morphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];",
		"morphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];",
		"morphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];",
		"morphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];",
		"morphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];",
		"morphed += position;",

		"gl_Position = projectionMatrix * modelViewMatrix * vec4( morphed, 1.0 );",

	"#endif"

	].join("\n"),*/

	default_vertex : [

	"#ifndef USE_MORPHTARGETS",
	"#ifndef USE_SKINNING",

		"gl_Position = projectionMatrix * mvPosition;",

	"#endif",
	"#endif"

	].join("\n")

};

THREE.UniformsUtils = {

	/*merge: function ( uniforms ) {

		var u, p, tmp, merged = {};

		for ( u = 0; u < uniforms.length; u++ ) {

			tmp = this.clone( uniforms[ u ] );

			for ( p in tmp ) {

				merged[ p ] = tmp[ p ];

			}

		}

		return merged;

	},*/

	clone: function ( uniforms_src ) {

		var u, p, parameter, parameter_src, uniforms_dst = {};

		for ( u in uniforms_src ) {

			uniforms_dst[ u ] = {};

			for ( p in uniforms_src[ u ] ) {

				parameter_src = uniforms_src[ u ][ p ];

				if ( parameter_src instanceof THREE.Color ||
					 parameter_src instanceof THREE.Vector3 ||
					 parameter_src instanceof THREE.Texture ) {

					uniforms_dst[ u ][ p ] = parameter_src.clone();

				} else {

					uniforms_dst[ u ][ p ] = parameter_src;

				}

			}

		}

		return uniforms_dst;

	}

};

THREE.UniformsLib = {

	common: {

		"diffuse" : { type: "c", value: new THREE.Color( 0xeeeeee ) },
		"opacity" : { type: "f", value: 1.0 },
		"map" : { type: "t", value: 0, texture: null },

		"lightMap" : { type: "t", value: 2, texture: null },

		"envMap" : { type: "t", value: 1, texture: null },
		"useRefract" : { type: "i", value: 0 },
		"reflectivity" : { type: "f", value: 1.0 },
		"refractionRatio" : { type: "f", value: 0.98 },
		"combine" : { type: "i", value: 0 },

		"fogDensity" : { type: "f", value: 0.00025 },
		"fogNear" : { type: "f", value: 1 },
		"fogFar" : { type: "f", value: 2000 },
		"fogColor" : { type: "c", value: new THREE.Color( 0xffffff ) },

		"morphTargetInfluences" : { type: "f", value: 0 }

	}

	/*lights: {

		"enableLighting" : { type: "i", value: 1 },
		"ambientLightColor" : { type: "fv", value: [] },
		"directionalLightDirection" : { type: "fv", value: [] },
		"directionalLightColor" : { type: "fv", value: [] },
		"pointLightColor" : { type: "fv", value: [] },
		"pointLightPosition" : { type: "fv", value: [] },
		"pointLightDistance" : { type: "fv1", value: [] }

	},

	particle: {

		"psColor" : { type: "c", value: new THREE.Color( 0xeeeeee ) },
		"opacity" : { type: "f", value: 1.0 },
		"size" : { type: "f", value: 1.0 },
		"scale" : { type: "f", value: 1.0 },
		"map" : { type: "t", value: 0, texture: null },

		"fogDensity" : { type: "f", value: 0.00025 },
		"fogNear" : { type: "f", value: 1 },
		"fogFar" : { type: "f", value: 2000 },
		"fogColor" : { type: "c", value: new THREE.Color( 0xffffff ) }

	}*/

};

THREE.ShaderLib = {

	/*'lensFlareVertexTexture': {
		
		vertexShader: [

			"uniform 	vec3 	screenPosition;",
			"uniform	vec2	scale;",
			"uniform	float	rotation;",
			"uniform    int     renderType;",

			"uniform	sampler2D	occlusionMap;",

			"attribute 	vec2 	position;",
			"attribute  vec2	UV;",
			"varying	vec2	vUV;",
			"varying	float	vVisibility;",
	
			"void main(void)",
			"{",
				"vUV = UV;",

				"vec2 pos = position;",
				
				"if( renderType == 2 ) {",

					"vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 )) +",
									  "texture2D( occlusionMap, vec2( 0.5, 0.1 )) +",
									  "texture2D( occlusionMap, vec2( 0.9, 0.1 )) +",
									  "texture2D( occlusionMap, vec2( 0.9, 0.5 )) +",
									  "texture2D( occlusionMap, vec2( 0.9, 0.9 )) +",
									  "texture2D( occlusionMap, vec2( 0.5, 0.9 )) +",
									  "texture2D( occlusionMap, vec2( 0.1, 0.9 )) +",
									  "texture2D( occlusionMap, vec2( 0.1, 0.5 )) +",
									  "texture2D( occlusionMap, vec2( 0.5, 0.5 ));",

					"vVisibility = (       visibility.r / 9.0 ) *",
					              "( 1.0 - visibility.g / 9.0 ) *",
					              "(       visibility.b / 9.0 ) *", 
					              "( 1.0 - visibility.a / 9.0 );",

					"pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;",
					"pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;",
				"}",
				
				"gl_Position = vec4(( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );",
			"}"

		].join( "\n" ),
		
		fragmentShader: [
		
			"#ifdef GL_ES",
				"precision highp float;",
			"#endif",		

			"uniform	sampler2D	map;",
			"uniform	float		opacity;",
			"uniform    int         renderType;",
			
			"varying	vec2		vUV;",
			"varying	float		vVisibility;",
	
			"void main( void )",
			"{",
				// pink square
			
				"if( renderType == 0 ) {",
							
					"gl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );",
				
				// restore
				
				"} else if( renderType == 1 ) {",

					"gl_FragColor = texture2D( map, vUV );",
				
				// flare
				
				"} else {",
				
					"vec4 color = texture2D( map, vUV );",
					"color.a *= opacity * vVisibility;",
					"gl_FragColor = color;",
				"}",
			"}"
		].join( "\n" )

	},*/


	/*'lensFlare': {
		
		vertexShader: [

			"uniform 	vec3 	screenPosition;",
			"uniform	vec2	scale;",
			"uniform	float	rotation;",
			"uniform    int     renderType;",

			"attribute 	vec2 	position;",
			"attribute  vec2	UV;",

			"varying	vec2	vUV;",
	
			"void main(void)",
			"{",
				"vUV = UV;",

				"vec2 pos = position;",
				
				"if( renderType == 2 ) {",

					"pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;",
					"pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;",
				"}",
				
				"gl_Position = vec4(( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );",
			"}"

		].join( "\n" ),
		
		fragmentShader: [
		
			"#ifdef GL_ES",
				"precision highp float;",
			"#endif",		

			"uniform	sampler2D	map;",
			"uniform	sampler2D	occlusionMap;",
			"uniform	float		opacity;",
			"uniform    int         renderType;",
			
			"varying	vec2		vUV;",
	
			"void main( void )",
			"{",
				// pink square
			
				"if( renderType == 0 ) {",
							
					"gl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );",
				
				// restore
				
				"} else if( renderType == 1 ) {",

					"gl_FragColor = texture2D( map, vUV );",
				
				// flare
				
				"} else {",

					"float visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 )).a +",
								  	   "texture2D( occlusionMap, vec2( 0.9, 0.5 )).a +",
									   "texture2D( occlusionMap, vec2( 0.5, 0.9 )).a +",
									   "texture2D( occlusionMap, vec2( 0.1, 0.5 )).a;",
					
	                "visibility = ( 1.0 - visibility / 4.0 );",

					"vec4 color = texture2D( map, vUV );",
					"color.a *= opacity * visibility;",
					"gl_FragColor = color;",
				"}",
			"}"
		].join( "\n" )

	},*/

	/*'sprite': {
		
		vertexShader: [
			"uniform	int		useScreenCoordinates;",
			"uniform    int     affectedByDistance;",
			"uniform	vec3	screenPosition;",
			"uniform 	mat4 	modelViewMatrix;",
			"uniform 	mat4 	projectionMatrix;",
			"uniform    float   rotation;",
			"uniform    vec2    scale;",
			"uniform    vec2    alignment;",
			"uniform    vec2    uvOffset;",
			"uniform	vec2    uvScale;",

			"attribute 	vec2 	position;",
			"attribute  vec2	uv;",

			"varying	vec2	vUV;",
	
			"void main(void)",
			"{",
				"vUV = uvOffset + uv * uvScale;",

				"vec2 alignedPosition = position + alignment;",
			
				"vec2 rotatedPosition;",
				"rotatedPosition.x = ( cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y ) * scale.x;",
				"rotatedPosition.y = ( sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y ) * scale.y;",

				"vec4 finalPosition;",
				
				"if( useScreenCoordinates != 0 ) {",
				
					"finalPosition = vec4( screenPosition.xy + rotatedPosition, screenPosition.z, 1.0 );",
				
				"} else {",
				
					"finalPosition = projectionMatrix * modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );",
					"finalPosition.xy += rotatedPosition * ( affectedByDistance == 1 ? 1.0 : finalPosition.z );",

				"}",

				"gl_Position = finalPosition;",
			"}"

		].join( "\n" ),
		
		fragmentShader: [
		
			"#ifdef GL_ES",
				"precision highp float;",
			"#endif",		

			"uniform	sampler2D	map;",
			"uniform	float		opacity;",
			
			"varying	vec2		vUV;",
	
			"void main( void )",
			"{",
				"vec4 color = texture2D( map, vUV );",
				"color.a *= opacity;",
				"gl_FragColor = color;",
//				"gl_FragColor = vec4( 1.0, 0.0, 1.0, 1.0 );",
			"}"
		].join( "\n" )

	},*/



	/*'shadowPost': {

		vertexShader: [

			"uniform 	mat4 	projectionMatrix;",
			"attribute 	vec3 	position;",

			"void main(void)",
			"{",
				"gl_Position = projectionMatrix * vec4( position, 1.0 );",
			"}"

		].join( "\n" ),

		fragmentShader: [

			"#ifdef GL_ES",
				"precision highp float;",
			"#endif",		

			"uniform 	float 	darkness;",

			"void main( void )",
			"{",
				"gl_FragColor = vec4( 0, 0, 0, darkness );",
			"}"

		].join( "\n" )

	},*/


	/*'shadowVolumeDynamic': {

		uniforms: { "directionalLightDirection": { type: "fv", value: [] }},

		vertexShader: [

			"uniform 	vec3 	directionalLightDirection;",

			"void main() {",

				"vec4 pos      = objectMatrix * vec4( position, 1.0 );",
				"vec3 norm     = mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal;",
				"vec4 extruded = vec4( directionalLightDirection * 5000.0 * step( 0.0, dot( directionalLightDirection, norm )), 0.0 );",

				"gl_Position   = projectionMatrix * viewMatrix * ( pos + extruded );",
			"}"

		].join( "\n" ),

		fragmentShader: [

			"void main() {",

				"gl_FragColor = vec4( 1.0 );",

			"}"

		].join( "\n" )
	},*/


	/*'depth': {

		uniforms: { "mNear": { type: "f", value: 1.0 },
					"mFar" : { type: "f", value: 2000.0 },
					"opacity" : { type: "f", value: 1.0 }
				  },

		fragmentShader: [

			"uniform float mNear;",
			"uniform float mFar;",
			"uniform float opacity;",

			"void main() {",

				"float depth = gl_FragCoord.z / gl_FragCoord.w;",
				"float color = 1.0 - smoothstep( mNear, mFar, depth );",
				"gl_FragColor = vec4( vec3( color ), opacity );",

			"}"

		].join("\n"),

		vertexShader: [

			"void main() {",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n")

	},

	'normal': {

		uniforms: { "opacity" : { type: "f", value: 1.0 } },

		fragmentShader: [

			"uniform float opacity;",
			"varying vec3 vNormal;",

			"void main() {",

				"gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );",

			"}"

		].join("\n"),

		vertexShader: [

			"varying vec3 vNormal;",

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vNormal = normalize( normalMatrix * normal );",

				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")

	},*/

	'basic': {

		uniforms: THREE.UniformsLib[ "common" ],

		fragmentShader: [

			"uniform vec3 diffuse;",
			"uniform float opacity;",

			//THREE.ShaderChunk[ "color_pars_fragment" ],
			THREE.ShaderChunk[ "map_pars_fragment" ],
			THREE.ShaderChunk[ "lightmap_pars_fragment" ],
			THREE.ShaderChunk[ "envmap_pars_fragment" ],
			//THREE.ShaderChunk[ "fog_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( diffuse, opacity );",

				THREE.ShaderChunk[ "map_fragment" ],
				THREE.ShaderChunk[ "lightmap_fragment" ],
				//THREE.ShaderChunk[ "color_fragment" ],
				THREE.ShaderChunk[ "envmap_fragment" ],
				//THREE.ShaderChunk[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertexShader: [

			THREE.ShaderChunk[ "map_pars_vertex" ],
			THREE.ShaderChunk[ "lightmap_pars_vertex" ],
			THREE.ShaderChunk[ "envmap_pars_vertex" ],
			//THREE.ShaderChunk[ "color_pars_vertex" ],
			//THREE.ShaderChunk[ "skinning_pars_vertex" ],
			//THREE.ShaderChunk[ "morphtarget_pars_vertex" ],

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				THREE.ShaderChunk[ "map_vertex" ],
				THREE.ShaderChunk[ "lightmap_vertex" ],
				THREE.ShaderChunk[ "envmap_vertex" ],
				//THREE.ShaderChunk[ "color_vertex" ],
				//THREE.ShaderChunk[ "skinning_vertex" ],
				//THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "default_vertex" ],

			"}"

		].join("\n")

	}

	/*'lambert': {

		uniforms: THREE.UniformsUtils.merge( [ THREE.UniformsLib[ "common" ], THREE.UniformsLib[ "lights" ] ] ),

		fragmentShader: [

			"uniform vec3 diffuse;",
			"uniform float opacity;",

			"varying vec3 vLightWeighting;",

			THREE.ShaderChunk[ "color_pars_fragment" ],
			THREE.ShaderChunk[ "map_pars_fragment" ],
			THREE.ShaderChunk[ "lightmap_pars_fragment" ],
			THREE.ShaderChunk[ "envmap_pars_fragment" ],
			THREE.ShaderChunk[ "fog_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( diffuse, opacity );",
				"gl_FragColor = gl_FragColor * vec4( vLightWeighting, 1.0 );",

				THREE.ShaderChunk[ "map_fragment" ],
				THREE.ShaderChunk[ "lightmap_fragment" ],
				THREE.ShaderChunk[ "color_fragment" ],
				THREE.ShaderChunk[ "envmap_fragment" ],
				THREE.ShaderChunk[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertexShader: [

			"varying vec3 vLightWeighting;",

			THREE.ShaderChunk[ "map_pars_vertex" ],
			THREE.ShaderChunk[ "lightmap_pars_vertex" ],
			THREE.ShaderChunk[ "envmap_pars_vertex" ],
			THREE.ShaderChunk[ "lights_pars_vertex" ],
			THREE.ShaderChunk[ "color_pars_vertex" ],
			THREE.ShaderChunk[ "skinning_pars_vertex" ],
			THREE.ShaderChunk[ "morphtarget_pars_vertex" ],

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				THREE.ShaderChunk[ "map_vertex" ],
				THREE.ShaderChunk[ "lightmap_vertex" ],
				THREE.ShaderChunk[ "envmap_vertex" ],
				THREE.ShaderChunk[ "color_vertex" ],

				"vec3 transformedNormal = normalize( normalMatrix * normal );",

				THREE.ShaderChunk[ "lights_vertex" ],
				THREE.ShaderChunk[ "skinning_vertex" ],
				THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "default_vertex" ],

			"}"

		].join("\n")

	},*/

	/*'phong': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "lights" ],
			{
				"ambient"  : { type: "c", value: new THREE.Color( 0x050505 ) },
				"specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
				"shininess": { type: "f", value: 30 }
			}

		] ),

		fragmentShader: [

			"uniform vec3 diffuse;",
			"uniform float opacity;",

			"uniform vec3 ambient;",
			"uniform vec3 specular;",
			"uniform float shininess;",

			"varying vec3 vLightWeighting;",

			THREE.ShaderChunk[ "color_pars_fragment" ],
			THREE.ShaderChunk[ "map_pars_fragment" ],
			THREE.ShaderChunk[ "lightmap_pars_fragment" ],
			THREE.ShaderChunk[ "envmap_pars_fragment" ],
			THREE.ShaderChunk[ "fog_pars_fragment" ],
			THREE.ShaderChunk[ "lights_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( vLightWeighting, 1.0 );",
				THREE.ShaderChunk[ "lights_fragment" ],

				THREE.ShaderChunk[ "map_fragment" ],
				THREE.ShaderChunk[ "lightmap_fragment" ],
				THREE.ShaderChunk[ "color_fragment" ],
				THREE.ShaderChunk[ "envmap_fragment" ],
				THREE.ShaderChunk[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertexShader: [

			"#define PHONG",

			"varying vec3 vLightWeighting;",
			"varying vec3 vViewPosition;",
			"varying vec3 vNormal;",

			THREE.ShaderChunk[ "map_pars_vertex" ],
			THREE.ShaderChunk[ "lightmap_pars_vertex" ],
			THREE.ShaderChunk[ "envmap_pars_vertex" ],
			THREE.ShaderChunk[ "lights_pars_vertex" ],
			THREE.ShaderChunk[ "color_pars_vertex" ],
			THREE.ShaderChunk[ "skinning_pars_vertex" ],
			THREE.ShaderChunk[ "morphtarget_pars_vertex" ],

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				THREE.ShaderChunk[ "map_vertex" ],
				THREE.ShaderChunk[ "lightmap_vertex" ],
				THREE.ShaderChunk[ "envmap_vertex" ],
				THREE.ShaderChunk[ "color_vertex" ],

				"#ifndef USE_ENVMAP",
					"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
				"#endif",

				"vViewPosition = cameraPosition - mPosition.xyz;",

				"vec3 transformedNormal = normalize( normalMatrix * normal );",
				"vNormal = transformedNormal;",

				THREE.ShaderChunk[ "lights_vertex" ],
				THREE.ShaderChunk[ "skinning_vertex" ],
				THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "default_vertex" ],

			"}"

		].join("\n")

	},*/

	/*'particle_basic': {

		uniforms: THREE.UniformsLib[ "particle" ],

		fragmentShader: [

			"uniform vec3 psColor;",
			"uniform float opacity;",

			THREE.ShaderChunk[ "color_pars_fragment" ],
			THREE.ShaderChunk[ "map_particle_pars_fragment" ],
			THREE.ShaderChunk[ "fog_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( psColor, opacity );",

				THREE.ShaderChunk[ "map_particle_fragment" ],
				THREE.ShaderChunk[ "color_fragment" ],
				THREE.ShaderChunk[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertexShader: [

			"uniform float size;",
			"uniform float scale;",

			THREE.ShaderChunk[ "color_pars_vertex" ],

			"void main() {",

				THREE.ShaderChunk[ "color_vertex" ],

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				"#ifdef USE_SIZEATTENUATION",
					"gl_PointSize = size * ( scale / length( mvPosition.xyz ) );",
				"#else",
					"gl_PointSize = size;",
				"#endif",

				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")

	}*/

};
/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */

THREE.WebGLRenderer = function ( parameters ) {

	// Currently you can use just up to 4 directional / point lights total.
	// Chrome barfs on shader linking when there are more than 4 lights :(

	// The problem comes from shader using too many varying vectors.

	// This is not GPU limitation as the same shader works ok in Firefox
	// and Chrome with "--use-gl=desktop" flag.

	// Difference comes from Chrome on Windows using by default ANGLE,
	// thus going DirectX9 route (while FF uses OpenGL).

	// See http://code.google.com/p/chromium/issues/detail?id=63491

	var _this = this,
	_gl, _canvas = document.createElement( 'canvas' ),
	_programs = [],
	_currentProgram = null,
	_currentFramebuffer = null,
	_currentDepthMask = true,

	// gl state cache

	_oldDoubleSided = null,
	_oldFlipSided = null,
	_oldBlending = null,
	_oldDepth = null,
	_cullEnabled = true,

	_viewportX = 0,
	_viewportY = 0,
	_viewportWidth = 0,
	_viewportHeight = 0,

	// camera matrices caches

	_frustum = [
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4()
	 ],

	_projScreenMatrix = new THREE.Matrix4(),
	_projectionMatrixArray = new Float32Array( 16 ),
	_viewMatrixArray = new Float32Array( 16 ),

	_vector3 = new THREE.Vector4(),

	// light arrays cache

	/*_lights = {

		ambient: [ 0, 0, 0 ],
		directional: { length: 0, colors: new Array(), positions: new Array() },
		point: { length: 0, colors: new Array(), positions: new Array(), distances: new Array() }

	},*/


	// parameters

	parameters = parameters || {};

	//stencil = parameters.stencil !== undefined ? parameters.stencil : true,
	stencil = false,
	antialias = parameters.antialias !== undefined ? parameters.antialias : false,
	clearColor = parameters.clearColor !== undefined ? new THREE.Color( parameters.clearColor ) : new THREE.Color( 0x000000 ),
	clearAlpha = parameters.clearAlpha !== undefined ? parameters.clearAlpha : 0;

	this.data = {

		vertices: 0,
		faces: 0,
		drawCalls: 0

	};

	//this.maxMorphTargets = 8;
	this.domElement = _canvas;
	this.autoClear = true;
	this.sortObjects = true;

	initGL( antialias, clearColor, clearAlpha, stencil );

	this.context = _gl;


	// prepare stencil shadow polygon

	/*if ( stencil ) {

		var _stencilShadow      = {};

		_stencilShadow.vertices = new Float32Array( 12 );
		_stencilShadow.faces    = new Uint16Array( 6 );
		_stencilShadow.darkness = 0.5;

		_stencilShadow.vertices[ 0 * 3 + 0 ] = -20; _stencilShadow.vertices[ 0 * 3 + 1 ] = -20; _stencilShadow.vertices[ 0 * 3 + 2 ] = -1;
		_stencilShadow.vertices[ 1 * 3 + 0 ] =  20; _stencilShadow.vertices[ 1 * 3 + 1 ] = -20; _stencilShadow.vertices[ 1 * 3 + 2 ] = -1;
		_stencilShadow.vertices[ 2 * 3 + 0 ] =  20; _stencilShadow.vertices[ 2 * 3 + 1 ] =  20; _stencilShadow.vertices[ 2 * 3 + 2 ] = -1;
		_stencilShadow.vertices[ 3 * 3 + 0 ] = -20; _stencilShadow.vertices[ 3 * 3 + 1 ] =  20; _stencilShadow.vertices[ 3 * 3 + 2 ] = -1;

		_stencilShadow.faces[ 0 ] = 0; _stencilShadow.faces[ 1 ] = 1; _stencilShadow.faces[ 2 ] = 2;
		_stencilShadow.faces[ 3 ] = 0; _stencilShadow.faces[ 4 ] = 2; _stencilShadow.faces[ 5 ] = 3;

		_stencilShadow.vertexBuffer  = _gl.createBuffer();
		_stencilShadow.elementBuffer = _gl.createBuffer();

		_gl.bindBuffer( _gl.ARRAY_BUFFER, _stencilShadow.vertexBuffer );
		_gl.bufferData( _gl.ARRAY_BUFFER,  _stencilShadow.vertices, _gl.STATIC_DRAW );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _stencilShadow.elementBuffer );
		_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, _stencilShadow.faces, _gl.STATIC_DRAW );

		_stencilShadow.program = _gl.createProgram();

		//_gl.attachShader( _stencilShadow.program, getShader( "fragment", THREE.ShaderLib.shadowPost.fragmentShader ));
		//_gl.attachShader( _stencilShadow.program, getShader( "vertex",   THREE.ShaderLib.shadowPost.vertexShader   ));

		_gl.linkProgram( _stencilShadow.program );

		_stencilShadow.vertexLocation     = _gl.getAttribLocation ( _stencilShadow.program, "position"         );
		_stencilShadow.projectionLocation = _gl.getUniformLocation( _stencilShadow.program, "projectionMatrix" );
		_stencilShadow.darknessLocation   = _gl.getUniformLocation( _stencilShadow.program, "darkness"         );
	}*/


	// prepare lens flare
/*
	var _lensFlare = {};
	var i;

	_lensFlare.vertices     = new Float32Array( 8 + 8 );
	_lensFlare.faces        = new Uint16Array( 6 );

	i = 0;
	_lensFlare.vertices[ i++ ] = -1; _lensFlare.vertices[ i++ ] = -1;	// vertex
	_lensFlare.vertices[ i++ ] = 0;  _lensFlare.vertices[ i++ ] = 0;	// uv... etc.
	_lensFlare.vertices[ i++ ] = 1;  _lensFlare.vertices[ i++ ] = -1;
	_lensFlare.vertices[ i++ ] = 1;  _lensFlare.vertices[ i++ ] = 0;
	_lensFlare.vertices[ i++ ] = 1;  _lensFlare.vertices[ i++ ] = 1;
	_lensFlare.vertices[ i++ ] = 1;  _lensFlare.vertices[ i++ ] = 1;
	_lensFlare.vertices[ i++ ] = -1; _lensFlare.vertices[ i++ ] = 1;
	_lensFlare.vertices[ i++ ] = 0;  _lensFlare.vertices[ i++ ] = 1;

	i = 0;
	_lensFlare.faces[ i++ ] = 0; _lensFlare.faces[ i++ ] = 1; _lensFlare.faces[ i++ ] = 2;
	_lensFlare.faces[ i++ ] = 0; _lensFlare.faces[ i++ ] = 2; _lensFlare.faces[ i++ ] = 3;

	_lensFlare.vertexBuffer     = _gl.createBuffer();
	_lensFlare.elementBuffer    = _gl.createBuffer();
	_lensFlare.tempTexture      = _gl.createTexture();
	_lensFlare.occlusionTexture = _gl.createTexture();

	_gl.bindBuffer( _gl.ARRAY_BUFFER, _lensFlare.vertexBuffer );
	_gl.bufferData( _gl.ARRAY_BUFFER,  _lensFlare.vertices, _gl.STATIC_DRAW );

	_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _lensFlare.elementBuffer );
	_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, _lensFlare.faces, _gl.STATIC_DRAW );

	_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.tempTexture );
	_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGB, 16, 16, 0, _gl.RGB, _gl.UNSIGNED_BYTE, null );
	_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
	_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );
	_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST );
	_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST );

	_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.occlusionTexture );
	_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, 16, 16, 0, _gl.RGBA, _gl.UNSIGNED_BYTE, null );
	_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
	_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );
	_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST );
	_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST );

	if( _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) <= 0 ) {

		_lensFlare.hasVertexTexture = false;

		_lensFlare.program = _gl.createProgram();
		_gl.attachShader( _lensFlare.program, getShader( "fragment", THREE.ShaderLib.lensFlare.fragmentShader ));
		_gl.attachShader( _lensFlare.program, getShader( "vertex",   THREE.ShaderLib.lensFlare.vertexShader   ));
		_gl.linkProgram( _lensFlare.program );


	} else {

		_lensFlare.hasVertexTexture = true;

		_lensFlare.program = _gl.createProgram();
		//_gl.attachShader( _lensFlare.program, getShader( "fragment", THREE.ShaderLib.lensFlareVertexTexture.fragmentShader ));
		//_gl.attachShader( _lensFlare.program, getShader( "vertex",   THREE.ShaderLib.lensFlareVertexTexture.vertexShader   ));
		_gl.linkProgram( _lensFlare.program );

	}

	_lensFlare.attributes = {};
	_lensFlare.uniforms = {};
	_lensFlare.attributes.vertex       = _gl.getAttribLocation ( _lensFlare.program, "position" );
	_lensFlare.attributes.uv           = _gl.getAttribLocation ( _lensFlare.program, "UV" );
	_lensFlare.uniforms.renderType     = _gl.getUniformLocation( _lensFlare.program, "renderType" );
	_lensFlare.uniforms.map            = _gl.getUniformLocation( _lensFlare.program, "map" );
	_lensFlare.uniforms.occlusionMap   = _gl.getUniformLocation( _lensFlare.program, "occlusionMap" );
	_lensFlare.uniforms.opacity        = _gl.getUniformLocation( _lensFlare.program, "opacity" );
	_lensFlare.uniforms.scale          = _gl.getUniformLocation( _lensFlare.program, "scale" );
	_lensFlare.uniforms.rotation       = _gl.getUniformLocation( _lensFlare.program, "rotation" );
	_lensFlare.uniforms.screenPosition = _gl.getUniformLocation( _lensFlare.program, "screenPosition" );

	//_gl.enableVertexAttribArray( _lensFlare.attributes.vertex );
	//_gl.enableVertexAttribArray( _lensFlare.attributes.uv );

	var _lensFlareAttributesEnabled = false;
*/
	// prepare sprites
/*	
	_sprite = {};

	_sprite.vertices = new Float32Array( 8 + 8 );
	_sprite.faces    = new Uint16Array( 6 );

	i = 0;
	_sprite.vertices[ i++ ] = -1; _sprite.vertices[ i++ ] = -1;	// vertex
	_sprite.vertices[ i++ ] = 0;  _sprite.vertices[ i++ ] = 0;	// uv... etc.
	_sprite.vertices[ i++ ] = 1;  _sprite.vertices[ i++ ] = -1;
	_sprite.vertices[ i++ ] = 1;  _sprite.vertices[ i++ ] = 0;
	_sprite.vertices[ i++ ] = 1;  _sprite.vertices[ i++ ] = 1;
	_sprite.vertices[ i++ ] = 1;  _sprite.vertices[ i++ ] = 1;
	_sprite.vertices[ i++ ] = -1; _sprite.vertices[ i++ ] = 1;
	_sprite.vertices[ i++ ] = 0;  _sprite.vertices[ i++ ] = 1;

	i = 0;
	_sprite.faces[ i++ ] = 0; _sprite.faces[ i++ ] = 1; _sprite.faces[ i++ ] = 2;
	_sprite.faces[ i++ ] = 0; _sprite.faces[ i++ ] = 2; _sprite.faces[ i++ ] = 3;

	_sprite.vertexBuffer  = _gl.createBuffer();
	_sprite.elementBuffer = _gl.createBuffer();

	_gl.bindBuffer( _gl.ARRAY_BUFFER, _sprite.vertexBuffer );
	_gl.bufferData( _gl.ARRAY_BUFFER,  _sprite.vertices, _gl.STATIC_DRAW );

	_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _sprite.elementBuffer );
	_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, _sprite.faces, _gl.STATIC_DRAW );


	_sprite.program = _gl.createProgram();
	//_gl.attachShader( _sprite.program, getShader( "fragment", THREE.ShaderLib.sprite.fragmentShader ));
	//_gl.attachShader( _sprite.program, getShader( "vertex",   THREE.ShaderLib.sprite.vertexShader   ));
	_gl.linkProgram( _sprite.program );

	_sprite.attributes = {};
	_sprite.uniforms = {};
	_sprite.attributes.position           = _gl.getAttribLocation ( _sprite.program, "position" );
	_sprite.attributes.uv                 = _gl.getAttribLocation ( _sprite.program, "uv" );
	_sprite.uniforms.uvOffset             = _gl.getUniformLocation( _sprite.program, "uvOffset" );
	_sprite.uniforms.uvScale              = _gl.getUniformLocation( _sprite.program, "uvScale" );
	_sprite.uniforms.rotation             = _gl.getUniformLocation( _sprite.program, "rotation" );
	_sprite.uniforms.scale                = _gl.getUniformLocation( _sprite.program, "scale" );
	_sprite.uniforms.alignment            = _gl.getUniformLocation( _sprite.program, "alignment" );
	_sprite.uniforms.map                  = _gl.getUniformLocation( _sprite.program, "map" );
	_sprite.uniforms.opacity              = _gl.getUniformLocation( _sprite.program, "opacity" );
	_sprite.uniforms.useScreenCoordinates = _gl.getUniformLocation( _sprite.program, "useScreenCoordinates" );
	_sprite.uniforms.affectedByDistance   = _gl.getUniformLocation( _sprite.program, "affectedByDistance" );
	_sprite.uniforms.screenPosition    	  = _gl.getUniformLocation( _sprite.program, "screenPosition" );
	_sprite.uniforms.modelViewMatrix      = _gl.getUniformLocation( _sprite.program, "modelViewMatrix" );
	_sprite.uniforms.projectionMatrix     = _gl.getUniformLocation( _sprite.program, "projectionMatrix" );

	//_gl.enableVertexAttribArray( _sprite.attributes.position );
	//_gl.enableVertexAttribArray( _sprite.attributes.uv );

	var _spriteAttributesEnabled = false;
*/
	this.setSize = function ( width, height ) {

		_canvas.width = width;
		_canvas.height = height;

		this.setViewport( 0, 0, _canvas.width, _canvas.height );

	};

	this.setViewport = function ( x, y, width, height ) {

		_viewportX = x;
		_viewportY = y;

		_viewportWidth = width;
		_viewportHeight = height;

		_gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );

	};

	/*this.setScissor = function ( x, y, width, height ) {

		_gl.scissor( x, y, width, height );

	};

	this.enableScissorTest = function ( enable ) {

		if ( enable )
			_gl.enable( _gl.SCISSOR_TEST );
		else
			_gl.disable( _gl.SCISSOR_TEST );

	};

	this.enableDepthBufferWrite = function ( enable ) {

		_currentDepthMask = enable;
		_gl.depthMask( enable );

	};

	this.setClearColorHex = function ( hex, alpha ) {

		var color = new THREE.Color( hex );
		_gl.clearColor( color.r, color.g, color.b, alpha );

	};

	this.setClearColor = function ( color, alpha ) {

		_gl.clearColor( color.r, color.g, color.b, alpha );

	};*/

	this.clear = function () {

		_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT | _gl.STENCIL_BUFFER_BIT );

	};

	/*this.setStencilShadowDarkness = function( value ) {
		
		_stencilShadow.darkness = value;
	};

	this.getContext = function() {
		
		return _gl;
		
	}*/


	/*function setupLights ( program, lights ) {

		var l, ll, light, r = 0, g = 0, b = 0,
		color, position, intensity, distance,

		zlights = _lights,

		dcolors = zlights.directional.colors,
		dpositions = zlights.directional.positions,

		pcolors = zlights.point.colors,
		ppositions = zlights.point.positions,
		pdistances = zlights.point.distances,

		dlength = 0,
		plength = 0,

		doffset = 0,
		poffset = 0;

		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];
			color = light.color;

			position = light.position;
			intensity = light.intensity;
			distance = light.distance;

			if ( light instanceof THREE.AmbientLight ) {

				r += color.r;
				g += color.g;
				b += color.b;

			} else if ( light instanceof THREE.DirectionalLight ) {

				doffset = dlength * 3;

				dcolors[ doffset ] = color.r * intensity;
				dcolors[ doffset + 1 ] = color.g * intensity;
				dcolors[ doffset + 2 ] = color.b * intensity;

				dpositions[ doffset ] = position.x;
				dpositions[ doffset + 1 ] = position.y;
				dpositions[ doffset + 2 ] = position.z;

				dlength += 1;

			} else if( light instanceof THREE.PointLight ) {

				poffset = plength * 3;

				pcolors[ poffset ] = color.r * intensity;
				pcolors[ poffset + 1 ] = color.g * intensity;
				pcolors[ poffset + 2 ] = color.b * intensity;

				ppositions[ poffset ] = position.x;
				ppositions[ poffset + 1 ] = position.y;
				ppositions[ poffset + 2 ] = position.z;

				pdistances[ plength ] = distance;

				plength += 1;

			}

		}

		// null eventual remains from removed lights
		// (this is to avoid if in shader)

		for( l = dlength * 3; l < dcolors.length; l++ ) dcolors[ l ] = 0.0;
		for( l = plength * 3; l < pcolors.length; l++ ) pcolors[ l ] = 0.0;

		zlights.point.length = plength;
		zlights.directional.length = dlength;

		zlights.ambient[ 0 ] = r;
		zlights.ambient[ 1 ] = g;
		zlights.ambient[ 2 ] = b;

	};*/

	/*function createParticleBuffers ( geometry ) {

		geometry.__webglVertexBuffer = _gl.createBuffer();
		geometry.__webglColorBuffer = _gl.createBuffer();

	};

	function createLineBuffers( geometry ) {

		geometry.__webglVertexBuffer = _gl.createBuffer();
		geometry.__webglColorBuffer = _gl.createBuffer();

	};

	function createRibbonBuffers( geometry ) {

		geometry.__webglVertexBuffer = _gl.createBuffer();
		geometry.__webglColorBuffer = _gl.createBuffer();

	};*/

	function createMeshBuffers( geometryGroup ) {

		geometryGroup.__webglVertexBuffer = _gl.createBuffer();
		//geometryGroup.__webglNormalBuffer = _gl.createBuffer();
		//geometryGroup.__webglTangentBuffer = _gl.createBuffer();
		//geometryGroup.__webglColorBuffer = _gl.createBuffer();
		geometryGroup.__webglUVBuffer = _gl.createBuffer();
		//geometryGroup.__webglUV2Buffer = _gl.createBuffer();

		//geometryGroup.__webglSkinVertexABuffer = _gl.createBuffer();
		//geometryGroup.__webglSkinVertexBBuffer = _gl.createBuffer();
		//geometryGroup.__webglSkinIndicesBuffer = _gl.createBuffer();
		//geometryGroup.__webglSkinWeightsBuffer = _gl.createBuffer();

		geometryGroup.__webglFaceBuffer = _gl.createBuffer();
		//geometryGroup.__webglLineBuffer = _gl.createBuffer();

		/*if ( geometryGroup.numMorphTargets ) {

			var m, ml;
			geometryGroup.__webglMorphTargetsBuffers = []; 

			for ( m = 0, ml = geometryGroup.numMorphTargets; m < ml; m++ ) {

				geometryGroup.__webglMorphTargetsBuffers.push( _gl.createBuffer() );

			}

		}*/

	};

	/*function initLineBuffers ( geometry ) {

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
		geometry.__colorArray = new Float32Array( nvertices * 3 );

		geometry.__webglLineCount = nvertices;

	};

	function initRibbonBuffers ( geometry ) {

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
		geometry.__colorArray = new Float32Array( nvertices * 3 );

		geometry.__webglVertexCount = nvertices;

	};

	function initParticleBuffers ( geometry ) {

		var nvertices = geometry.vertices.length;

		geometry.__vertexArray = new Float32Array( nvertices * 3 );
		geometry.__colorArray = new Float32Array( nvertices * 3 );

		geometry.__sortArray = [];

		geometry.__webglParticleCount = nvertices;

	};*/

	function initMeshBuffers ( geometryGroup, object ) {

		var f, fl, fi, face,
		m, ml, size,
		nvertices = 0, ntris = 0, nlines = 0,

		uvType,
		//vertexColorType,
		//normalType,
		materials,
		attribute,

		geometry = object.geometry,
		obj_faces = geometry.faces,
		chunk_faces = geometryGroup.faces;

		for ( f = 0, fl = chunk_faces.length; f < fl; f++ ) {

			fi = chunk_faces[ f ];
			face = obj_faces[ fi ];

			if ( face instanceof THREE.Face3 ) {

				nvertices += 3;
				ntris += 1;
				nlines += 3;

			} /*else if ( face instanceof THREE.Face4 ) {

				nvertices += 4;
				ntris += 2;
				nlines += 4;

			}*/

		}

		materials = unrollGroupMaterials( geometryGroup, object );

		uvType = bufferGuessUVType( materials, geometryGroup, object );
		//normalType = bufferGuessNormalType( materials, geometryGroup, object );
		//vertexColorType = bufferGuessVertexColorType( materials, geometryGroup, object );

		//console.log("uvType",uvType, "normalType",normalType, "vertexColorType",vertexColorType, object, geometryGroup, materials );

		geometryGroup.__vertexArray = new Float32Array( nvertices * 3 );

		/*if ( normalType ) {

			geometryGroup.__normalArray = new Float32Array( nvertices * 3 );

		}

		if ( geometry.hasTangents ) {

			geometryGroup.__tangentArray = new Float32Array( nvertices * 4 );

		}

		if ( vertexColorType ) {

			geometryGroup.__colorArray = new Float32Array( nvertices * 3 );

		}*/

		if ( uvType ) {

			if ( geometry.faceUvs.length > 0 || geometry.faceVertexUvs.length > 0 ) {

				geometryGroup.__uvArray = new Float32Array( nvertices * 2 );

			}

			if ( geometry.faceUvs.length > 1 || geometry.faceVertexUvs.length > 1 ) {

				geometryGroup.__uv2Array = new Float32Array( nvertices * 2 );

			}

		}

		/*if ( object.geometry.skinWeights.length && object.geometry.skinIndices.length ) {

			geometryGroup.__skinVertexAArray = new Float32Array( nvertices * 4 );
			geometryGroup.__skinVertexBArray = new Float32Array( nvertices * 4 );
			geometryGroup.__skinIndexArray = new Float32Array( nvertices * 4 );
			geometryGroup.__skinWeightArray = new Float32Array( nvertices * 4 );

		}*/

		geometryGroup.__faceArray = new Uint16Array( ntris * 3 + ( object.geometry.edgeFaces ? object.geometry.edgeFaces.length * 2 * 3 : 0 ));
		//geometryGroup.__lineArray = new Uint16Array( nlines * 2 );

		/*if ( geometryGroup.numMorphTargets ) {

			geometryGroup.__morphTargetsArrays = []; 

			for ( m = 0, ml = geometryGroup.numMorphTargets; m < ml; m++ ) {

				geometryGroup.__morphTargetsArrays.push( new Float32Array( nvertices * 3 ) );

			}

		}*/

		//geometryGroup.__needsSmoothNormals = ( normalType == THREE.SmoothShading );

		geometryGroup.__uvType = uvType;
		//geometryGroup.__vertexColorType = vertexColorType;
		//geometryGroup.__normalType = normalType;

		geometryGroup.__webglFaceCount = ntris * 3 + ( object.geometry.edgeFaces ? object.geometry.edgeFaces.length * 2 * 3 : 0 );
		//geometryGroup.__webglLineCount = nlines * 2;


		// custom attributes

		/*for ( m = 0, ml = materials.length; m < ml; m ++ ) {

			if ( materials[ m ].attributes ) {

				geometryGroup.__webglCustomAttributes = {};

				for ( a in materials[ m ].attributes ) {

					attribute = materials[ m ].attributes[ a ];

					if( !attribute.__webglInitialized || attribute.createUniqueBuffers ) {
						
						attribute.__webglInitialized = true;
						
						size = 1;		// "f" and "i"
	
						if( attribute.type === "v2" ) size = 2;
						else if( attribute.type === "v3" ) size = 3;
						else if( attribute.type === "v4" ) size = 4;
						else if( attribute.type === "c"  ) size = 3;
	
						attribute.size = size;
						attribute.needsUpdate = true;
						attribute.array = new Float32Array( nvertices * size );
						attribute.buffer = _gl.createBuffer();
						attribute.buffer.belongsToAttribute = a;
						
					}

					geometryGroup.__webglCustomAttributes[ a ] = attribute;

				}

			}

		}*/

	};


	function setMeshBuffers ( geometryGroup, object, hint ) {

		var f, fl, fi, face,
		//vertexNormals, faceNormal, normal,
		//vertexColors, faceColor,
		//vertexTangents,
		uvType, //vertexColorType, normalType,
		uv, uv2, v1, v2, v3, v4, t1, t2, t3, t4,
		c1, c2, c3, c4,
		sw1, sw2, sw3, sw4,
		si1, si2, si3, si4,
		sa1, sa2, sa3, sa4,
		sb1, sb2, sb3, sb4,
		m, ml, i,
		vn, uvi, uv2i,
		vk, vkl, vka,
		a,

		vertexIndex = 0,

		offset = 0,
		offset_uv = 0,
		//offset_uv2 = 0,
		offset_face = 0,
		//offset_normal = 0,
		//offset_tangent = 0,
		//offset_line = 0,
		//offset_color = 0,
		//offset_skin = 0,
		//offset_morphTarget = 0,
		offset_custom = 0,
		offset_customSrc = 0,

		vertexArray = geometryGroup.__vertexArray,
		uvArray = geometryGroup.__uvArray,
		//uv2Array = geometryGroup.__uv2Array,
		//normalArray = geometryGroup.__normalArray,
		//tangentArray = geometryGroup.__tangentArray,
		//colorArray = geometryGroup.__colorArray,

		//skinVertexAArray = geometryGroup.__skinVertexAArray,
		//skinVertexBArray = geometryGroup.__skinVertexBArray,
		//skinIndexArray = geometryGroup.__skinIndexArray,
		//skinWeightArray = geometryGroup.__skinWeightArray,

		//morphTargetsArrays = geometryGroup.__morphTargetsArrays,

		//customAttributes = geometryGroup.__webglCustomAttributes,
		//customAttribute,

		faceArray = geometryGroup.__faceArray,
		//lineArray = geometryGroup.__lineArray,

		//needsSmoothNormals = geometryGroup.__needsSmoothNormals,

		//vertexColorType = geometryGroup.__vertexColorType,
		uvType = geometryGroup.__uvType,
		//normalType = geometryGroup.__normalType,

		geometry = object.geometry, // this is shared for all chunks

		dirtyVertices = geometry.__dirtyVertices,
		dirtyElements = geometry.__dirtyElements,
		dirtyUvs = geometry.__dirtyUvs,
		//dirtyNormals = geometry.__dirtyNormals,
		//dirtyTangents = geometry.__dirtyTangents,
		//dirtyColors = geometry.__dirtyColors,
		//dirtyMorphTargets = geometry.__dirtyMorphTargets,

		vertices = geometry.vertices,
		chunk_faces = geometryGroup.faces,
		obj_faces = geometry.faces,

		obj_uvs  = geometry.faceVertexUvs[ 0 ];
		//obj_uvs2 = geometry.faceVertexUvs[ 1 ];

		//obj_colors = geometry.colors;

		//obj_skinVerticesA = geometry.skinVerticesA,
		//obj_skinVerticesB = geometry.skinVerticesB,
		//obj_skinIndices = geometry.skinIndices,
		//obj_skinWeights = geometry.skinWeights,
		//obj_edgeFaces = object instanceof THREE.ShadowVolume ? geometry.edgeFaces : undefined;

		//morphTargets = geometry.morphTargets;

		/*if ( customAttributes ) {

			for ( a in customAttributes ) {

				customAttributes[ a ].offset = 0;
				customAttributes[ a ].offsetSrc = 0;

			}

		}*/


		for ( f = 0, fl = chunk_faces.length; f < fl; f ++ ) {

			fi = chunk_faces[ f ];
			face = obj_faces[ fi ];

			if ( obj_uvs ) {

				uv = obj_uvs[ fi ];

			}

			/*if ( obj_uvs2 ) {

				uv2 = obj_uvs2[ fi ];

			}*/

			//vertexNormals = face.vertexNormals;
			//faceNormal = face.normal;

			//vertexColors = face.vertexColors;
			//faceColor = face.color;

			//vertexTangents = face.vertexTangents;

			if ( face instanceof THREE.Face3 ) {

				if ( dirtyVertices ) {

					v1 = vertices[ face.a ].position;
					v2 = vertices[ face.b ].position;
					v3 = vertices[ face.c ].position;

					vertexArray[ offset ]     = v1.x;
					vertexArray[ offset + 1 ] = v1.y;
					vertexArray[ offset + 2 ] = v1.z;

					vertexArray[ offset + 3 ] = v2.x;
					vertexArray[ offset + 4 ] = v2.y;
					vertexArray[ offset + 5 ] = v2.z;

					vertexArray[ offset + 6 ] = v3.x;
					vertexArray[ offset + 7 ] = v3.y;
					vertexArray[ offset + 8 ] = v3.z;

					offset += 9;

				}

				/*if ( customAttributes ) {

					for ( a in customAttributes ) {

						customAttribute = customAttributes[ a ];

						if ( customAttribute.needsUpdate ) {

							offset_custom = customAttribute.offset;
							offset_customSrc = customAttribute.offsetSrc;

							if( customAttribute.size === 1 ) {

								if( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {
									
									customAttribute.array[ offset_custom + 0 ] = customAttribute.value[ face.a ];
									customAttribute.array[ offset_custom + 1 ] = customAttribute.value[ face.b ];
									customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ face.c ];
									
								} else if( customAttribute.boundTo === "faces" ) {
									
									customAttribute.array[ offset_custom + 0 ] = customAttribute.value[ offset_customSrc ];
									customAttribute.array[ offset_custom + 1 ] = customAttribute.value[ offset_customSrc ];
									customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ offset_customSrc ];

									customAttribute.offsetSrc++;
								
								} else if( customAttribute.boundTo === "faceVertices" ) {
									
									customAttribute.array[ offset_custom + 0 ] = customAttribute.value[ offset_customSrc + 0 ];
									customAttribute.array[ offset_custom + 1 ] = customAttribute.value[ offset_customSrc + 1 ];
									customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ offset_customSrc + 2 ];
									
									customAttribute.offsetSrc += 3;
	
								}

								customAttribute.offset += 3;

							} else {

								if( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {
									
									v1 = customAttribute.value[ face.a ];
									v2 = customAttribute.value[ face.b ];
									v3 = customAttribute.value[ face.c ];
									
								} else if( customAttribute.boundTo === "faces" ) {
									
									v1 = customAttribute.value[ offset_customSrc ];
									v2 = customAttribute.value[ offset_customSrc ];
									v3 = customAttribute.value[ offset_customSrc ];

									customAttribute.offsetSrc++;
									
								} else if( customAttribute.boundTo === "faceVertices" ) {
									
									v1 = customAttribute.value[ offset_customSrc + 0 ];
									v2 = customAttribute.value[ offset_customSrc + 1 ];
									v3 = customAttribute.value[ offset_customSrc + 2 ];
									
									customAttribute.offsetSrc += 3;
								}
								

								if( customAttribute.size === 2 ) {

									customAttribute.array[ offset_custom + 0 ] = v1.x;
									customAttribute.array[ offset_custom + 1 ] = v1.y;

									customAttribute.array[ offset_custom + 2 ] = v2.x;
									customAttribute.array[ offset_custom + 3 ] = v2.y;

									customAttribute.array[ offset_custom + 4 ] = v3.x;
									customAttribute.array[ offset_custom + 5 ] = v3.y;

									customAttribute.offset += 6;

								} else if( customAttribute.size === 3 ) {

									if( customAttribute.type === "c" ) {
										
										customAttribute.array[ offset_custom + 0 ] = v1.r;
										customAttribute.array[ offset_custom + 1 ] = v1.g;
										customAttribute.array[ offset_custom + 2 ] = v1.b;

										customAttribute.array[ offset_custom + 3 ] = v2.r;
										customAttribute.array[ offset_custom + 4 ] = v2.g;
										customAttribute.array[ offset_custom + 5 ] = v2.b;

										customAttribute.array[ offset_custom + 6 ] = v3.r;
										customAttribute.array[ offset_custom + 7 ] = v3.g;
										customAttribute.array[ offset_custom + 8 ] = v3.b;
										
									} else {
										
										customAttribute.array[ offset_custom + 0 ] = v1.x;
										customAttribute.array[ offset_custom + 1 ] = v1.y;
										customAttribute.array[ offset_custom + 2 ] = v1.z;

										customAttribute.array[ offset_custom + 3 ] = v2.x;
										customAttribute.array[ offset_custom + 4 ] = v2.y;
										customAttribute.array[ offset_custom + 5 ] = v2.z;

										customAttribute.array[ offset_custom + 6 ] = v3.x;
										customAttribute.array[ offset_custom + 7 ] = v3.y;
										customAttribute.array[ offset_custom + 8 ] = v3.z;
										
									}

									customAttribute.offset += 9;

								} else {

									customAttribute.array[ offset_custom + 0  ] = v1.x;
									customAttribute.array[ offset_custom + 1  ] = v1.y;
									customAttribute.array[ offset_custom + 2  ] = v1.z;
									customAttribute.array[ offset_custom + 3  ] = v1.w;

									customAttribute.array[ offset_custom + 4  ] = v2.x;
									customAttribute.array[ offset_custom + 5  ] = v2.y;
									customAttribute.array[ offset_custom + 6  ] = v2.z;
									customAttribute.array[ offset_custom + 7  ] = v2.w;

									customAttribute.array[ offset_custom + 8  ] = v3.x;
									customAttribute.array[ offset_custom + 9  ] = v3.y;
									customAttribute.array[ offset_custom + 10 ] = v3.z;
									customAttribute.array[ offset_custom + 11 ] = v3.w;

									customAttribute.offset += 12;

								}

							}

						}

					}

				}*/


				/*if ( dirtyMorphTargets ) {

					for ( vk = 0, vkl = morphTargets.length; vk < vkl; vk ++ ) {

						v1 = morphTargets[ vk ].vertices[ face.a ].position;
						v2 = morphTargets[ vk ].vertices[ face.b ].position;
						v3 = morphTargets[ vk ].vertices[ face.c ].position;

						vka = morphTargetsArrays[ vk ];

						vka[ offset_morphTarget + 0 ] = v1.x;
						vka[ offset_morphTarget + 1 ] = v1.y;
						vka[ offset_morphTarget + 2 ] = v1.z;

						vka[ offset_morphTarget + 3 ] = v2.x;
						vka[ offset_morphTarget + 4 ] = v2.y;
						vka[ offset_morphTarget + 5 ] = v2.z;

						vka[ offset_morphTarget + 6 ] = v3.x;
						vka[ offset_morphTarget + 7 ] = v3.y;
						vka[ offset_morphTarget + 8 ] = v3.z;
					}

					offset_morphTarget += 9;

				}*/

				/*if ( obj_skinWeights.length ) {

					// weights

					sw1 = obj_skinWeights[ face.a ];
					sw2 = obj_skinWeights[ face.b ];
					sw3 = obj_skinWeights[ face.c ];

					skinWeightArray[ offset_skin ]     = sw1.x;
					skinWeightArray[ offset_skin + 1 ] = sw1.y;
					skinWeightArray[ offset_skin + 2 ] = sw1.z;
					skinWeightArray[ offset_skin + 3 ] = sw1.w;

					skinWeightArray[ offset_skin + 4 ] = sw2.x;
					skinWeightArray[ offset_skin + 5 ] = sw2.y;
					skinWeightArray[ offset_skin + 6 ] = sw2.z;
					skinWeightArray[ offset_skin + 7 ] = sw2.w;

					skinWeightArray[ offset_skin + 8 ]  = sw3.x;
					skinWeightArray[ offset_skin + 9 ]  = sw3.y;
					skinWeightArray[ offset_skin + 10 ] = sw3.z;
					skinWeightArray[ offset_skin + 11 ] = sw3.w;

					// indices

					si1 = obj_skinIndices[ face.a ];
					si2 = obj_skinIndices[ face.b ];
					si3 = obj_skinIndices[ face.c ];

					skinIndexArray[ offset_skin ]     = si1.x;
					skinIndexArray[ offset_skin + 1 ] = si1.y;
					skinIndexArray[ offset_skin + 2 ] = si1.z;
					skinIndexArray[ offset_skin + 3 ] = si1.w;

					skinIndexArray[ offset_skin + 4 ] = si2.x;
					skinIndexArray[ offset_skin + 5 ] = si2.y;
					skinIndexArray[ offset_skin + 6 ] = si2.z;
					skinIndexArray[ offset_skin + 7 ] = si2.w;

					skinIndexArray[ offset_skin + 8 ]  = si3.x;
					skinIndexArray[ offset_skin + 9 ]  = si3.y;
					skinIndexArray[ offset_skin + 10 ] = si3.z;
					skinIndexArray[ offset_skin + 11 ] = si3.w;

					// vertices A

					sa1 = obj_skinVerticesA[ face.a ];
					sa2 = obj_skinVerticesA[ face.b ];
					sa3 = obj_skinVerticesA[ face.c ];

					skinVertexAArray[ offset_skin ]     = sa1.x;
					skinVertexAArray[ offset_skin + 1 ] = sa1.y;
					skinVertexAArray[ offset_skin + 2 ] = sa1.z;
					skinVertexAArray[ offset_skin + 3 ] = 1; // pad for faster vertex shader

					skinVertexAArray[ offset_skin + 4 ] = sa2.x;
					skinVertexAArray[ offset_skin + 5 ] = sa2.y;
					skinVertexAArray[ offset_skin + 6 ] = sa2.z;
					skinVertexAArray[ offset_skin + 7 ] = 1;

					skinVertexAArray[ offset_skin + 8 ]  = sa3.x;
					skinVertexAArray[ offset_skin + 9 ]  = sa3.y;
					skinVertexAArray[ offset_skin + 10 ] = sa3.z;
					skinVertexAArray[ offset_skin + 11 ] = 1;

					// vertices B

					sb1 = obj_skinVerticesB[ face.a ];
					sb2 = obj_skinVerticesB[ face.b ];
					sb3 = obj_skinVerticesB[ face.c ];

					skinVertexBArray[ offset_skin ]     = sb1.x;
					skinVertexBArray[ offset_skin + 1 ] = sb1.y;
					skinVertexBArray[ offset_skin + 2 ] = sb1.z;
					skinVertexBArray[ offset_skin + 3 ] = 1; // pad for faster vertex shader

					skinVertexBArray[ offset_skin + 4 ] = sb2.x;
					skinVertexBArray[ offset_skin + 5 ] = sb2.y;
					skinVertexBArray[ offset_skin + 6 ] = sb2.z;
					skinVertexBArray[ offset_skin + 7 ] = 1;

					skinVertexBArray[ offset_skin + 8 ]  = sb3.x;
					skinVertexBArray[ offset_skin + 9 ]  = sb3.y;
					skinVertexBArray[ offset_skin + 10 ] = sb3.z;
					skinVertexBArray[ offset_skin + 11 ] = 1;

					offset_skin += 12;

				}*/

				/*if ( dirtyColors && vertexColorType ) {

					if ( vertexColors.length == 3 && vertexColorType == THREE.VertexColors ) {

						c1 = vertexColors[ 0 ];
						c2 = vertexColors[ 1 ];
						c3 = vertexColors[ 2 ];

					} else {

						c1 = faceColor;
						c2 = faceColor;
						c3 = faceColor;

					}

					colorArray[ offset_color ]     = c1.r;
					colorArray[ offset_color + 1 ] = c1.g;
					colorArray[ offset_color + 2 ] = c1.b;

					colorArray[ offset_color + 3 ] = c2.r;
					colorArray[ offset_color + 4 ] = c2.g;
					colorArray[ offset_color + 5 ] = c2.b;

					colorArray[ offset_color + 6 ] = c3.r;
					colorArray[ offset_color + 7 ] = c3.g;
					colorArray[ offset_color + 8 ] = c3.b;

					offset_color += 9;

				}*/

				/*if ( dirtyTangents && geometry.hasTangents ) {

					t1 = vertexTangents[ 0 ];
					t2 = vertexTangents[ 1 ];
					t3 = vertexTangents[ 2 ];

					tangentArray[ offset_tangent ]     = t1.x;
					tangentArray[ offset_tangent + 1 ] = t1.y;
					tangentArray[ offset_tangent + 2 ] = t1.z;
					tangentArray[ offset_tangent + 3 ] = t1.w;

					tangentArray[ offset_tangent + 4 ] = t2.x;
					tangentArray[ offset_tangent + 5 ] = t2.y;
					tangentArray[ offset_tangent + 6 ] = t2.z;
					tangentArray[ offset_tangent + 7 ] = t2.w;

					tangentArray[ offset_tangent + 8 ]  = t3.x;
					tangentArray[ offset_tangent + 9 ]  = t3.y;
					tangentArray[ offset_tangent + 10 ] = t3.z;
					tangentArray[ offset_tangent + 11 ] = t3.w;

					offset_tangent += 12;

				}*/

				/*if ( dirtyNormals && normalType ) {

					if ( vertexNormals.length == 3 && needsSmoothNormals ) {

						for ( i = 0; i < 3; i ++ ) {

							vn = vertexNormals[ i ];

							normalArray[ offset_normal ]     = vn.x;
							normalArray[ offset_normal + 1 ] = vn.y;
							normalArray[ offset_normal + 2 ] = vn.z;

							offset_normal += 3;

						}

					} else {

						for ( i = 0; i < 3; i ++ ) {

							normalArray[ offset_normal ]     = faceNormal.x;
							normalArray[ offset_normal + 1 ] = faceNormal.y;
							normalArray[ offset_normal + 2 ] = faceNormal.z;

							offset_normal += 3;

						}

					}

				}*/

				if ( dirtyUvs && uv !== undefined && uvType ) {

					for ( i = 0; i < 3; i ++ ) {

						uvi = uv[ i ];

						uvArray[ offset_uv ]     = uvi.u;
						uvArray[ offset_uv + 1 ] = uvi.v;

						offset_uv += 2;

					}

				}

				/*if ( dirtyUvs && uv2 !== undefined && uvType ) {

					for ( i = 0; i < 3; i ++ ) {

						uv2i = uv2[ i ];

						uv2Array[ offset_uv2 ]     = uv2i.u;
						uv2Array[ offset_uv2 + 1 ] = uv2i.v;

						offset_uv2 += 2;

					}

				}*/

				if ( dirtyElements ) {

					faceArray[ offset_face ] = vertexIndex;
					faceArray[ offset_face + 1 ] = vertexIndex + 1;
					faceArray[ offset_face + 2 ] = vertexIndex + 2;

					offset_face += 3;

					//lineArray[ offset_line ]     = vertexIndex;
					//lineArray[ offset_line + 1 ] = vertexIndex + 1;

					//lineArray[ offset_line + 2 ] = vertexIndex;
					//lineArray[ offset_line + 3 ] = vertexIndex + 2;

					//lineArray[ offset_line + 4 ] = vertexIndex + 1;
					//lineArray[ offset_line + 5 ] = vertexIndex + 2;

					//offset_line += 6;

					vertexIndex += 3;

				}


			} /*else if ( face instanceof THREE.Face4 ) {

				if ( dirtyVertices ) {

					v1 = vertices[ face.a ].position;
					v2 = vertices[ face.b ].position;
					v3 = vertices[ face.c ].position;
					v4 = vertices[ face.d ].position;

					vertexArray[ offset ]     = v1.x;
					vertexArray[ offset + 1 ] = v1.y;
					vertexArray[ offset + 2 ] = v1.z;

					vertexArray[ offset + 3 ] = v2.x;
					vertexArray[ offset + 4 ] = v2.y;
					vertexArray[ offset + 5 ] = v2.z;

					vertexArray[ offset + 6 ] = v3.x;
					vertexArray[ offset + 7 ] = v3.y;
					vertexArray[ offset + 8 ] = v3.z;

					vertexArray[ offset + 9 ]  = v4.x;
					vertexArray[ offset + 10 ] = v4.y;
					vertexArray[ offset + 11 ] = v4.z;

					offset += 12;

				}

				if ( customAttributes ) {

					for ( a in customAttributes ) {

						customAttribute = customAttributes[ a ];

						if ( customAttribute.needsUpdate ) {

							offset_custom = customAttribute.offset;
							offset_customSrc = customAttribute.offsetSrc;

							if( customAttribute.size === 1 ) {

								if( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {
									
									customAttribute.array[ offset_custom + 0 ] = customAttribute.value[ face.a ];
									customAttribute.array[ offset_custom + 1 ] = customAttribute.value[ face.b ];
									customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ face.c ];
									customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ face.d ];
									
								} else if( customAttribute.boundTo === "faces" ) {
									
									customAttribute.array[ offset_custom + 0 ] = customAttribute.value[ offset_customSrc ];
									customAttribute.array[ offset_custom + 1 ] = customAttribute.value[ offset_customSrc ];
									customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ offset_customSrc ];
									customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ offset_customSrc ];

									customAttribute.offsetSrc++;
									
								} else if( customAttribute.boundTo === "faceVertices" ) {
									
									customAttribute.array[ offset_custom + 0 ] = customAttribute.value[ offset_customSrc + 0 ];
									customAttribute.array[ offset_custom + 1 ] = customAttribute.value[ offset_customSrc + 1 ];
									customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ offset_customSrc + 2 ];
									customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ offset_customSrc + 3 ];
									
									customAttribute.offsetSrc += 4;
								}

								customAttribute.offset += 4;

							} else {

								if( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {
									
									v1 = customAttribute.value[ face.a ];
									v2 = customAttribute.value[ face.b ];
									v3 = customAttribute.value[ face.c ];
									v4 = customAttribute.value[ face.d ];
									
								} else if( customAttribute.boundTo === "faces" ) {
									
									v1 = customAttribute.value[ offset_customSrc ];
									v2 = customAttribute.value[ offset_customSrc ];
									v3 = customAttribute.value[ offset_customSrc ];
									v4 = customAttribute.value[ offset_customSrc ];

									customAttribute.offsetSrc++;
									
								} else if( customAttribute.boundTo === "faceVertices" ) {
									
									v1 = customAttribute.value[ offset_customSrc + 0 ];
									v2 = customAttribute.value[ offset_customSrc + 1 ];
									v3 = customAttribute.value[ offset_customSrc + 2 ];
									v4 = customAttribute.value[ offset_customSrc + 3 ];
									
									customAttribute.offsetSrc += 4;
								}


								if( customAttribute.size === 2 ) {

									customAttribute.array[ offset_custom + 0 ] = v1.x;
									customAttribute.array[ offset_custom + 1 ] = v1.y;

									customAttribute.array[ offset_custom + 2 ] = v2.x;
									customAttribute.array[ offset_custom + 3 ] = v2.y;

									customAttribute.array[ offset_custom + 4 ] = v3.x;
									customAttribute.array[ offset_custom + 5 ] = v3.y;

									customAttribute.array[ offset_custom + 6 ] = v4.x;
									customAttribute.array[ offset_custom + 7 ] = v4.y;

									customAttribute.offset += 8;

								} else if( customAttribute.size === 3 ) {

									if( customAttribute.type === "c" ) {
										
										customAttribute.array[ offset_custom + 0  ] = v1.r;
										customAttribute.array[ offset_custom + 1  ] = v1.g;
										customAttribute.array[ offset_custom + 2  ] = v1.b;

										customAttribute.array[ offset_custom + 3  ] = v2.r;
										customAttribute.array[ offset_custom + 4  ] = v2.g;
										customAttribute.array[ offset_custom + 5  ] = v2.b;

										customAttribute.array[ offset_custom + 6  ] = v3.r;
										customAttribute.array[ offset_custom + 7  ] = v3.g;
										customAttribute.array[ offset_custom + 8  ] = v3.b;

										customAttribute.array[ offset_custom + 9  ] = v4.r;
										customAttribute.array[ offset_custom + 10 ] = v4.g;
										customAttribute.array[ offset_custom + 11 ] = v4.b;

									} else {
										
										customAttribute.array[ offset_custom + 0  ] = v1.x;
										customAttribute.array[ offset_custom + 1  ] = v1.y;
										customAttribute.array[ offset_custom + 2  ] = v1.z;

										customAttribute.array[ offset_custom + 3  ] = v2.x;
										customAttribute.array[ offset_custom + 4  ] = v2.y;
										customAttribute.array[ offset_custom + 5  ] = v2.z;

										customAttribute.array[ offset_custom + 6  ] = v3.x;
										customAttribute.array[ offset_custom + 7  ] = v3.y;
										customAttribute.array[ offset_custom + 8  ] = v3.z;

										customAttribute.array[ offset_custom + 9  ] = v4.x;
										customAttribute.array[ offset_custom + 10 ] = v4.y;
										customAttribute.array[ offset_custom + 11 ] = v4.z;
										
									}

									customAttribute.offset += 12;

								} else {

									customAttribute.array[ offset_custom + 0  ] = v1.x;
									customAttribute.array[ offset_custom + 1  ] = v1.y;
									customAttribute.array[ offset_custom + 2  ] = v1.z;
									customAttribute.array[ offset_custom + 3  ] = v1.w;

									customAttribute.array[ offset_custom + 4  ] = v2.x;
									customAttribute.array[ offset_custom + 5  ] = v2.y;
									customAttribute.array[ offset_custom + 6  ] = v2.z;
									customAttribute.array[ offset_custom + 7  ] = v2.w;

									customAttribute.array[ offset_custom + 8  ] = v3.x;
									customAttribute.array[ offset_custom + 9  ] = v3.y;
									customAttribute.array[ offset_custom + 10 ] = v3.z;
									customAttribute.array[ offset_custom + 11 ] = v3.w;

									customAttribute.array[ offset_custom + 12 ] = v4.x;
									customAttribute.array[ offset_custom + 13 ] = v4.y;
									customAttribute.array[ offset_custom + 14 ] = v4.z;
									customAttribute.array[ offset_custom + 15 ] = v4.w;

									customAttribute.offset += 16;

								}

							}

						}

					}

				}


				if ( dirtyMorphTargets ) {

					for ( vk = 0, vkl = morphTargets.length; vk < vkl; vk++ ) {

						v1 = morphTargets[ vk ].vertices[ face.a ].position;
						v2 = morphTargets[ vk ].vertices[ face.b ].position;
						v3 = morphTargets[ vk ].vertices[ face.c ].position;
						v4 = morphTargets[ vk ].vertices[ face.d ].position;

						vka = morphTargetsArrays[ vk ];

						vka[ offset_morphTarget + 0 ] = v1.x;
						vka[ offset_morphTarget + 1 ] = v1.y;
						vka[ offset_morphTarget + 2 ] = v1.z;

						vka[ offset_morphTarget + 3 ] = v2.x;
						vka[ offset_morphTarget + 4 ] = v2.y;
						vka[ offset_morphTarget + 5 ] = v2.z;

						vka[ offset_morphTarget + 6 ] = v3.x;
						vka[ offset_morphTarget + 7 ] = v3.y;
						vka[ offset_morphTarget + 8 ] = v3.z;

						vka[ offset_morphTarget + 9 ] = v4.x;
						vka[ offset_morphTarget + 10 ] = v4.y;
						vka[ offset_morphTarget + 11 ] = v4.z;
					}

					offset_morphTarget += 12;

				}

				if ( obj_skinWeights.length ) {

					// weights

					sw1 = obj_skinWeights[ face.a ];
					sw2 = obj_skinWeights[ face.b ];
					sw3 = obj_skinWeights[ face.c ];
					sw4 = obj_skinWeights[ face.d ];

					skinWeightArray[ offset_skin ]     = sw1.x;
					skinWeightArray[ offset_skin + 1 ] = sw1.y;
					skinWeightArray[ offset_skin + 2 ] = sw1.z;
					skinWeightArray[ offset_skin + 3 ] = sw1.w;

					skinWeightArray[ offset_skin + 4 ] = sw2.x;
					skinWeightArray[ offset_skin + 5 ] = sw2.y;
					skinWeightArray[ offset_skin + 6 ] = sw2.z;
					skinWeightArray[ offset_skin + 7 ] = sw2.w;

					skinWeightArray[ offset_skin + 8 ]  = sw3.x;
					skinWeightArray[ offset_skin + 9 ]  = sw3.y;
					skinWeightArray[ offset_skin + 10 ] = sw3.z;
					skinWeightArray[ offset_skin + 11 ] = sw3.w;

					skinWeightArray[ offset_skin + 12 ] = sw4.x;
					skinWeightArray[ offset_skin + 13 ] = sw4.y;
					skinWeightArray[ offset_skin + 14 ] = sw4.z;
					skinWeightArray[ offset_skin + 15 ] = sw4.w;

					// indices

					si1 = obj_skinIndices[ face.a ];
					si2 = obj_skinIndices[ face.b ];
					si3 = obj_skinIndices[ face.c ];
					si4 = obj_skinIndices[ face.d ];

					skinIndexArray[ offset_skin ]     = si1.x;
					skinIndexArray[ offset_skin + 1 ] = si1.y;
					skinIndexArray[ offset_skin + 2 ] = si1.z;
					skinIndexArray[ offset_skin + 3 ] = si1.w;

					skinIndexArray[ offset_skin + 4 ] = si2.x;
					skinIndexArray[ offset_skin + 5 ] = si2.y;
					skinIndexArray[ offset_skin + 6 ] = si2.z;
					skinIndexArray[ offset_skin + 7 ] = si2.w;

					skinIndexArray[ offset_skin + 8 ]  = si3.x;
					skinIndexArray[ offset_skin + 9 ]  = si3.y;
					skinIndexArray[ offset_skin + 10 ] = si3.z;
					skinIndexArray[ offset_skin + 11 ] = si3.w;

					skinIndexArray[ offset_skin + 12 ] = si4.x;
					skinIndexArray[ offset_skin + 13 ] = si4.y;
					skinIndexArray[ offset_skin + 14 ] = si4.z;
					skinIndexArray[ offset_skin + 15 ] = si4.w;

					// vertices A

					sa1 = obj_skinVerticesA[ face.a ];
					sa2 = obj_skinVerticesA[ face.b ];
					sa3 = obj_skinVerticesA[ face.c ];
					sa4 = obj_skinVerticesA[ face.d ];

					skinVertexAArray[ offset_skin ]     = sa1.x;
					skinVertexAArray[ offset_skin + 1 ] = sa1.y;
					skinVertexAArray[ offset_skin + 2 ] = sa1.z;
					skinVertexAArray[ offset_skin + 3 ] = 1; // pad for faster vertex shader

					skinVertexAArray[ offset_skin + 4 ] = sa2.x;
					skinVertexAArray[ offset_skin + 5 ] = sa2.y;
					skinVertexAArray[ offset_skin + 6 ] = sa2.z;
					skinVertexAArray[ offset_skin + 7 ] = 1;

					skinVertexAArray[ offset_skin + 8 ]  = sa3.x;
					skinVertexAArray[ offset_skin + 9 ]  = sa3.y;
					skinVertexAArray[ offset_skin + 10 ] = sa3.z;
					skinVertexAArray[ offset_skin + 11 ] = 1;

					skinVertexAArray[ offset_skin + 12 ] = sa4.x;
					skinVertexAArray[ offset_skin + 13 ] = sa4.y;
					skinVertexAArray[ offset_skin + 14 ] = sa4.z;
					skinVertexAArray[ offset_skin + 15 ] = 1;

					// vertices B

					sb1 = obj_skinVerticesB[ face.a ];
					sb2 = obj_skinVerticesB[ face.b ];
					sb3 = obj_skinVerticesB[ face.c ];
					sb4 = obj_skinVerticesB[ face.d ];

					skinVertexBArray[ offset_skin ]     = sb1.x;
					skinVertexBArray[ offset_skin + 1 ] = sb1.y;
					skinVertexBArray[ offset_skin + 2 ] = sb1.z;
					skinVertexBArray[ offset_skin + 3 ] = 1; // pad for faster vertex shader

					skinVertexBArray[ offset_skin + 4 ] = sb2.x;
					skinVertexBArray[ offset_skin + 5 ] = sb2.y;
					skinVertexBArray[ offset_skin + 6 ] = sb2.z;
					skinVertexBArray[ offset_skin + 7 ] = 1;

					skinVertexBArray[ offset_skin + 8 ]  = sb3.x;
					skinVertexBArray[ offset_skin + 9 ]  = sb3.y;
					skinVertexBArray[ offset_skin + 10 ] = sb3.z;
					skinVertexBArray[ offset_skin + 11 ] = 1;

					skinVertexBArray[ offset_skin + 12 ] = sb4.x;
					skinVertexBArray[ offset_skin + 13 ] = sb4.y;
					skinVertexBArray[ offset_skin + 14 ] = sb4.z;
					skinVertexBArray[ offset_skin + 15 ] = 1;

					offset_skin += 16;

				}

				if ( dirtyColors && vertexColorType ) {

					if ( vertexColors.length == 4 && vertexColorType == THREE.VertexColors ) {

						c1 = vertexColors[ 0 ];
						c2 = vertexColors[ 1 ];
						c3 = vertexColors[ 2 ];
						c4 = vertexColors[ 3 ];

					} else {

						c1 = faceColor;
						c2 = faceColor;
						c3 = faceColor;
						c4 = faceColor;

					}

					colorArray[ offset_color ]     = c1.r;
					colorArray[ offset_color + 1 ] = c1.g;
					colorArray[ offset_color + 2 ] = c1.b;

					colorArray[ offset_color + 3 ] = c2.r;
					colorArray[ offset_color + 4 ] = c2.g;
					colorArray[ offset_color + 5 ] = c2.b;

					colorArray[ offset_color + 6 ] = c3.r;
					colorArray[ offset_color + 7 ] = c3.g;
					colorArray[ offset_color + 8 ] = c3.b;

					colorArray[ offset_color + 9 ]  = c4.r;
					colorArray[ offset_color + 10 ] = c4.g;
					colorArray[ offset_color + 11 ] = c4.b;

					offset_color += 12;

				}

				if ( dirtyTangents && geometry.hasTangents ) {

					t1 = vertexTangents[ 0 ];
					t2 = vertexTangents[ 1 ];
					t3 = vertexTangents[ 2 ];
					t4 = vertexTangents[ 3 ];

					tangentArray[ offset_tangent ]     = t1.x;
					tangentArray[ offset_tangent + 1 ] = t1.y;
					tangentArray[ offset_tangent + 2 ] = t1.z;
					tangentArray[ offset_tangent + 3 ] = t1.w;

					tangentArray[ offset_tangent + 4 ] = t2.x;
					tangentArray[ offset_tangent + 5 ] = t2.y;
					tangentArray[ offset_tangent + 6 ] = t2.z;
					tangentArray[ offset_tangent + 7 ] = t2.w;

					tangentArray[ offset_tangent + 8 ]  = t3.x;
					tangentArray[ offset_tangent + 9 ]  = t3.y;
					tangentArray[ offset_tangent + 10 ] = t3.z;
					tangentArray[ offset_tangent + 11 ] = t3.w;

					tangentArray[ offset_tangent + 12 ] = t4.x;
					tangentArray[ offset_tangent + 13 ] = t4.y;
					tangentArray[ offset_tangent + 14 ] = t4.z;
					tangentArray[ offset_tangent + 15 ] = t4.w;

					offset_tangent += 16;

				}

				if ( dirtyNormals && normalType ) {

					if ( vertexNormals.length == 4 && needsSmoothNormals ) {

						for ( i = 0; i < 4; i ++ ) {

							vn = vertexNormals[ i ];

							normalArray[ offset_normal ]     = vn.x;
							normalArray[ offset_normal + 1 ] = vn.y;
							normalArray[ offset_normal + 2 ] = vn.z;

							offset_normal += 3;

						}

					} else {

						for ( i = 0; i < 4; i ++ ) {

							normalArray[ offset_normal ]     = faceNormal.x;
							normalArray[ offset_normal + 1 ] = faceNormal.y;
							normalArray[ offset_normal + 2 ] = faceNormal.z;

							offset_normal += 3;

						}

					}

				}

				if ( dirtyUvs && uv !== undefined && uvType ) {

					for ( i = 0; i < 4; i ++ ) {

						uvi = uv[ i ];

						uvArray[ offset_uv ]     = uvi.u;
						uvArray[ offset_uv + 1 ] = uvi.v;

						offset_uv += 2;

					}

				}

				if ( dirtyUvs && uv2 !== undefined && uvType ) {

					for ( i = 0; i < 4; i ++ ) {

						uv2i = uv2[ i ];

						uv2Array[ offset_uv2 ]     = uv2i.u;
						uv2Array[ offset_uv2 + 1 ] = uv2i.v;

						offset_uv2 += 2;

					}

				}

				if ( dirtyElements ) {

					faceArray[ offset_face ]     = vertexIndex;
					faceArray[ offset_face + 1 ] = vertexIndex + 1;
					faceArray[ offset_face + 2 ] = vertexIndex + 3;

					faceArray[ offset_face + 3 ] = vertexIndex + 1;
					faceArray[ offset_face + 4 ] = vertexIndex + 2;
					faceArray[ offset_face + 5 ] = vertexIndex + 3;

					offset_face += 6;

					lineArray[ offset_line ]     = vertexIndex;
					lineArray[ offset_line + 1 ] = vertexIndex + 1;

					lineArray[ offset_line + 2 ] = vertexIndex;
					lineArray[ offset_line + 3 ] = vertexIndex + 3;

					lineArray[ offset_line + 4 ] = vertexIndex + 1;
					lineArray[ offset_line + 5 ] = vertexIndex + 2;

					lineArray[ offset_line + 6 ] = vertexIndex + 2;
					lineArray[ offset_line + 7 ] = vertexIndex + 3;

					offset_line += 8;

					vertexIndex += 4;

				}

			}*/

		}

		/*if ( obj_edgeFaces ) {

			for ( f = 0, fl = obj_edgeFaces.length; f < fl; f ++ ) {

				faceArray[ offset_face ]     = obj_edgeFaces[ f ].a;
				faceArray[ offset_face + 1 ] = obj_edgeFaces[ f ].b;
				faceArray[ offset_face + 2 ] = obj_edgeFaces[ f ].c;

				faceArray[ offset_face + 3 ] = obj_edgeFaces[ f ].a;
				faceArray[ offset_face + 4 ] = obj_edgeFaces[ f ].c;
				faceArray[ offset_face + 5 ] = obj_edgeFaces[ f ].d;

				offset_face += 6;
			}

		}*/

		if ( dirtyVertices ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );

		}

		/*if ( customAttributes ) {

			for ( a in customAttributes ) {

				customAttribute = customAttributes[ a ];

				if ( customAttribute.needsUpdate ) {

					_gl.bindBuffer( _gl.ARRAY_BUFFER, customAttribute.buffer );
					_gl.bufferData( _gl.ARRAY_BUFFER, customAttribute.array, hint );

					customAttribute.needsUpdate = false;

				}

			}

		}*/

		/*if ( dirtyMorphTargets ) {

			for ( vk = 0, vkl = morphTargets.length; vk < vkl; vk ++ ) {

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ vk ] );
				_gl.bufferData( _gl.ARRAY_BUFFER, morphTargetsArrays[ vk ], hint );

			}
		}*/

		/*if ( dirtyColors && offset_color > 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglColorBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, colorArray, hint );

		}*/

		/*if ( dirtyNormals ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglNormalBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, normalArray, hint );

		}*/

		/*if ( dirtyTangents && geometry.hasTangents ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglTangentBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, tangentArray, hint );

		}*/

		if ( dirtyUvs && offset_uv > 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglUVBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, uvArray, hint );

		}

		/*if ( dirtyUvs && offset_uv2 > 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglUV2Buffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, uv2Array, hint );

		}*/

		if ( dirtyElements ) {

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglFaceBuffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, faceArray, hint );

			//_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglLineBuffer );
			//_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, lineArray, hint );

		}

		/*if ( offset_skin > 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinVertexABuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, skinVertexAArray, hint );

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinVertexBBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, skinVertexBArray, hint );

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinIndicesBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, skinIndexArray, hint );

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinWeightsBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, skinWeightArray, hint );

		}*/

	};

	/*function setLineBuffers ( geometry, hint ) {

		var v, c, vertex, offset,
		vertices = geometry.vertices,
		colors = geometry.colors,
		vl = vertices.length,
		cl = colors.length,

		vertexArray = geometry.__vertexArray,
		colorArray = geometry.__colorArray,

		dirtyVertices = geometry.__dirtyVertices,
		dirtyColors = geometry.__dirtyColors;

		if ( dirtyVertices ) {

			for ( v = 0; v < vl; v++ ) {

				vertex = vertices[ v ].position;

				offset = v * 3;

				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;

			}

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );

		}

		if ( dirtyColors ) {

			for ( c = 0; c < cl; c++ ) {

				color = colors[ c ];

				offset = c * 3;

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;

			}

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglColorBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, colorArray, hint );

		}

	};

	function setRibbonBuffers ( geometry, hint ) {

		var v, c, vertex, offset,
		vertices = geometry.vertices,
		colors = geometry.colors,
		vl = vertices.length,
		cl = colors.length,

		vertexArray = geometry.__vertexArray,
		colorArray = geometry.__colorArray,

		dirtyVertices = geometry.__dirtyVertices,
		dirtyColors = geometry.__dirtyColors;

		if ( dirtyVertices ) {

			for ( v = 0; v < vl; v++ ) {

				vertex = vertices[ v ].position;

				offset = v * 3;

				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;

			}

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );

		}

		if ( dirtyColors ) {

			for ( c = 0; c < cl; c++ ) {

				color = colors[ c ];

				offset = c * 3;

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;

			}

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglColorBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, colorArray, hint );

		}

	};

	function setParticleBuffers ( geometry, hint, object ) {

		var v, c, vertex, offset,
		vertices = geometry.vertices,
		vl = vertices.length,

		colors = geometry.colors,
		cl = colors.length,

		vertexArray = geometry.__vertexArray,
		colorArray = geometry.__colorArray,

		sortArray = geometry.__sortArray,

		dirtyVertices = geometry.__dirtyVertices,
		dirtyElements = geometry.__dirtyElements,
		dirtyColors = geometry.__dirtyColors;

		if ( object.sortParticles ) {

			_projScreenMatrix.multiplySelf( object.matrixWorld );

			for ( v = 0; v < vl; v++ ) {

				vertex = vertices[ v ].position;

				_vector3.copy( vertex );
				_projScreenMatrix.multiplyVector3( _vector3 );

				sortArray[ v ] = [ _vector3.z, v ];

			}

			sortArray.sort( function(a,b) { return b[0] - a[0]; } );

			for ( v = 0; v < vl; v++ ) {

				vertex = vertices[ sortArray[v][1] ].position;

				offset = v * 3;

				vertexArray[ offset ]     = vertex.x;
				vertexArray[ offset + 1 ] = vertex.y;
				vertexArray[ offset + 2 ] = vertex.z;

			}

			for ( c = 0; c < cl; c++ ) {

				offset = c * 3;

				color = colors[ sortArray[c][1] ];

				colorArray[ offset ]     = color.r;
				colorArray[ offset + 1 ] = color.g;
				colorArray[ offset + 2 ] = color.b;

			}


		} else {

			if ( dirtyVertices ) {

				for ( v = 0; v < vl; v++ ) {

					vertex = vertices[ v ].position;

					offset = v * 3;

					vertexArray[ offset ]     = vertex.x;
					vertexArray[ offset + 1 ] = vertex.y;
					vertexArray[ offset + 2 ] = vertex.z;

				}

			}

			if ( dirtyColors ) {

				for ( c = 0; c < cl; c++ ) {

					color = colors[ c ];

					offset = c * 3;

					colorArray[ offset ]     = color.r;
					colorArray[ offset + 1 ] = color.g;
					colorArray[ offset + 2 ] = color.b;

				}

			}

		}

		if ( dirtyVertices || object.sortParticles ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );

		}

		if ( dirtyColors || object.sortParticles ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometry.__webglColorBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, colorArray, hint );

		}

	};*/

	function setMaterialShaders( material, shaders ) {

		material.uniforms = THREE.UniformsUtils.clone( shaders.uniforms );
		material.vertexShader = shaders.vertexShader;
		material.fragmentShader = shaders.fragmentShader;

	};

	function refreshUniformsCommon( uniforms, material ) {

		uniforms.diffuse.value = material.color;
		uniforms.opacity.value = material.opacity;
		uniforms.map.texture = material.map;

		uniforms.lightMap.texture = material.lightMap;

		uniforms.envMap.texture = material.envMap;
		uniforms.reflectivity.value = material.reflectivity;
		uniforms.refractionRatio.value = material.refractionRatio;
		uniforms.combine.value = material.combine;
		uniforms.useRefract.value = material.envMap && material.envMap.mapping instanceof THREE.CubeRefractionMapping;

	};

	/*function refreshUniformsLine( uniforms, material ) {

		uniforms.diffuse.value = material.color;
		uniforms.opacity.value = material.opacity;

	};

	function refreshUniformsParticle( uniforms, material ) {

		uniforms.psColor.value = material.color;
		uniforms.opacity.value = material.opacity;
		uniforms.size.value = material.size;
		uniforms.scale.value = _canvas.height / 2.0; // TODO: Cache this.
		uniforms.map.texture = material.map;

	};

	function refreshUniformsFog( uniforms, fog ) {

		uniforms.fogColor.value = fog.color;

		if ( fog instanceof THREE.Fog ) {

			uniforms.fogNear.value = fog.near;
			uniforms.fogFar.value = fog.far;

		} else if ( fog instanceof THREE.FogExp2 ) {

			uniforms.fogDensity.value = fog.density;

		}

	};

	function refreshUniformsPhong( uniforms, material ) {

		uniforms.ambient.value = material.ambient;
		uniforms.specular.value = material.specular;
		uniforms.shininess.value = material.shininess;

	};


	function refreshUniformsLights( uniforms, lights ) {

		uniforms.enableLighting.value = lights.directional.length + lights.point.length;
		uniforms.ambientLightColor.value = lights.ambient;

		uniforms.directionalLightColor.value = lights.directional.colors;
		uniforms.directionalLightDirection.value = lights.directional.positions;

		uniforms.pointLightColor.value = lights.point.colors;
		uniforms.pointLightPosition.value = lights.point.positions;
		uniforms.pointLightDistance.value = lights.point.distances;

	};*/

	this.initMaterial = function ( material, lights, fog, object ) {

		var u, a, identifiers, i, parameters, shaderID;

		/*if ( material instanceof THREE.MeshDepthMaterial ) {

			shaderID = 'depth';

		} else if ( material instanceof THREE.ShadowVolumeDynamicMaterial ) {

			shaderID = 'shadowVolumeDynamic';

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			shaderID = 'normal';

		} else if ( material instanceof THREE.MeshBasicMaterial ) {*/

			shaderID = 'basic';

		/*} else if ( material instanceof THREE.MeshLambertMaterial ) {

			shaderID = 'lambert';

		} else if ( material instanceof THREE.MeshPhongMaterial ) {

			shaderID = 'phong';

		} else if ( material instanceof THREE.LineBasicMaterial ) {

			shaderID = 'basic';

		} else if ( material instanceof THREE.ParticleBasicMaterial ) {

			shaderID = 'particle_basic';

		}*/

		if ( shaderID ) {

			setMaterialShaders( material, THREE.ShaderLib[ shaderID ] );

		}

		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)

		//maxLightCount = allocateLights( lights, 4 );

		//maxBones = allocateBones( object );

		parameters = {
			map: !!material.map, envMap: !!material.envMap, lightMap: !!material.lightMap
			//vertexColors: material.vertexColors,
			//fog: fog, sizeAttenuation: material.sizeAttenuation,
			//skinning: material.skinning,
			//morphTargets: material.morphTargets,
			//maxMorphTargets: this.maxMorphTargets,
			//maxDirLights: maxLightCount.directional, maxPointLights: maxLightCount.point,
			//maxBones: maxBones
		};

		material.program = buildProgram( shaderID, material.fragmentShader, material.vertexShader, material.uniforms, material.attributes, parameters );

		var attributes = material.program.attributes;

		_gl.enableVertexAttribArray( attributes.position );

		//if ( attributes.color >= 0 ) _gl.enableVertexAttribArray( attributes.color );
		//if ( attributes.normal >= 0 ) _gl.enableVertexAttribArray( attributes.normal );
		//if ( attributes.tangent >= 0 ) _gl.enableVertexAttribArray( attributes.tangent );

		/*if ( material.skinning &&
			 attributes.skinVertexA >=0 && attributes.skinVertexB >= 0 &&
			 attributes.skinIndex >= 0 && attributes.skinWeight >= 0 ) {

			_gl.enableVertexAttribArray( attributes.skinVertexA );
			_gl.enableVertexAttribArray( attributes.skinVertexB );
			_gl.enableVertexAttribArray( attributes.skinIndex );
			_gl.enableVertexAttribArray( attributes.skinWeight );

		}*/

		for ( a in material.attributes ) {

			if( attributes[ a ] >= 0 ) _gl.enableVertexAttribArray( attributes[ a ] );

		}


		/*if ( material.morphTargets ) {

			material.numSupportedMorphTargets = 0;


			if ( attributes.morphTarget0 >= 0 ) {

				_gl.enableVertexAttribArray( attributes.morphTarget0 );
				material.numSupportedMorphTargets ++;

			}

			if ( attributes.morphTarget1 >= 0 ) {

				_gl.enableVertexAttribArray( attributes.morphTarget1 );
				material.numSupportedMorphTargets ++;

			}

			if ( attributes.morphTarget2 >= 0 ) {

				_gl.enableVertexAttribArray( attributes.morphTarget2 );
				material.numSupportedMorphTargets ++;

			}

			if ( attributes.morphTarget3 >= 0 ) {

				_gl.enableVertexAttribArray( attributes.morphTarget3 );
				material.numSupportedMorphTargets ++;

			}

			if ( attributes.morphTarget4 >= 0 ) {

				_gl.enableVertexAttribArray( attributes.morphTarget4 );
				material.numSupportedMorphTargets ++;

			}

			if ( attributes.morphTarget5 >= 0 ) {

				_gl.enableVertexAttribArray( attributes.morphTarget5 );
				material.numSupportedMorphTargets ++;

			}

			if ( attributes.morphTarget6 >= 0 ) {

				_gl.enableVertexAttribArray( attributes.morphTarget6 );
				material.numSupportedMorphTargets ++;

			}

			if ( attributes.morphTarget7 >= 0 ) {

				_gl.enableVertexAttribArray( attributes.morphTarget7 );
				material.numSupportedMorphTargets ++;

			}

			object.__webglMorphTargetInfluences = new Float32Array( this.maxMorphTargets );

			for ( var i = 0, il = this.maxMorphTargets; i < il; i ++ ) {

				object.__webglMorphTargetInfluences[ i ] = 0;

			}

		}*/

	};

	function setProgram( camera, material, object ) {

		if ( ! material.program ) {

			_this.initMaterial( material, object );

		}

		var program = material.program,
			p_uniforms = program.uniforms,
			m_uniforms = material.uniforms;

		if ( program != _currentProgram ) {

			_gl.useProgram( program );
			_currentProgram = program;

		}

		_gl.uniformMatrix4fv( p_uniforms.projectionMatrix, false, _projectionMatrixArray );

		// refresh uniforms common to several materials

		/*if ( fog && (
			 material instanceof THREE.MeshBasicMaterial ||
			 material instanceof THREE.MeshLambertMaterial ||
			 material instanceof THREE.MeshPhongMaterial ||
			 material instanceof THREE.LineBasicMaterial ||
			 material instanceof THREE.ParticleBasicMaterial ||
			 material.fog )
			) {

			refreshUniformsFog( m_uniforms, fog );

		}*/

		/*if ( material instanceof THREE.MeshPhongMaterial ||
			 material instanceof THREE.MeshLambertMaterial ||
			 material.lights ) {

			setupLights( program, lights );
			refreshUniformsLights( m_uniforms, _lights );

		}*/

		if ( material instanceof THREE.MeshBasicMaterial /*||
			 material instanceof THREE.MeshLambertMaterial ||
			 material instanceof THREE.MeshPhongMaterial */) {

			refreshUniformsCommon( m_uniforms, material );

		}

		// refresh single material specific uniforms

		/*if ( material instanceof THREE.LineBasicMaterial ) {

			refreshUniformsLine( m_uniforms, material );

		} else if ( material instanceof THREE.ParticleBasicMaterial ) {

			refreshUniformsParticle( m_uniforms, material );

		} else if ( material instanceof THREE.MeshPhongMaterial ) {

			refreshUniformsPhong( m_uniforms, material );

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			m_uniforms.mNear.value = camera.near;
			m_uniforms.mFar.value = camera.far;
			m_uniforms.opacity.value = material.opacity;

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			m_uniforms.opacity.value = material.opacity;
		}*/

		// load common uniforms

		loadUniformsGeneric( program, m_uniforms );
		loadUniformsMatrices( p_uniforms, object );

		// load material specific uniforms
		// (shader material also gets them for the sake of genericity)

		/*if ( material instanceof THREE.MeshShaderMaterial ||
			 material instanceof THREE.MeshPhongMaterial ||
			 material.envMap ) {

			if( p_uniforms.cameraPosition !== null ) {
				
				_gl.uniform3f( p_uniforms.cameraPosition, camera.position.x, camera.position.y, camera.position.z );
				
			}

		}*/

		/*if ( material instanceof THREE.MeshShaderMaterial ||
			 material.envMap ||
			 material.skinning ) {

			if ( p_uniforms.objectMatrix !== null ) {
				
				_gl.uniformMatrix4fv( p_uniforms.objectMatrix, false, object._objectMatrixArray );
				
			}

		}*/

		/*if ( material instanceof THREE.MeshPhongMaterial ||
			 material instanceof THREE.MeshLambertMaterial ||
			 material instanceof THREE.MeshShaderMaterial ||
			 material.skinning ) {

			if( p_uniforms.viewMatrix !== null ) {
				
				_gl.uniformMatrix4fv( p_uniforms.viewMatrix, false, _viewMatrixArray );
				
			} 

		}*/

		/*if ( material instanceof THREE.ShadowVolumeDynamicMaterial ) {

			var dirLight = m_uniforms.directionalLightDirection.value;

			dirLight[ 0 ] = -lights[ 1 ].position.x;
			dirLight[ 1 ] = -lights[ 1 ].position.y;
			dirLight[ 2 ] = -lights[ 1 ].position.z;

			_gl.uniform3fv( p_uniforms.directionalLightDirection, dirLight );
			_gl.uniformMatrix4fv( p_uniforms.objectMatrix, false, object._objectMatrixArray );
			_gl.uniformMatrix4fv( p_uniforms.viewMatrix, false, _viewMatrixArray );
		}


		if ( material.skinning ) {

			loadUniformsSkinning( p_uniforms, object );

		}*/

		return program;

	};

	function renderBuffer( camera, material, geometryGroup, object ) {

		if ( material.opacity == 0 ) return;

		var program, attributes, linewidth, primitives, a, attribute;

		program = setProgram( camera, material, object );

		attributes = program.attributes;

		// vertices

		if ( !material.morphTargets && attributes.position >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
			_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );

		} /*else {

			setupMorphTargets( material, geometryGroup, object );

		}*/


		// custom attributes

/*		if ( geometryGroup.__webglCustomAttributes ) {

			for( a in geometryGroup.__webglCustomAttributes ) {

				if( attributes[ a ] >= 0 ) {

					attribute = geometryGroup.__webglCustomAttributes[ a ];

					_gl.bindBuffer( _gl.ARRAY_BUFFER, attribute.buffer );
					_gl.vertexAttribPointer( attributes[ a ], attribute.size, _gl.FLOAT, false, 0, 0 );

				}

			}

		}*/


		if ( material.attributes ) {

			for( a in material.attributes ) {

				if( attributes[ a ] >= 0 ) {

					attribute = material.attributes[ a ];

					_gl.bindBuffer( _gl.ARRAY_BUFFER, attribute.buffer );
					_gl.vertexAttribPointer( attributes[ a ], attribute.size, _gl.FLOAT, false, 0, 0 );

				}

			}

		}



		// colors

		/*if ( attributes.color >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglColorBuffer );
			_gl.vertexAttribPointer( attributes.color, 3, _gl.FLOAT, false, 0, 0 );

		}*/

		// normals

		/*if ( attributes.normal >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglNormalBuffer );
			_gl.vertexAttribPointer( attributes.normal, 3, _gl.FLOAT, false, 0, 0 );

		}*/

		// tangents

		/*if ( attributes.tangent >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglTangentBuffer );
			_gl.vertexAttribPointer( attributes.tangent, 4, _gl.FLOAT, false, 0, 0 );

		}*/

		// uvs

		if ( attributes.uv >= 0 ) {

			if ( geometryGroup.__webglUVBuffer ) {

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglUVBuffer );
				_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 0, 0 );

				_gl.enableVertexAttribArray( attributes.uv );

			} else {

				_gl.disableVertexAttribArray( attributes.uv );

			}

		}

		/*if ( attributes.uv2 >= 0 ) {

			if ( geometryGroup.__webglUV2Buffer ) {

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglUV2Buffer );
				_gl.vertexAttribPointer( attributes.uv2, 2, _gl.FLOAT, false, 0, 0 );

				_gl.enableVertexAttribArray( attributes.uv2 );

			} else {

				_gl.disableVertexAttribArray( attributes.uv2 );

			}

		}*/

		/*if ( material.skinning &&
			 attributes.skinVertexA >= 0 && attributes.skinVertexB >= 0 &&
			 attributes.skinIndex >= 0 && attributes.skinWeight >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinVertexABuffer );
			_gl.vertexAttribPointer( attributes.skinVertexA, 4, _gl.FLOAT, false, 0, 0 );

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinVertexBBuffer );
			_gl.vertexAttribPointer( attributes.skinVertexB, 4, _gl.FLOAT, false, 0, 0 );

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinIndicesBuffer );
			_gl.vertexAttribPointer( attributes.skinIndex, 4, _gl.FLOAT, false, 0, 0 );

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinWeightsBuffer );
			_gl.vertexAttribPointer( attributes.skinWeight, 4, _gl.FLOAT, false, 0, 0 );

		}*/

		// render mesh

		if ( object instanceof THREE.Mesh ) {

			// wireframe

			/*if ( material.wireframe ) {

				_gl.lineWidth( material.wireframeLinewidth );
				_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglLineBuffer );
				_gl.drawElements( _gl.LINES, geometryGroup.__webglLineCount, _gl.UNSIGNED_SHORT, 0 );

			// triangles

			} else {*/

				_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglFaceBuffer );
				_gl.drawElements( _gl.TRIANGLES, geometryGroup.__webglFaceCount, _gl.UNSIGNED_SHORT, 0 );

			//}

			_this.data.vertices += geometryGroup.__webglFaceCount;
			_this.data.faces += geometryGroup.__webglFaceCount / 3;
			_this.data.drawCalls ++;

		// render lines

		} /*else if ( object instanceof THREE.Line ) {

			primitives = ( object.type == THREE.LineStrip ) ? _gl.LINE_STRIP : _gl.LINES;

			_gl.lineWidth( material.linewidth );
			_gl.drawArrays( primitives, 0, geometryGroup.__webglLineCount );

			_this.data.drawCalls ++;

		// render particles

		} else if ( object instanceof THREE.ParticleSystem ) {

			_gl.drawArrays( _gl.POINTS, 0, geometryGroup.__webglParticleCount );

			_this.data.drawCalls ++;

		// render ribbon

		} else if ( object instanceof THREE.Ribbon ) {

			_gl.drawArrays( _gl.TRIANGLE_STRIP, 0, geometryGroup.__webglVertexCount );

			_this.data.drawCalls ++;

		}*/

	};


	/*function setupMorphTargets( material, geometryGroup, object ) {

		// set base

		var attributes = material.program.attributes;

		if (  object.morphTargetBase !== - 1 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ object.morphTargetBase ] );
			_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );

		} else if ( attributes.position >= 0 ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
			_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );

		}

		if ( object.morphTargetForcedOrder.length ) {

			// set forced order

			var m = 0;
			var order = object.morphTargetForcedOrder;
			var influences = object.morphTargetInfluences;

			while ( m < material.numSupportedMorphTargets && m < order.length ) {

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ order[ m ] ] );
				_gl.vertexAttribPointer( attributes[ "morphTarget" + m ], 3, _gl.FLOAT, false, 0, 0 );

				object.__webglMorphTargetInfluences[ m ] = influences[ order[ m ]];

				m ++;
			}

		} else {

			// find most influencing

			var used = [];
			var candidateInfluence = - 1;
			var candidate = 0;
			var influences = object.morphTargetInfluences;
			var i, il = influences.length;
			var m = 0;

			if ( object.morphTargetBase !== - 1 ) {

				used[ object.morphTargetBase ] = true;

			}

			while ( m < material.numSupportedMorphTargets ) {

				for ( i = 0; i < il; i ++ ) {

					if ( !used[ i ] && influences[ i ] > candidateInfluence ) {

						candidate = i;
						candidateInfluence = influences[ candidate ];

					}
				}

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ candidate ] );
				_gl.vertexAttribPointer( attributes[ "morphTarget" + m ], 3, _gl.FLOAT, false, 0, 0 );

				object.__webglMorphTargetInfluences[ m ] = candidateInfluence;

				used[ candidate ] = 1;
				candidateInfluence = -1;
				m ++;
			}
		}

		// load updated influences uniform

		if( material.program.uniforms.morphTargetInfluences !== null ) {
			
			_gl.uniform1fv( material.program.uniforms.morphTargetInfluences, object.__webglMorphTargetInfluences );
			
		}

	}*/


	/*function renderBufferImmediate( object, program, shading ) {

		if ( ! object.__webglVertexBuffer ) object.__webglVertexBuffer = _gl.createBuffer();
		if ( ! object.__webglNormalBuffer ) object.__webglNormalBuffer = _gl.createBuffer();

		if ( object.hasPos ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webglVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, object.positionArray, _gl.DYNAMIC_DRAW );
			_gl.enableVertexAttribArray( program.attributes.position );
			_gl.vertexAttribPointer( program.attributes.position, 3, _gl.FLOAT, false, 0, 0 );

		}

		if ( object.hasNormal ) {

			_gl.bindBuffer( _gl.ARRAY_BUFFER, object.__webglNormalBuffer );

			if ( shading == THREE.FlatShading ) {

				var nx, ny, nz,
					nax, nbx, ncx, nay, nby, ncy, naz, nbz, ncz,
					normalArray,
					i, il = object.count * 3;

				for( i = 0; i < il; i += 9 ) {

					normalArray = object.normalArray;

					nax  = normalArray[ i ];
					nay  = normalArray[ i + 1 ];
					naz  = normalArray[ i + 2 ];

					nbx  = normalArray[ i + 3 ];
					nby  = normalArray[ i + 4 ];
					nbz  = normalArray[ i + 5 ];

					ncx  = normalArray[ i + 6 ];
					ncy  = normalArray[ i + 7 ];
					ncz  = normalArray[ i + 8 ];

					nx = ( nax + nbx + ncx ) / 3;
					ny = ( nay + nby + ncy ) / 3;
					nz = ( naz + nbz + ncz ) / 3;

					normalArray[ i ] 	 = nx; 
					normalArray[ i + 1 ] = ny;
					normalArray[ i + 2 ] = nz;

					normalArray[ i + 3 ] = nx; 
					normalArray[ i + 4 ] = ny;
					normalArray[ i + 5 ] = nz;

					normalArray[ i + 6 ] = nx; 
					normalArray[ i + 7 ] = ny;
					normalArray[ i + 8 ] = nz;

				}

			}

			_gl.bufferData( _gl.ARRAY_BUFFER, object.normalArray, _gl.DYNAMIC_DRAW );
			_gl.enableVertexAttribArray( program.attributes.normal );
			_gl.vertexAttribPointer( program.attributes.normal, 3, _gl.FLOAT, false, 0, 0 );

		}

		_gl.drawArrays( _gl.TRIANGLES, 0, object.count );

		object.count = 0;

	};*/

	function setObjectFaces( object ) {

		if ( _oldDoubleSided != object.doubleSided ) {

			if( object.doubleSided ) {

				_gl.disable( _gl.CULL_FACE );

			} else {

				_gl.enable( _gl.CULL_FACE );

			}

			_oldDoubleSided = object.doubleSided;

		}

		if ( _oldFlipSided != object.flipSided ) {

			if( object.flipSided ) {

				_gl.frontFace( _gl.CW );

			} else {

				_gl.frontFace( _gl.CCW );

			}

			_oldFlipSided = object.flipSided;

		}

	};

	function setDepthTest( test ) {

		if ( _oldDepth != test ) {

			if( test ) {

				_gl.enable( _gl.DEPTH_TEST );

			} else {

				_gl.disable( _gl.DEPTH_TEST );

			}

			_oldDepth = test;

		}

	};

	function computeFrustum( m ) {

		_frustum[ 0 ].set( m.n41 - m.n11, m.n42 - m.n12, m.n43 - m.n13, m.n44 - m.n14 );
		_frustum[ 1 ].set( m.n41 + m.n11, m.n42 + m.n12, m.n43 + m.n13, m.n44 + m.n14 );
		_frustum[ 2 ].set( m.n41 + m.n21, m.n42 + m.n22, m.n43 + m.n23, m.n44 + m.n24 );
		_frustum[ 3 ].set( m.n41 - m.n21, m.n42 - m.n22, m.n43 - m.n23, m.n44 - m.n24 );
		_frustum[ 4 ].set( m.n41 - m.n31, m.n42 - m.n32, m.n43 - m.n33, m.n44 - m.n34 );
		_frustum[ 5 ].set( m.n41 + m.n31, m.n42 + m.n32, m.n43 + m.n33, m.n44 + m.n34 );

		var i, plane;

		for ( i = 0; i < 6; i ++ ) {

			plane = _frustum[ i ];
			plane.divideScalar( Math.sqrt( plane.x * plane.x + plane.y * plane.y + plane.z * plane.z ) );

		}

	};

	function isInFrustum( object ) {

		var distance, matrix = object.matrixWorld,
		radius = - object.geometry.boundingSphere.radius * Math.max( object.scale.x, Math.max( object.scale.y, object.scale.z ) );

		for ( var i = 0; i < 6; i ++ ) {

			distance = _frustum[ i ].x * matrix.n14 + _frustum[ i ].y * matrix.n24 + _frustum[ i ].z * matrix.n34 + _frustum[ i ].w;
			if ( distance <= radius ) return false;

		}

		return true;

	};

	function addToFixedArray( where, what ) {

		where.list[ where.count ] = what;
		where.count += 1;

	};

	/*function unrollImmediateBufferMaterials( globject ) {

		var i, l, m, ml, material,
			object = globject.object,
			opaque = globject.opaque,
			transparent = globject.transparent;

		transparent.count = 0;
		opaque.count = 0;

		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			material = object.materials[ m ];
			material.transparent ? addToFixedArray( transparent, material ) : addToFixedArray( opaque, material );

		}

	};*/

	function unrollBufferMaterials( globject ) {

		var i, l, m, ml, material, meshMaterial,
			object = globject.object,
			buffer = globject.buffer,
			opaque = globject.opaque,
			transparent = globject.transparent;

		transparent.count = 0;
		opaque.count = 0;

		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			meshMaterial = object.materials[ m ];

			/*if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = buffer.materials.length; i < l; i++ ) {

					material = buffer.materials[ i ];
					if ( material ) material.transparent ? addToFixedArray( transparent, material ) : addToFixedArray( opaque, material );

				}

			} else {*/

				material = meshMaterial;
				if ( material ) material.transparent ? addToFixedArray( transparent, material ) : addToFixedArray( opaque, material );

			//}

		}

	};


	/*function painterSort( a, b ) {

		return b.z - a.z;

	};*/

	this.render = function( scene, camera, renderTarget, forceClear ) {

		var i, program, opaque, material,
			o, ol, webglObject, object, buffer;

		_this.data.vertices = 0;
		_this.data.faces = 0;
		_this.data.drawCalls = 0;

		camera.matrixAutoUpdate && camera.update( undefined, true );

		scene.update( undefined, false, camera );

		camera.matrixWorldInverse.flattenToArray( _viewMatrixArray );
		camera.projectionMatrix.flattenToArray( _projectionMatrixArray );

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
		computeFrustum( _projScreenMatrix );

		this.initWebGLObjects( scene );

		setRenderTarget( renderTarget );

		if ( this.autoClear || forceClear ) {

			this.clear();

		}

		// set matrices

		ol = scene.__webglObjects.length;

		for ( o = 0; o < ol; o++ ) {

			webglObject = scene.__webglObjects[ o ];
			object = webglObject.object;

			if ( object.visible ) {

				if ( ! ( object instanceof THREE.Mesh ) || isInFrustum( object ) ) {

					object.matrixWorld.flattenToArray( object._objectMatrixArray );

					setupMatrices( object, camera );

					unrollBufferMaterials( webglObject );

					webglObject.render = true;

					if ( this.sortObjects ) {

						_vector3.copy( object.position );
						_projScreenMatrix.multiplyVector3( _vector3 );

						webglObject.z = _vector3.z;

					}

				} else {

					webglObject.render = false;

				}

			} else {

				webglObject.render = false;

			}

		}

		/*if ( this.sortObjects ) {

			scene.__webglObjects.sort( painterSort );

		}*/

		/*oil = scene.__webglObjectsImmediate.length;

		for ( o = 0; o < oil; o++ ) {

			webglObject = scene.__webglObjectsImmediate[ o ];
			object = webglObject.object;

			if ( object.visible ) {

				if( object.matrixAutoUpdate ) {

					object.matrixWorld.flattenToArray( object._objectMatrixArray );

				}

				setupMatrices( object, camera );

				unrollImmediateBufferMaterials( webglObject );

			}

		}*/

		// opaque pass

		setBlending( THREE.NormalBlending );

		for ( o = 0; o < ol; o ++ ) {

			webglObject = scene.__webglObjects[ o ];

			if ( webglObject.render ) {

				object = webglObject.object;
				buffer = webglObject.buffer;
				opaque = webglObject.opaque;

				setObjectFaces( object );

				for ( i = 0; i < opaque.count; i ++ ) {

					material = opaque.list[ i ];

					setDepthTest( material.depthTest );
					renderBuffer( camera, material, buffer, object );

				}

			}

		}

		// opaque pass (immediate simulator)

		/*for ( o = 0; o < oil; o++ ) {

			webglObject = scene.__webglObjectsImmediate[ o ];
			object = webglObject.object;

			if ( object.visible ) {

				opaque = webglObject.opaque;

				setObjectFaces( object );

				for( i = 0; i < opaque.count; i++ ) {

					material = opaque.list[ i ];

					setDepthTest( material.depthTest );

					program = setProgram( camera, lights, fog, material, object );
					object.render( function( object ) { renderBufferImmediate( object, program, material.shading ); } );

				}

			}

		}*/

		// transparent pass

		/*for ( o = 0; o < ol; o ++ ) {

			webglObject = scene.__webglObjects[ o ];

			if ( webglObject.render ) {

				object = webglObject.object;
				buffer = webglObject.buffer;
				transparent = webglObject.transparent;

				setObjectFaces( object );

				for ( i = 0; i < transparent.count; i ++ ) {

					material = transparent.list[ i ];

					setBlending( material.blending );
					setDepthTest( material.depthTest );

					renderBuffer( camera, lights, fog, material, buffer, object );

				}

			}

		}*/

		// transparent pass (immediate simulator)

		/*for ( o = 0; o < oil; o++ ) {

			webglObject = scene.__webglObjectsImmediate[ o ];
			object = webglObject.object;

			if ( object.visible ) {

				transparent = webglObject.transparent;

				setObjectFaces( object );

				for ( i = 0; i < transparent.count; i ++ ) {

					material = transparent.list[ i ];

					setBlending( material.blending );
					setDepthTest( material.depthTest );

					program = setProgram( camera, lights, fog, material, object );
					object.render( function( object ) { renderBufferImmediate( object, program, material.shading ); } );

				}

			}

		}*/

		// render 2d

		/*if ( scene.__webglSprites.length ) {

			renderSprites( scene, camera );

		}*/

		// render stencil shadows

		/*if ( stencil && scene.__webglShadowVolumes.length && scene.lights.length ) {

			renderStencilShadows( scene );

		}*/


		// render lens flares

		/*if ( scene.__webglLensFlares.length ) {

			renderLensFlares( scene, camera );

		}*/


		// Generate mipmap if we're using any kind of mipmap filtering

		/*if ( renderTarget && renderTarget.minFilter !== THREE.NearestFilter && renderTarget.minFilter !== THREE.LinearFilter ) {

			updateRenderTargetMipmap( renderTarget );

		}*/

	};



	/*
	 * Stencil Shadows
	 * method: we're rendering the world in light, then the shadow
	 *         volumes into the stencil and last a big darkening 
	 *         quad over the whole thing. This is not how "you're
	 *	       supposed to" do stencil shadows but is much faster
	 * 
	 */

	/*function renderStencilShadows( scene ) {

		// setup stencil

		_gl.enable( _gl.POLYGON_OFFSET_FILL );
		_gl.polygonOffset( 0.1, 1.0 );
		_gl.enable( _gl.STENCIL_TEST );
		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthMask( false );
		_gl.colorMask( false, false, false, false );

		_gl.stencilFunc( _gl.ALWAYS, 1, 0xFF );
		_gl.stencilOpSeparate( _gl.BACK,  _gl.KEEP, _gl.INCR, _gl.KEEP );
		_gl.stencilOpSeparate( _gl.FRONT, _gl.KEEP, _gl.DECR, _gl.KEEP );


		// loop through all directional lights

		var l, ll = scene.lights.length;
		var p;
		var light, lights = scene.lights;
		var dirLight = [];
		var object, geometryGroup, material;
		var program;
		var p_uniforms;
		var m_uniforms;
		var attributes;
		var o, ol = scene.__webglShadowVolumes.length;

		for ( l = 0; l < ll; l++ ) {

			light = scene.lights[ l ];

			if ( light instanceof THREE.DirectionalLight && light.castShadow ) {

				dirLight[ 0 ] = -light.position.x;
				dirLight[ 1 ] = -light.position.y;
				dirLight[ 2 ] = -light.position.z;

				// render all volumes

				for ( o = 0; o < ol; o++ ) {

					object        = scene.__webglShadowVolumes[ o ].object;
					geometryGroup = scene.__webglShadowVolumes[ o ].buffer;
					material      = object.materials[ 0 ];

					if ( !material.program ) _this.initMaterial( material, lights, undefined, object );

					program = material.program,
		  			p_uniforms = program.uniforms,
					m_uniforms = material.uniforms,
					attributes = program.attributes;

					if ( _currentProgram !== program ) {

						_gl.useProgram( program );
						_currentProgram = program;

						_gl.uniformMatrix4fv( p_uniforms.projectionMatrix, false, _projectionMatrixArray );
						_gl.uniformMatrix4fv( p_uniforms.viewMatrix, false, _viewMatrixArray );
						_gl.uniform3fv( p_uniforms.directionalLightDirection, dirLight );
					}


					object.matrixWorld.flattenToArray( object._objectMatrixArray );
					_gl.uniformMatrix4fv( p_uniforms.objectMatrix, false, object._objectMatrixArray );


					_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
					_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );

					_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglNormalBuffer );
					_gl.vertexAttribPointer( attributes.normal, 3, _gl.FLOAT, false, 0, 0 );

					_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglFaceBuffer );

					_gl.cullFace( _gl.FRONT );
					_gl.drawElements( _gl.TRIANGLES, geometryGroup.__webglFaceCount, _gl.UNSIGNED_SHORT, 0 );

					_gl.cullFace( _gl.BACK );
					_gl.drawElements( _gl.TRIANGLES, geometryGroup.__webglFaceCount, _gl.UNSIGNED_SHORT, 0 );

				}

			}

		}


		// setup color+stencil

		_gl.disable( _gl.POLYGON_OFFSET_FILL );
		_gl.colorMask( true, true, true, true );
		_gl.stencilFunc( _gl.NOTEQUAL, 0, 0xFF );
		_gl.stencilOp( _gl.KEEP, _gl.KEEP, _gl.KEEP );
		_gl.disable( _gl.DEPTH_TEST );


		// draw darkening polygon

		_oldBlending = "";
		_currentProgram = _stencilShadow.program;

		_gl.useProgram( _stencilShadow.program );
		_gl.uniformMatrix4fv( _stencilShadow.projectionLocation, false, _projectionMatrixArray );
		_gl.uniform1f( _stencilShadow.darknessLocation, _stencilShadow.darkness );

		_gl.bindBuffer( _gl.ARRAY_BUFFER, _stencilShadow.vertexBuffer );
		_gl.vertexAttribPointer( _stencilShadow.vertexLocation, 3, _gl.FLOAT, false, 0, 0 );
		_gl.enableVertexAttribArray( _stencilShadow.vertexLocation );

		_gl.blendFunc( _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );
		_gl.blendEquation( _gl.FUNC_ADD );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _stencilShadow.elementBuffer );
		_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );


		// disable stencil

		_gl.disable( _gl.STENCIL_TEST );
		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthMask( _currentDepthMask );

	}*/


	/*
	 * Render sprites
	 * 
	 */

	/*function renderSprites( scene, camera ) {

		var o, ol, object;
		var attributes = _sprite.attributes;
		var uniforms = _sprite.uniforms;
		var anyCustom = false;
		var invAspect = _viewportHeight / _viewportWidth;
		var size, scale = [];
		var screenPosition;
		var halfViewportWidth = _viewportWidth * 0.5;
		var halfViewportHeight = _viewportHeight * 0.5;
		var mergeWith3D = true;

		// setup gl

		_gl.useProgram( _sprite.program );
		_currentProgram = _sprite.program;
		_oldBlending = "";

		if ( !_spriteAttributesEnabled ) {

			_gl.enableVertexAttribArray( _sprite.attributes.position );
			_gl.enableVertexAttribArray( _sprite.attributes.uv );

			_spriteAttributesEnabled = true;

		}

		_gl.disable( _gl.CULL_FACE );
		_gl.enable( _gl.BLEND );
		_gl.depthMask( true );

		_gl.bindBuffer( _gl.ARRAY_BUFFER, _sprite.vertexBuffer );
		_gl.vertexAttribPointer( attributes.position, 2, _gl.FLOAT, false, 2 * 8, 0 );
		_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 2 * 8, 8 );

		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _sprite.elementBuffer );

		_gl.uniformMatrix4fv( uniforms.projectionMatrix, false, _projectionMatrixArray );

		_gl.activeTexture( _gl.TEXTURE0 );
		_gl.uniform1i( uniforms.map, 0 );

		// update positions and sort

		for( o = 0, ol = scene.__webglSprites.length; o < ol; o++ ) {

			object = scene.__webglSprites[ o ];

			if( !object.useScreenCoordinates ) {

				object._modelViewMatrix.multiplyToArray( camera.matrixWorldInverse, object.matrixWorld, object._modelViewMatrixArray );
				object.z = -object._modelViewMatrix.n34;

			} else {

				object.z = -object.position.z;

			}

		}

		scene.__webglSprites.sort( painterSort );

		// render all non-custom shader sprites

		for ( o = 0, ol = scene.__webglSprites.length; o < ol; o++ ) {

			object = scene.__webglSprites[ o ];

			if ( object.material === undefined ) {

				if ( object.map && object.map.image && object.map.image.width ) {

					if ( object.useScreenCoordinates ) {

						_gl.uniform1i( uniforms.useScreenCoordinates, 1 );
						_gl.uniform3f( uniforms.screenPosition, ( object.position.x - halfViewportWidth  ) / halfViewportWidth, 
														        ( halfViewportHeight - object.position.y ) / halfViewportHeight,
														          Math.max( 0, Math.min( 1, object.position.z )));

					} else {



						_gl.uniform1i( uniforms.useScreenCoordinates, 0 );
						_gl.uniform1i( uniforms.affectedByDistance, object.affectedByDistance ? 1 : 0 );
						_gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, object._modelViewMatrixArray );

					}

					size = object.map.image.width / ( object.affectedByDistance ? 1 : _viewportHeight );
					scale[ 0 ] = size * invAspect * object.scale.x;
					scale[ 1 ] = size * object.scale.y;

					_gl.uniform2f( uniforms.uvScale, object.uvScale.x, object.uvScale.y );
					_gl.uniform2f( uniforms.uvOffset, object.uvOffset.x, object.uvOffset.y );
					_gl.uniform2f( uniforms.alignment, object.alignment.x, object.alignment.y );
					_gl.uniform1f( uniforms.opacity, object.opacity );
					_gl.uniform1f( uniforms.rotation, object.rotation );
					_gl.uniform2fv( uniforms.scale, scale );

					if ( object.mergeWith3D && !mergeWith3D ) {

						_gl.enable( _gl.DEPTH_TEST );
						mergeWith3D = true;

					} else if ( !object.mergeWith3D && mergeWith3D ) {

						_gl.disable( _gl.DEPTH_TEST );
						mergeWith3D = false;

					}

					setBlending( object.blending );
					setTexture( object.map, 0 );

					_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );
				}

			} else {

				anyCustom = true;

			}

		}


		// loop through all custom

		
		//if( anyCustom ) {
		//
		//}
		

		// restore gl

		_gl.enable( _gl.CULL_FACE );
		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthMask( _currentDepthMask );

	}*/



	/*
	 * Render lens flares
	 * Method: renders 16x16 0xff00ff-colored points scattered over the light source area, 
	 *         reads these back and calculates occlusion.  
	 *         Then LensFlare.updateLensFlares() is called to re-position and 
	 *         update transparency of flares. Then they are rendered.
	 * 
	 */

	/*function renderLensFlares( scene, camera ) {

		var object, objectZ, geometryGroup, material;
		var o, ol = scene.__webglLensFlares.length;
		var f, fl, flare;
		var tempPosition = new THREE.Vector3();
		var invAspect = _viewportHeight / _viewportWidth;
		var halfViewportWidth = _viewportWidth * 0.5;
		var halfViewportHeight = _viewportHeight * 0.5;
		var size = 16 / _viewportHeight;
		var scale = [ size * invAspect, size ];
		var screenPosition = [ 1, 1, 0 ];
		var screenPositionPixels = [ 1, 1 ];
		var sampleX, sampleY, readBackPixels = _lensFlare.readBackPixels;
		var sampleMidX = 7 * 4;
		var sampleMidY = 7 * 16 * 4;
		var sampleIndex, visibility;
		var uniforms = _lensFlare.uniforms;
		var attributes = _lensFlare.attributes;


		// set lensflare program and reset blending

		_gl.useProgram( _lensFlare.program );
		_currentProgram = _lensFlare.program;
		_oldBlending = "";


		if ( ! _lensFlareAttributesEnabled ) {
		
			_gl.enableVertexAttribArray( _lensFlare.attributes.vertex );
			_gl.enableVertexAttribArray( _lensFlare.attributes.uv );
			
			_lensFlareAttributesEnabled = true;

		}

		// loop through all lens flares to update their occlusion and positions
		// setup gl and common used attribs/unforms

		_gl.uniform1i( uniforms.occlusionMap, 0 );
		_gl.uniform1i( uniforms.map, 1 );

		_gl.bindBuffer( _gl.ARRAY_BUFFER, _lensFlare.vertexBuffer );
		_gl.vertexAttribPointer( attributes.vertex, 2, _gl.FLOAT, false, 2 * 8, 0 );
		_gl.vertexAttribPointer( attributes.uv, 2, _gl.FLOAT, false, 2 * 8, 8 );


		_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, _lensFlare.elementBuffer );

		_gl.disable( _gl.CULL_FACE );
		_gl.depthMask( false );

		_gl.activeTexture( _gl.TEXTURE0 );
		_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.occlusionTexture );

		_gl.activeTexture( _gl.TEXTURE1 );

		for ( o = 0; o < ol; o ++ ) {

			// calc object screen position

			object = scene.__webglLensFlares[ o ].object;

			tempPosition.set( object.matrixWorld.n14, object.matrixWorld.n24, object.matrixWorld.n34 );

			camera.matrixWorldInverse.multiplyVector3( tempPosition );
			objectZ = tempPosition.z;
			camera.projectionMatrix.multiplyVector3( tempPosition );


			// setup arrays for gl programs

			screenPosition[ 0 ] = tempPosition.x;
			screenPosition[ 1 ] = tempPosition.y;
			screenPosition[ 2 ] = tempPosition.z;

			screenPositionPixels[ 0 ] = screenPosition[ 0 ] * halfViewportWidth + halfViewportWidth;
			screenPositionPixels[ 1 ] = screenPosition[ 1 ] * halfViewportHeight + halfViewportHeight;


			// screen cull 

			if ( _lensFlare.hasVertexTexture || ( screenPositionPixels[ 0 ] > 0 &&
				screenPositionPixels[ 0 ] < _viewportWidth &&
				screenPositionPixels[ 1 ] > 0 &&
				screenPositionPixels[ 1 ] < _viewportHeight )) {


				// save current RGB to temp texture

				_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.tempTexture );
				_gl.copyTexImage2D( _gl.TEXTURE_2D, 0, _gl.RGB, screenPositionPixels[ 0 ] - 8, screenPositionPixels[ 1 ] - 8, 16, 16, 0 );


				// render pink quad

				_gl.uniform1i( uniforms.renderType, 0 );
				_gl.uniform2fv( uniforms.scale, scale );
				_gl.uniform3fv( uniforms.screenPosition, screenPosition );

				_gl.disable( _gl.BLEND );
				_gl.enable( _gl.DEPTH_TEST );

				_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );


				// copy result to occlusionMap

				_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.occlusionTexture );
				_gl.copyTexImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, screenPositionPixels[ 0 ] - 8, screenPositionPixels[ 1 ] - 8, 16, 16, 0 );


				// restore graphics

				_gl.uniform1i( uniforms.renderType, 1 );
				_gl.disable( _gl.DEPTH_TEST );
				_gl.bindTexture( _gl.TEXTURE_2D, _lensFlare.tempTexture );
				_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );


				// update object positions

				object.positionScreen.x = screenPosition[ 0 ];
				object.positionScreen.y = screenPosition[ 1 ];
				object.positionScreen.z = screenPosition[ 2 ];

				if ( object.customUpdateCallback ) {

					object.customUpdateCallback( object );

				} else {

					object.updateLensFlares();

				}


				// render flares

				_gl.uniform1i( uniforms.renderType, 2 );
				_gl.enable( _gl.BLEND );

				for ( f = 0, fl = object.lensFlares.length; f < fl; f ++ ) {

					flare = object.lensFlares[ f ];

					if ( flare.opacity > 0.001 && flare.scale > 0.001 ) {

						screenPosition[ 0 ] = flare.x;
						screenPosition[ 1 ] = flare.y;
						screenPosition[ 2 ] = flare.z;

						size = flare.size * flare.scale / _viewportHeight;
						scale[ 0 ] = size * invAspect;
						scale[ 1 ] = size;

						_gl.uniform3fv( uniforms.screenPosition, screenPosition );
						_gl.uniform2fv( uniforms.scale, scale );
						_gl.uniform1f( uniforms.rotation, flare.rotation );
						_gl.uniform1f( uniforms.opacity, flare.opacity );

						setBlending( flare.blending );
						setTexture( flare.texture, 1 );

						_gl.drawElements( _gl.TRIANGLES, 6, _gl.UNSIGNED_SHORT, 0 );

					}

				}

			}

		}

		// restore gl

		_gl.enable( _gl.CULL_FACE );
		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthMask( _currentDepthMask );

	};*/


	function setupMatrices( object, camera ) {

		object._modelViewMatrix.multiplyToArray( camera.matrixWorldInverse, object.matrixWorld, object._modelViewMatrixArray );
		THREE.Matrix4.makeInvert3x3( object._modelViewMatrix ).transposeIntoArray( object._normalMatrixArray );

	};

	this.initWebGLObjects = function ( scene ) {

		if ( !scene.__webglObjects ) {

			scene.__webglObjects = [];
			scene.__webglObjectsImmediate = [];
			//scene.__webglShadowVolumes = [];
			//scene.__webglLensFlares = [];
			//scene.__webglSprites = [];
		}

		while ( scene.__objectsAdded.length ) {

			addObject( scene.__objectsAdded[ 0 ], scene );
			scene.__objectsAdded.splice( 0, 1 );

		}

		/*while ( scene.__objectsRemoved.length ) {

			removeObject( scene.__objectsRemoved[ 0 ], scene );
			scene.__objectsRemoved.splice( 0, 1 );

		}*/

		// update must be called after objects adding / removal

		for ( var o = 0, ol = scene.__webglObjects.length; o < ol; o ++ ) {

			updateObject( scene.__webglObjects[ o ].object, scene );

		}

		/*for ( var o = 0, ol = scene.__webglShadowVolumes.length; o < ol; o ++ ) {

			updateObject( scene.__webglShadowVolumes[ o ].object, scene );

		}*/

		/*for ( var o = 0, ol = scene.__webglLensFlares.length; o < ol; o ++ ) {

			updateObject( scene.__webglLensFlares[ o ].object, scene );

		}*/

		/*
		for ( var o = 0, ol = scene.__webglSprites.length; o < ol; o ++ ) {

			updateObject( scene.__webglSprites[ o ].object, scene );

		}
		*/

	};

	function addObject( object, scene ) {

		var g, geometry, geometryGroup;

		if ( object._modelViewMatrix == undefined ) {

			object._modelViewMatrix = new THREE.Matrix4();

			object._normalMatrixArray = new Float32Array( 9 );
			object._modelViewMatrixArray = new Float32Array( 16 );
			object._objectMatrixArray = new Float32Array( 16 );

			object.matrixWorld.flattenToArray( object._objectMatrixArray );

		}

		if ( object instanceof THREE.Mesh ) {

			geometry = object.geometry;

			if ( geometry.geometryGroups == undefined ) {

				sortFacesByMaterial( geometry );

			}

			// create separate VBOs per geometry chunk

			for ( g in geometry.geometryGroups ) {

				geometryGroup = geometry.geometryGroups[ g ];

				// initialise VBO on the first access

				if ( ! geometryGroup.__webglVertexBuffer ) {

					createMeshBuffers( geometryGroup );
					initMeshBuffers( geometryGroup, object );

					geometry.__dirtyVertices = true;
					geometry.__dirtyMorphTargets = true;
					geometry.__dirtyElements = true;
					geometry.__dirtyUvs = true;
					geometry.__dirtyNormals = true;
					geometry.__dirtyTangents = true;
					geometry.__dirtyColors = true;

				}

				// create separate wrapper per each use of VBO

				/*if ( object instanceof THREE.ShadowVolume ) {

					addBuffer( scene.__webglShadowVolumes, geometryGroup, object );

				} else {*/

					addBuffer( scene.__webglObjects, geometryGroup, object );

				//}

			}

		} /*else if ( object instanceof THREE.LensFlare ) {

			addBuffer( scene.__webglLensFlares, undefined, object );

		} else if ( object instanceof THREE.Ribbon ) {

			geometry = object.geometry;

			if( ! geometry.__webglVertexBuffer ) {

				createRibbonBuffers( geometry );
				initRibbonBuffers( geometry );

				geometry.__dirtyVertices = true;
				geometry.__dirtyColors = true;

			}

			addBuffer( scene.__webglObjects, geometry, object );

		} else if ( object instanceof THREE.Line ) {

			geometry = object.geometry;

			if( ! geometry.__webglVertexBuffer ) {

				createLineBuffers( geometry );
				initLineBuffers( geometry );

				geometry.__dirtyVertices = true;
				geometry.__dirtyColors = true;

			}

			addBuffer( scene.__webglObjects, geometry, object );

		} else if ( object instanceof THREE.ParticleSystem ) {

			geometry = object.geometry;

			if ( ! geometry.__webglVertexBuffer ) {

				createParticleBuffers( geometry );
				initParticleBuffers( geometry );

				geometry.__dirtyVertices = true;
				geometry.__dirtyColors = true;

			}

			addBuffer( scene.__webglObjects, geometry, object );

		} else if ( THREE.MarchingCubes !== undefined && object instanceof THREE.MarchingCubes ) {

			addBufferImmediate( scene.__webglObjectsImmediate, object );

		} else if ( object instanceof THREE.Sprite ) {

			scene.__webglSprites.push( object );
		}
		*/
		/*else if ( object instanceof THREE.Particle ) {

		}*/

	};

	function updateObject( object, scene ) {

		var g, geometry, geometryGroup, a, customAttributeDirty;

		if ( object instanceof THREE.Mesh ) {

			geometry = object.geometry;

			// check all geometry groups

			for ( g in geometry.geometryGroups ) {

				geometryGroup = geometry.geometryGroups[ g ];

				customAttributeDirty = false;

				for ( a in geometryGroup.__webglCustomAttributes ) {

					if( geometryGroup.__webglCustomAttributes[ a ].needsUpdate ) {

						customAttributeDirty = true;
						break;
					}

				}

				if ( geometry.__dirtyVertices || geometry.__dirtyMorphTargets || geometry.__dirtyElements ||
					geometry.__dirtyUvs || geometry.__dirtyNormals ||
					geometry.__dirtyColors || geometry.__dirtyTangents || customAttributeDirty ) {

					setMeshBuffers( geometryGroup, object, _gl.DYNAMIC_DRAW );

				}

			}

			geometry.__dirtyVertices = false;
			geometry.__dirtyMorphTargets = false;
			geometry.__dirtyElements = false;
			geometry.__dirtyUvs = false;
			geometry.__dirtyNormals = false;
			geometry.__dirtyTangents = false;
			geometry.__dirtyColors = false;

		} /*else if ( object instanceof THREE.Ribbon ) {

			geometry = object.geometry;

			if( geometry.__dirtyVertices || geometry.__dirtyColors ) {

				setRibbonBuffers( geometry, _gl.DYNAMIC_DRAW );

			}

			geometry.__dirtyVertices = false;
			geometry.__dirtyColors = false;

		} else if ( object instanceof THREE.Line ) {

			geometry = object.geometry;

			if( geometry.__dirtyVertices ||  geometry.__dirtyColors ) {

				setLineBuffers( geometry, _gl.DYNAMIC_DRAW );

			}

			geometry.__dirtyVertices = false;
			geometry.__dirtyColors = false;

		} else if ( object instanceof THREE.ParticleSystem ) {

			geometry = object.geometry;

			if ( geometry.__dirtyVertices || geometry.__dirtyColors || object.sortParticles ) {

				setParticleBuffers( geometry, _gl.DYNAMIC_DRAW, object );

			}

			geometry.__dirtyVertices = false;
			geometry.__dirtyColors = false;

		} else if ( THREE.MarchingCubes !== undefined && object instanceof THREE.MarchingCubes ) {

			// it updates itself in render callback

		} else if ( object instanceof THREE.Particle ) {

		}*/

	};

	/*function removeObject( object, scene ) {

		var o, ol, zobject;

		if ( object instanceof THREE.Mesh ) {

			for ( o = scene.__webglObjects.length - 1; o >= 0; o -- ) {

				zobject = scene.__webglObjects[ o ].object;

				if ( object == zobject ) {

					scene.__webglObjects.splice( o, 1 );
					return;

				}

			}

		} else if ( object instanceof THREE.Sprite ) {

			for ( o = scene.__webglSprites.length - 1; o >= 0; o -- ) {

				zobject = scene.__webglSprites[ o ];

				if ( object == zobject ) {

					scene.__webglSprites.splice( o, 1 );
					return;

				}

			}

		}

		// add shadows, etc

	};*/

	function sortFacesByMaterial( geometry ) {

		// TODO
		// Should optimize by grouping faces with ColorFill / ColorStroke materials
		// which could then use vertex color attributes instead of each being
		// in its separate VBO

		var i, l, f, fl, face, material, materials, vertices, mhash, ghash, hash_map = {};
		var numMorphTargets = geometry.morphTargets !== undefined ? geometry.morphTargets.length : 0;

		geometry.geometryGroups = {};

		function materialHash( material ) {

			var hash_array = [];

			for ( i = 0, l = material.length; i < l; i++ ) {

				if ( material[ i ] == undefined ) {

					hash_array.push( "undefined" );

				} else {

					hash_array.push( material[ i ].id );

				}

			}

			return hash_array.join( '_' );

		}

		for ( f = 0, fl = geometry.faces.length; f < fl; f++ ) {

			face = geometry.faces[ f ];
			materials = face.materials;

			mhash = materialHash( materials );

			if ( hash_map[ mhash ] == undefined ) {

				hash_map[ mhash ] = { 'hash': mhash, 'counter': 0 };

			}

			ghash = hash_map[ mhash ].hash + '_' + hash_map[ mhash ].counter;

			if ( geometry.geometryGroups[ ghash ] == undefined ) {

				geometry.geometryGroups[ ghash ] = { 'faces': [], 'materials': materials, 'vertices': 0/*, 'numMorphTargets': numMorphTargets*/ };

			}

			vertices = face instanceof THREE.Face3 ? 3 : 4;

			if ( geometry.geometryGroups[ ghash ].vertices + vertices > 65535 ) {

				hash_map[ mhash ].counter += 1;
				ghash = hash_map[ mhash ].hash + '_' + hash_map[ mhash ].counter;

				if ( geometry.geometryGroups[ ghash ] == undefined ) {

					geometry.geometryGroups[ ghash ] = { 'faces': [], 'materials': materials, 'vertices': 0/*, 'numMorphTargets': numMorphTargets*/ };

				}

			}

			geometry.geometryGroups[ ghash ].faces.push( f );
			geometry.geometryGroups[ ghash ].vertices += vertices;

		}

	};

	function addBuffer( objlist, buffer, object ) {

		objlist.push( {
			buffer: buffer, object: object,
			opaque: { list: [], count: 0 },
			transparent: { list: [], count: 0 }
		} );

	};

	/*function addBufferImmediate( objlist, object ) {

		objlist.push( {
			object: object,
			opaque: { list: [], count: 0 },
			transparent: { list: [], count: 0 }
		} );

	};*/

	/*this.setFaceCulling = function ( cullFace, frontFace ) {

		if ( cullFace ) {

			if ( !frontFace || frontFace == "ccw" ) {

				_gl.frontFace( _gl.CCW );

			} else {

				_gl.frontFace( _gl.CW );

			}

			if( cullFace == "back" ) {

				_gl.cullFace( _gl.BACK );

			} else if( cullFace == "front" ) {

				_gl.cullFace( _gl.FRONT );

			} else {

				_gl.cullFace( _gl.FRONT_AND_BACK );

			}

			_gl.enable( _gl.CULL_FACE );

		} else {

			_gl.disable( _gl.CULL_FACE );

		}

	};*/

	/*this.supportsVertexTextures = function () {

		return maxVertexTextures() > 0;

	};*/

	function maxVertexTextures() {

		return _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );

	};

	function initGL( antialias, clearColor, clearAlpha, stencil ) {

		try {

			if ( ! ( _gl = _canvas.getContext( 'experimental-webgl', { antialias: antialias, stencil: stencil } ) ) ) {

				throw 'Error creating WebGL context.';

			}

		} catch ( e ) {

			console.error( e );

		}

		console.log(
			navigator.userAgent + " | " +
			_gl.getParameter( _gl.VERSION ) + " | " +
			_gl.getParameter( _gl.VENDOR ) + " | " +
			_gl.getParameter( _gl.RENDERER ) + " | " +
			_gl.getParameter( _gl.SHADING_LANGUAGE_VERSION )
		);

		_gl.clearColor( 0, 0, 0, 1 );
		_gl.clearDepth( 1 );

		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthFunc( _gl.LEQUAL );

		_gl.frontFace( _gl.CCW );
		_gl.cullFace( _gl.BACK );
		_gl.enable( _gl.CULL_FACE );

		_gl.enable( _gl.BLEND );
		_gl.blendEquation( _gl.FUNC_ADD );
		_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA );

		_gl.clearColor( clearColor.r, clearColor.g, clearColor.b, clearAlpha );

		// _gl.pixelStorei( _gl.UNPACK_FLIP_Y_WEBGL, true );

		//_cullEnabled = true;

	};

	function buildProgram( shaderID, fragmentShader, vertexShader, uniforms, attributes, parameters ) {

		var p, pl, program, code;
		var chunks = [];

		// Generate code

		if ( shaderID ) {

			chunks.push( shaderID );

		} else {

			chunks.push( fragmentShader );
			chunks.push( vertexShader );

		}

		for ( p in parameters ) {

			chunks.push( p );
			chunks.push( parameters[ p ] );

		}

		code = chunks.join();

		// Check if code has been already compiled

		for ( p = 0, pl = _programs.length; p < pl; p ++ ) {

			if ( _programs[ p ].code == code ) {

				// console.log( "Code already compiled." /*: \n\n" + code*/ );

				return _programs[ p ].program;

			}

		}

		//console.log( "building new program " );

		//

		program = _gl.createProgram(),

		prefix_fragment = [
			"#ifdef GL_ES",
			"precision highp float;",
			"#endif",

			//"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			//"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,

			//parameters.fog ? "#define USE_FOG" : "",
			//parameters.fog instanceof THREE.FogExp2 ? "#define FOG_EXP2" : "",

			parameters.map ? "#define USE_MAP" : "",
			parameters.envMap ? "#define USE_ENVMAP" : "",
			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
			parameters.vertexColors ? "#define USE_COLOR" : "",

			"uniform mat4 viewMatrix;",
			"uniform vec3 cameraPosition;",
			""
		].join("\n"),

		prefix_vertex = [
			maxVertexTextures() > 0 ? "#define VERTEX_TEXTURES" : "",

			//"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			//"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,

			//"#define MAX_BONES " + parameters.maxBones,

			parameters.map ? "#define USE_MAP" : "",
			parameters.envMap ? "#define USE_ENVMAP" : "",
			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
			//parameters.vertexColors ? "#define USE_COLOR" : "",
			//parameters.skinning ? "#define USE_SKINNING" : "",
			//parameters.morphTargets ? "#define USE_MORPHTARGETS" : "",


			parameters.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",

			"uniform mat4 objectMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat4 viewMatrix;",
			//"uniform mat3 normalMatrix;",
			"uniform vec3 cameraPosition;",

			"uniform mat4 cameraInverseMatrix;",

			"attribute vec3 position;",
			//"attribute vec3 normal;",
			"attribute vec2 uv;",
			//"attribute vec2 uv2;",

			//"#ifdef USE_COLOR",

			//	"attribute vec3 color;",

			//"#endif",

			//"#ifdef USE_MORPHTARGETS",

			//	"attribute vec3 morphTarget0;",
			//	"attribute vec3 morphTarget1;",
			//	"attribute vec3 morphTarget2;",
			//	"attribute vec3 morphTarget3;",
			//	"attribute vec3 morphTarget4;",
			//	"attribute vec3 morphTarget5;",
			//	"attribute vec3 morphTarget6;",
			//	"attribute vec3 morphTarget7;",

			//"#endif",

			//"#ifdef USE_SKINNING",

			//	"attribute vec4 skinVertexA;",
			//	"attribute vec4 skinVertexB;",
			//	"attribute vec4 skinIndex;",
			//	"attribute vec4 skinWeight;",

			//"#endif",

			""
		].join("\n");

		_gl.attachShader( program, getShader( "fragment", prefix_fragment + fragmentShader ) );
		_gl.attachShader( program, getShader( "vertex", prefix_vertex + vertexShader ) );

		_gl.linkProgram( program );

		if ( !_gl.getProgramParameter( program, _gl.LINK_STATUS ) ) {

			console.error( "Could not initialise shader\n" + "VALIDATE_STATUS: " + _gl.getProgramParameter( program, _gl.VALIDATE_STATUS ) + ", gl error [" + _gl.getError() + "]" );

		}

		//console.log( prefix_fragment + fragmentShader );
		//console.log( prefix_vertex + vertexShader );

		program.uniforms = {};
		program.attributes = {};

		var identifiers, u, a, i;

		// cache uniform locations

		identifiers = [

			'viewMatrix', 'modelViewMatrix', 'projectionMatrix', /*'normalMatrix',*/ 'objectMatrix', 'cameraPosition',
			'cameraInverseMatrix'//, 'boneGlobalMatrices', 'morphTargetInfluences'

		];

		for ( u in uniforms ) {

			identifiers.push( u );

		}

		cacheUniformLocations( program, identifiers );

		// cache attributes locations

		identifiers = [

			"position", /*"normal",*/ "uv"//, "uv2", "tangent", "color",
			//"skinVertexA", "skinVertexB", "skinIndex", "skinWeight"

		];

		/*for ( i = 0; i < parameters.maxMorphTargets; i++ ) {

			identifiers.push( "morphTarget" + i );

		}*/

		for ( a in attributes ) {

			identifiers.push( a );

		}

		cacheAttributeLocations( program, identifiers );

		_programs.push( { program: program, code: code } );

		return program;

	};

	/*function loadUniformsSkinning( uniforms, object ) {

		_gl.uniformMatrix4fv( uniforms.cameraInverseMatrix, false, _viewMatrixArray );
		_gl.uniformMatrix4fv( uniforms.boneGlobalMatrices, false, object.boneMatrices );

	};*/


	function loadUniformsMatrices( uniforms, object ) {

		_gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, object._modelViewMatrixArray );
		_gl.uniformMatrix3fv( uniforms.normalMatrix, false, object._normalMatrixArray );

	};

	function loadUniformsGeneric( program, uniforms ) {

		var u, uniform, value, type, location, texture;

		for( u in uniforms ) {

			location = program.uniforms[u];
			if ( !location ) continue;

			uniform = uniforms[u];

			type = uniform.type;
			value = uniform.value;

			if( type == "i" ) {

				_gl.uniform1i( location, value );

			} else if( type == "f" ) {

				_gl.uniform1f( location, value );

			} else if( type == "fv1" ) {

				_gl.uniform1fv( location, value );

			} else if( type == "fv" ) {

				_gl.uniform3fv( location, value );

			} else if( type == "v2" ) {

				_gl.uniform2f( location, value.x, value.y );

			} else if( type == "v3" ) {

				_gl.uniform3f( location, value.x, value.y, value.z );

			} else if( type == "v4" ) {

				_gl.uniform4f( location, value.x, value.y, value.z, value.w );

			} else if( type == "c" ) {

				_gl.uniform3f( location, value.r, value.g, value.b );

			} else if( type == "t" ) {

				_gl.uniform1i( location, value );

				texture = uniform.texture;

				if ( !texture ) continue;

				if ( texture.image instanceof Array && texture.image.length == 6 ) {

					setCubeTexture( texture, value );

				} else {

					setTexture( texture, value );

				}

			}

		}

	};

	function setBlending( blending ) {

		if ( blending != _oldBlending ) {

			/*switch ( blending ) {

				case THREE.AdditiveBlending:

					_gl.blendEquation( _gl.FUNC_ADD );
					_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE );

					break;

				case THREE.SubtractiveBlending:

					// TODO: Find blendFuncSeparate() combination

					_gl.blendEquation( _gl.FUNC_ADD );
					_gl.blendFunc( _gl.ZERO, _gl.ONE_MINUS_SRC_COLOR );

					break;

				case THREE.MultiplyBlending:

					// TODO: Find blendFuncSeparate() combination

					_gl.blendEquation( _gl.FUNC_ADD );
					_gl.blendFunc( _gl.ZERO, _gl.SRC_COLOR );

					break;

				default:*/

					_gl.blendEquationSeparate( _gl.FUNC_ADD, _gl.FUNC_ADD );
					_gl.blendFuncSeparate( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA, _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );

					/*break;

			}*/

			_oldBlending = blending;

		}

	};

	function setTextureParameters( textureType, texture, image ) {

		if ( isPowerOfTwo( image.width ) && isPowerOfTwo( image.height ) ) {

			_gl.texParameteri( textureType, _gl.TEXTURE_WRAP_S, paramThreeToGL( texture.wrapS ) );
			_gl.texParameteri( textureType, _gl.TEXTURE_WRAP_T, paramThreeToGL( texture.wrapT ) );

			_gl.texParameteri( textureType, _gl.TEXTURE_MAG_FILTER, paramThreeToGL( texture.magFilter ) );
			_gl.texParameteri( textureType, _gl.TEXTURE_MIN_FILTER, paramThreeToGL( texture.minFilter ) );

			_gl.generateMipmap( textureType );

		} else {

			_gl.texParameteri( textureType, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE );
			_gl.texParameteri( textureType, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE );

			_gl.texParameteri( textureType, _gl.TEXTURE_MAG_FILTER, filterFallback( texture.magFilter ) );
			_gl.texParameteri( textureType, _gl.TEXTURE_MIN_FILTER, filterFallback( texture.minFilter ) );

		}

	};

	function setTexture( texture, slot ) {

		if ( texture.needsUpdate ) {

			if ( !texture.__webglInit ) {

				texture.__webglTexture = _gl.createTexture();

				_gl.bindTexture( _gl.TEXTURE_2D, texture.__webglTexture );
				_gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image );

				texture.__webglInit = true;

			} else {

				_gl.bindTexture( _gl.TEXTURE_2D, texture.__webglTexture );
				// _gl.texImage2D( _gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image );
				_gl.texSubImage2D( _gl.TEXTURE_2D, 0, 0, 0, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image );

			}

			setTextureParameters( _gl.TEXTURE_2D, texture, texture.image );
			_gl.bindTexture( _gl.TEXTURE_2D, null );

			texture.needsUpdate = false;

		}

		_gl.activeTexture( _gl.TEXTURE0 + slot );
		_gl.bindTexture( _gl.TEXTURE_2D, texture.__webglTexture );

	};

	/*function setCubeTexture( texture, slot ) {

		if ( texture.image.length == 6 ) {

			if ( texture.needsUpdate ) {

				if ( !texture.__webglInit ) {

					texture.image.__webglTextureCube = _gl.createTexture();

					_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, texture.image.__webglTextureCube );

					for ( var i = 0; i < 6; ++i ) {

						_gl.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image[ i ] );

					}

					texture.__webglInit = true;

				} else {

					_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, texture.image.__webglTextureCube );

					for ( var i = 0; i < 6; ++i ) {

						// _gl.texImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image[ i ] );
						_gl.texSubImage2D( _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image[ i ] );

					}

				}

				setTextureParameters( _gl.TEXTURE_CUBE_MAP, texture, texture.image[0] );
				_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, null );

				texture.needsUpdate = false;

			}

			_gl.activeTexture( _gl.TEXTURE0 + slot );
			_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, texture.image.__webglTextureCube );

		}

	};*/

	function setRenderTarget( renderTexture ) {

		if ( renderTexture && !renderTexture.__webglFramebuffer ) {

			if( renderTexture.depthBuffer === undefined ) renderTexture.depthBuffer = true;
			if( renderTexture.stencilBuffer === undefined ) renderTexture.stencilBuffer = true;

			renderTexture.__webglFramebuffer = _gl.createFramebuffer();
			renderTexture.__webglRenderbuffer = _gl.createRenderbuffer();
			renderTexture.__webglTexture = _gl.createTexture();


			// Setup texture

			_gl.bindTexture( _gl.TEXTURE_2D, renderTexture.__webglTexture );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, paramThreeToGL( renderTexture.wrapS ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, paramThreeToGL( renderTexture.wrapT ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, paramThreeToGL( renderTexture.magFilter ) );
			_gl.texParameteri( _gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, paramThreeToGL( renderTexture.minFilter ) );
			_gl.texImage2D( _gl.TEXTURE_2D, 0, paramThreeToGL( renderTexture.format ), renderTexture.width, renderTexture.height, 0, paramThreeToGL( renderTexture.format ), paramThreeToGL( renderTexture.type ), null );

			// Setup render and frame buffer

			_gl.bindRenderbuffer( _gl.RENDERBUFFER, renderTexture.__webglRenderbuffer );
			_gl.bindFramebuffer( _gl.FRAMEBUFFER, renderTexture.__webglFramebuffer );

			_gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_2D, renderTexture.__webglTexture, 0 );

			if ( renderTexture.depthBuffer && !renderTexture.stencilBuffer ) {

				_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, renderTexture.width, renderTexture.height );
				_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderTexture.__webglRenderbuffer );

			/* For some reason this is not working. Defaulting to RGBA4.	
			} else if( !renderTexture.depthBuffer && renderTexture.stencilBuffer ) {

				_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.STENCIL_INDEX8, renderTexture.width, renderTexture.height );
				_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderTexture.__webglRenderbuffer );
			*/
			} else if( renderTexture.depthBuffer && renderTexture.stencilBuffer ) {

				_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_STENCIL, renderTexture.width, renderTexture.height );
				_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderTexture.__webglRenderbuffer );

			} else {

				_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.RGBA4, renderTexture.width, renderTexture.height );

			}


			// Release everything

			_gl.bindTexture( _gl.TEXTURE_2D, null );
			_gl.bindRenderbuffer( _gl.RENDERBUFFER, null );
			_gl.bindFramebuffer( _gl.FRAMEBUFFER, null);

		}

		var framebuffer, width, height;

		if ( renderTexture ) {

			framebuffer = renderTexture.__webglFramebuffer;
			width = renderTexture.width;
			height = renderTexture.height;

		} else {

			framebuffer = null;
			width = _viewportWidth;
			height = _viewportHeight;

		}

		if ( framebuffer != _currentFramebuffer ) {

			_gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
			_gl.viewport( _viewportX, _viewportY, width, height );

			_currentFramebuffer = framebuffer;

		}

	};

	/*function updateRenderTargetMipmap( renderTarget ) {

		_gl.bindTexture( _gl.TEXTURE_2D, renderTarget.__webglTexture );
		_gl.generateMipmap( _gl.TEXTURE_2D );
		_gl.bindTexture( _gl.TEXTURE_2D, null );

	};*/

	function cacheUniformLocations( program, identifiers ) {

		var i, l, id;

		for( i = 0, l = identifiers.length; i < l; i++ ) {

			id = identifiers[ i ];
			program.uniforms[ id ] = _gl.getUniformLocation( program, id );

		}

	};

	function cacheAttributeLocations( program, identifiers ) {

		var i, l, id;

		for( i = 0, l = identifiers.length; i < l; i++ ) {

			id = identifiers[ i ];
			program.attributes[ id ] = _gl.getAttribLocation( program, id );

		}

	};

	function getShader( type, string ) {

		var shader;

		if ( type == "fragment" ) {

			shader = _gl.createShader( _gl.FRAGMENT_SHADER );

		} else if ( type == "vertex" ) {

			shader = _gl.createShader( _gl.VERTEX_SHADER );

		}

		_gl.shaderSource( shader, string );
		_gl.compileShader( shader );

		if ( !_gl.getShaderParameter( shader, _gl.COMPILE_STATUS ) ) {

			console.error( _gl.getShaderInfoLog( shader ) );
			console.error( string );
			return null;

		}

		return shader;

	};

	// fallback filters for non-power-of-2 textures

	function filterFallback( f ) {

		switch ( f ) {

			case THREE.NearestFilter:
			case THREE.NearestMipMapNearestFilter:
			case THREE.NearestMipMapLinearFilter: return _gl.NEAREST; break;

			case THREE.LinearFilter:
			case THREE.LinearMipMapNearestFilter:
			case THREE.LinearMipMapLinearFilter: 
			default:

				return _gl.LINEAR; break;

		}

	};

	/*function paramThreeToGL( p ) {

		switch ( p ) {

			case THREE.RepeatWrapping: return _gl.REPEAT; break;
			case THREE.ClampToEdgeWrapping: return _gl.CLAMP_TO_EDGE; break;
			case THREE.MirroredRepeatWrapping: return _gl.MIRRORED_REPEAT; break;

			case THREE.NearestFilter: return _gl.NEAREST; break;
			case THREE.NearestMipMapNearestFilter: return _gl.NEAREST_MIPMAP_NEAREST; break;
			case THREE.NearestMipMapLinearFilter: return _gl.NEAREST_MIPMAP_LINEAR; break;

			case THREE.LinearFilter: return _gl.LINEAR; break;
			case THREE.LinearMipMapNearestFilter: return _gl.LINEAR_MIPMAP_NEAREST; break;
			case THREE.LinearMipMapLinearFilter: return _gl.LINEAR_MIPMAP_LINEAR; break;

			case THREE.ByteType: return _gl.BYTE; break;
			case THREE.UnsignedByteType: return _gl.UNSIGNED_BYTE; break;
			case THREE.ShortType: return _gl.SHORT; break;
			case THREE.UnsignedShortType: return _gl.UNSIGNED_SHORT; break;
			case THREE.IntType: return _gl.INT; break;
			case THREE.UnsignedShortType: return _gl.UNSIGNED_INT; break;
			case THREE.FloatType: return _gl.FLOAT; break;

			case THREE.AlphaFormat: return _gl.ALPHA; break;
			case THREE.RGBFormat: return _gl.RGB; break;
			case THREE.RGBAFormat: return _gl.RGBA; break;
			case THREE.LuminanceFormat: return _gl.LUMINANCE; break;
			case THREE.LuminanceAlphaFormat: return _gl.LUMINANCE_ALPHA; break;

		}

		return 0;

	};*/

	function isPowerOfTwo( value ) {

		return ( value & ( value - 1 ) ) == 0;

	};

	/*function materialNeedsSmoothNormals( material ) {

		return material && material.shading != undefined && material.shading == THREE.SmoothShading;

	};*/

	/*function bufferNeedsSmoothNormals( geometryGroup, object ) {

		var m, ml, i, l, meshMaterial, needsSmoothNormals = false;

		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			meshMaterial = object.materials[ m ];

			if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = geometryGroup.materials.length; i < l; i++ ) {

					if ( materialNeedsSmoothNormals( geometryGroup.materials[ i ] ) ) {

						needsSmoothNormals = true;
						break;

					}

				}

			} else {

				if ( materialNeedsSmoothNormals( meshMaterial ) ) {

					needsSmoothNormals = true;
					break;

				}

			}

			if ( needsSmoothNormals ) break;

		}

		return needsSmoothNormals;

	};*/

	function unrollGroupMaterials( geometryGroup, object ) {

		var m, ml, i, il,
			material, meshMaterial,
			materials = [];

		for ( m = 0, ml = object.materials.length; m < ml; m++ ) {

			meshMaterial = object.materials[ m ];

			/*if ( meshMaterial instanceof THREE.MeshFaceMaterial ) {

				for ( i = 0, l = geometryGroup.materials.length; i < l; i++ ) {

					material = geometryGroup.materials[ i ];

					if ( material ) {

						materials.push( material );

					}

				}

			} else {*/

				material = meshMaterial;

				if ( material ) {

					materials.push( material );

				}

			//}

		}

		return materials;

	};

	/*function bufferGuessVertexColorType( materials, geometryGroup, object ) {

		var i, m, ml = materials.length;

		// use vertexColor type from the first material in unrolled materials

		for ( i = 0; i < ml; i++ ) {

			m = materials[ i ];

			if ( m.vertexColors ) {

				return m.vertexColors;

			}

		}

		return false;

	};*/

	/*function bufferGuessNormalType( materials, geometryGroup, object ) {

		var i, m, ml = materials.length;

		// only MeshBasicMaterial and MeshDepthMaterial don't need normals

		for ( i = 0; i < ml; i++ ) {

			m = materials[ i ];

			if ( ( m instanceof THREE.MeshBasicMaterial && !m.envMap ) || m instanceof THREE.MeshDepthMaterial ) continue;

			if ( materialNeedsSmoothNormals( m ) ) {

				return THREE.SmoothShading;

			} else {

				return THREE.FlatShading;

			}

		}

		return false;

	};*/

	function bufferGuessUVType( materials, geometryGroup, object ) {

		var i, m, ml = materials.length;

		// material must use some texture to require uvs

		for ( i = 0; i < ml; i++ ) {

			m = materials[ i ];

			if ( m.map || m.lightMap || m instanceof THREE.MeshShaderMaterial ) {

				return true;

			}

		}

		return false;

	};

	/*function allocateBones( object ) {

		// default for when object is not specified
		// ( for example when prebuilding shader
		//   to be used with multiple objects )
		//
		// 	- leave some extra space for other uniforms
		//  - limit here is ANGLE's 254 max uniform vectors
		//    (up to 54 should be safe)

		var maxBones = 50;

		if ( object !== undefined && object instanceof THREE.SkinnedMesh ) {

			maxBones = object.bones.length;

		}

		return maxBones;

	};*/

	/*function allocateLights( lights, maxLights ) {

		var l, ll, light, dirLights, pointLights, maxDirLights, maxPointLights;
		dirLights = pointLights = maxDirLights = maxPointLights = 0;

		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];

			if ( light instanceof THREE.DirectionalLight ) dirLights++;
			if ( light instanceof THREE.PointLight ) pointLights++;

		}

		if ( ( pointLights + dirLights ) <= maxLights ) {

			maxDirLights = dirLights;
			maxPointLights = pointLights;

		} else {

			maxDirLights = Math.ceil( maxLights * dirLights / ( pointLights + dirLights ) );
			maxPointLights = maxLights - maxDirLights;

		}

		return { 'directional' : maxDirLights, 'point' : maxPointLights };

	};*/

	/* DEBUG
	function getGLParams() {

		var params  = {

			'MAX_VARYING_VECTORS': _gl.getParameter( _gl.MAX_VARYING_VECTORS ),
			'MAX_VERTEX_ATTRIBS': _gl.getParameter( _gl.MAX_VERTEX_ATTRIBS ),

			'MAX_TEXTURE_IMAGE_UNITS': _gl.getParameter( _gl.MAX_TEXTURE_IMAGE_UNITS ),
			'MAX_VERTEX_TEXTURE_IMAGE_UNITS': _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ),
			'MAX_COMBINED_TEXTURE_IMAGE_UNITS' : _gl.getParameter( _gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS ),

			'MAX_VERTEX_UNIFORM_VECTORS': _gl.getParameter( _gl.MAX_VERTEX_UNIFORM_VECTORS ),
			'MAX_FRAGMENT_UNIFORM_VECTORS': _gl.getParameter( _gl.MAX_FRAGMENT_UNIFORM_VECTORS )
		}

		return params;
	};

	function dumpObject( obj ) {

		var p, str = "";
		for ( p in obj ) {

			str += p + ": " + obj[p] + "\n";

		}

		return str;
	}
	*/
};

/**
 * @author szimek / https://github.com/szimek/
 */

/*THREE.WebGLRenderTarget = function ( width, height, options ) {

	this.width = width;
	this.height = height;

	options = options || {};

	this.wrapS = options.wrapS !== undefined ? options.wrapS : THREE.ClampToEdgeWrapping;
	this.wrapT = options.wrapT !== undefined ? options.wrapT : THREE.ClampToEdgeWrapping;

	this.magFilter = options.magFilter !== undefined ? options.magFilter : THREE.LinearFilter;
	this.minFilter = options.minFilter !== undefined ? options.minFilter : THREE.LinearMipMapLinearFilter;

	this.format = options.format !== undefined ? options.format : THREE.RGBAFormat;
	this.type = options.type !== undefined ? options.type : THREE.UnsignedByteType;

	this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
	this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;

};*/
/**
 * @author mr.doob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Sphere.as
 */

THREE.Sphere = function ( radius, segmentsWidth, segmentsHeight ) {

	THREE.Geometry.call( this );

	var gridX = segmentsWidth || 8,
	gridY = segmentsHeight || 6;

	var i, j, pi = Math.PI;
	var iHor = Math.max( 3, gridX );
	var iVer = Math.max( 2, gridY );
	var aVtc = [];

	for ( j = 0; j < ( iVer + 1 ) ; j++ ) {

		var fRad1 = j / iVer;
		var fZ = radius * Math.cos( fRad1 * pi );
		var fRds = radius * Math.sin( fRad1 * pi );
		var aRow = [];
		var oVtx = 0;

		for ( i = 0; i < iHor; i++ ) {

			var fRad2 = 2 * i / iHor;
			var fX = fRds * Math.sin( fRad2 * pi );
			var fY = fRds * Math.cos( fRad2 * pi );

			if ( !( ( j == 0 || j == iVer ) && i > 0 ) ) {

				oVtx = this.vertices.push( new THREE.Vertex( new THREE.Vector3( fY, fZ, fX ) ) ) - 1;

			}

			aRow.push( oVtx );

		}

		aVtc.push( aRow );

	}

	var n1, n2, n3, iVerNum = aVtc.length;

	for ( j = 0; j < iVerNum; j++ ) {

		var iHorNum = aVtc[ j ].length;

		if ( j > 0 ) {

			for ( i = 0; i < iHorNum; i++ ) {

				var bEnd = i == ( iHorNum - 1 );
				var aP1 = aVtc[ j ][ bEnd ? 0 : i + 1 ];
				var aP2 = aVtc[ j ][ ( bEnd ? iHorNum - 1 : i ) ];
				var aP3 = aVtc[ j - 1 ][ ( bEnd ? iHorNum - 1 : i ) ];
				var aP4 = aVtc[ j - 1 ][ bEnd ? 0 : i + 1 ];

				var fJ0 = j / ( iVerNum - 1 );
				var fJ1 = ( j - 1 ) / ( iVerNum - 1 );
				var fI0 = ( i + 1 ) / iHorNum;
				var fI1 = i / iHorNum;

				var aP1uv = new THREE.UV( 1 - fI0, fJ0 );
				var aP2uv = new THREE.UV( 1 - fI1, fJ0 );
				var aP3uv = new THREE.UV( 1 - fI1, fJ1 );
				var aP4uv = new THREE.UV( 1 - fI0, fJ1 );

				if ( j < ( aVtc.length - 1 ) ) {

					n1 = this.vertices[ aP1 ].position.clone();
					n2 = this.vertices[ aP2 ].position.clone();
					n3 = this.vertices[ aP3 ].position.clone();
					n1.normalize();
					n2.normalize();
					n3.normalize();

					this.faces.push( new THREE.Face3( aP1, aP2, aP3, [ new THREE.Vector3( n1.x, n1.y, n1.z ), new THREE.Vector3( n2.x, n2.y, n2.z ), new THREE.Vector3( n3.x, n3.y, n3.z ) ] ) );

					this.faceVertexUvs[ 0 ].push( [ aP1uv, aP2uv, aP3uv ] );

				}

				if ( j > 1 ) {

					n1 = this.vertices[aP1].position.clone();
					n2 = this.vertices[aP3].position.clone();
					n3 = this.vertices[aP4].position.clone();
					n1.normalize();
					n2.normalize();
					n3.normalize();

					this.faces.push( new THREE.Face3( aP1, aP3, aP4, [ new THREE.Vector3( n1.x, n1.y, n1.z ), new THREE.Vector3( n2.x, n2.y, n2.z ), new THREE.Vector3( n3.x, n3.y, n3.z ) ] ) );

					this.faceVertexUvs[ 0 ].push( [ aP1uv, aP3uv, aP4uv ] );

				}

			}
		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	this.boundingSphere = { radius: radius };

};

THREE.Sphere.prototype = new THREE.Geometry();
THREE.Sphere.prototype.constructor = THREE.Sphere;
