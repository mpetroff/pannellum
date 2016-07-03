/*
 * libpannellum - A WebGL and CSS 3D transform based Panorama Renderer
 * Copyright (c) 2012-2016 Matthew Petroff
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

window.libpannellum = (function(window, document, undefined) {

'use strict';

/**
 * Creates a new panorama renderer.
 * @constructor
 * @param {HTMLElement} container - The container element for the renderer.
 */
function Renderer(container) {
    var canvas = document.createElement('canvas');
    canvas.style.width = canvas.style.height = '100%';
    container.appendChild(canvas);

    var program, gl, vs, fs;
    var fallbackImgSize;
    var world;
    var vtmps;
    var pose;
    var image, imageType, dynamic;
    var texCoordBuffer, cubeVertBuf, cubeVertTexCoordBuf, cubeVertIndBuf;

    /**
     * Initialize renderer.
     * @memberof Renderer
     * @instance
     * @param {Image|Array|Object} image - Input image; format varies based on
     *      `imageType`. For `equirectangular`, this is an image; for
     *      `cubemap`, this is an array of images for the cube faces in the
     *      order [+z, +x, -z, -x, +y, -y]; for `multires`, this is a
     *      configuration object.
     * @param {string} imageType - The type of the image: `equirectangular`,
     *      `cubemap`, or `multires`.
     * @param {boolean} dynamic - Whether or not the image is dynamic (e.g. video).
     * @param {number} haov - Initial horizontal angle of view.
     * @param {number} vaov - Initial vertical angle of view.
     * @param {number} voffset - Initial vertical offset angle.
     * @param {function} callback - Load callback function.
     * @param {Object} [params] - Other configuration parameters (`horizonPitch`, `horizonRoll`).
     */
    this.init = function(_image, _imageType, _dynamic, haov, vaov, voffset, callback, params) {
        // Default argument for image type
        if (typeof _imageType === undefined)
            _imageType = 'equirectangular';
        imageType = _imageType;
        image = _image;
        dynamic = _dynamic;

        // Clear old data
        if (program) {
            if (vs) {
                gl.detachShader(program, vs);
                gl.deleteShader(vs);
            }
            if (fs) {
                gl.detachShader(program, fs);
                gl.deleteShader(fs);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            if (program.texture)
                gl.deleteTexture(program.texture);
            if (program.nodeCache)
                for (var i = 0; i < program.nodeCache.length; i++)
                    gl.deleteTexture(program.nodeCache[i].texture);
            gl.deleteProgram(program);
            program = undefined;
        }
        pose = undefined;

        var s;
        
        // This awful browser specific test exists because iOS 8/9 and IE 11
        // don't display non-power-of-two cubemap textures but also don't
        // throw an error (tested on an iPhone 5c / iOS 8.1.3 / iOS 9.2).
        // Therefore, the WebGL context is never created for these browsers for
        // NPOT cubemaps, and the CSS 3D transform fallback renderer is used
        // instead.
        if (!(imageType == 'cubemap' &&
            (image[0].width & (image[0].width - 1)) !== 0 &&
            (navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 8_/) ||
            navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 9_/) ||
            navigator.userAgent.match(/Trident.*rv[ :]*11\./)))) {
            // Enable WebGL on canvas
            if (!gl)
                gl = canvas.getContext('experimental-webgl', {alpha: false, depth: false});
        }
        
        // If there is no WebGL, fall back to CSS 3D transform renderer.
        // While browser specific tests are usually frowned upon, the
        // fallback viewer only really works with WebKit/Blink and IE 10/11
        // (it doesn't work properly in Firefox).
        if (!gl && ((imageType == 'multires' && image.hasOwnProperty('fallbackPath')) ||
            imageType == 'cubemap') &&
            ('WebkitAppearance' in document.documentElement.style ||
            navigator.userAgent.match(/Trident.*rv[ :]*11\./) ||
            navigator.appVersion.indexOf('MSIE 10') !== -1)) {
            // Remove old world if it exists
            if (world) {
                container.removeChild(world);
            }
            
            // Initialize renderer
            world = document.createElement('div');
            world.className = 'pnlm-world';
            
            // Add images
            var path;
            if (image.basePath) {
                path = image.basePath + image.fallbackPath;
            } else {
                path = image.fallbackPath;
            }
            var sides = ['f', 'r', 'b', 'l', 'u', 'd'];
            var loaded = 0;
            var onLoad = function() {
                // Draw image on canvas
                var faceCanvas = document.createElement('canvas');
                faceCanvas.className = 'pnlm-face pnlm-' + sides[this.side] + 'face';
                world.appendChild(faceCanvas);
                var faceContext = faceCanvas.getContext('2d');
                faceCanvas.style.width = this.width + 4 + 'px';
                faceCanvas.style.height = this.height + 4 + 'px';
                faceCanvas.width = this.width + 4;
                faceCanvas.height = this.height + 4;
                faceContext.drawImage(this, 2, 2);
                var imgData = faceContext.getImageData(0, 0, faceCanvas.width, faceCanvas.height);
                var data = imgData.data;
                
                // Duplicate edge pixels
                var i;
                var j;
                for (i = 2; i < faceCanvas.width - 2; i++) {
                    for (j = 0; j < 4; j++) {
                        data[(i + faceCanvas.width) * 4 + j] = data[(i + faceCanvas.width * 2) * 4 + j];
                        data[(i + faceCanvas.width * (faceCanvas.height - 2)) * 4 + j] = data[(i + faceCanvas.width * (faceCanvas.height - 3)) * 4 + j];
                    }
                }
                for (i = 2; i < faceCanvas.height - 2; i++) {
                    for (j = 0; j < 4; j++) {
                        data[(i * faceCanvas.width + 1) * 4 + j] = data[(i * faceCanvas.width + 2) * 4 + j];
                        data[((i + 1) * faceCanvas.width - 2) * 4 + j] = data[((i + 1) * faceCanvas.width - 3) * 4 + j];
                    }
                }
                for (j = 0; j < 4; j++) {
                    data[(faceCanvas.width + 1) * 4 + j] = data[(faceCanvas.width * 2 + 2) * 4 + j];
                    data[(faceCanvas.width * 2 - 2) * 4 + j] = data[(faceCanvas.width * 3 - 3) * 4 + j];
                    data[(faceCanvas.width * (faceCanvas.height - 2) + 1) * 4 + j] = data[(faceCanvas.width * (faceCanvas.height - 3) + 2) * 4 + j];
                    data[(faceCanvas.width * (faceCanvas.height - 1) - 2) * 4 + j] = data[(faceCanvas.width * (faceCanvas.height - 2) - 3) * 4 + j];
                }
                for (i = 1; i < faceCanvas.width - 1; i++) {
                    for (j = 0; j < 4; j++) {
                        data[i * 4 + j] = data[(i + faceCanvas.width) * 4 + j];
                        data[(i + faceCanvas.width * (faceCanvas.height - 1)) * 4 + j] = data[(i + faceCanvas.width * (faceCanvas.height - 2)) * 4 + j];
                    }
                }
                for (i = 1; i < faceCanvas.height - 1; i++) {
                    for (j = 0; j < 4; j++) {
                        data[(i * faceCanvas.width) * 4 + j] = data[(i * faceCanvas.width + 1) * 4 + j];
                        data[((i + 1) * faceCanvas.width - 1) * 4 + j] = data[((i + 1) * faceCanvas.width - 2) * 4 + j];
                    }
                }
                for (j = 0; j < 4; j++) {
                    data[j] = data[(faceCanvas.width + 1) * 4 + j];
                    data[(faceCanvas.width - 1) * 4 + j] = data[(faceCanvas.width * 2 - 2) * 4 + j];
                    data[(faceCanvas.width * (faceCanvas.height - 1)) * 4 + j] = data[(faceCanvas.width * (faceCanvas.height - 2) + 1) * 4 + j];
                    data[(faceCanvas.width * faceCanvas.height - 1) * 4 + j] = data[(faceCanvas.width * (faceCanvas.height - 1) - 2) * 4 + j];
                }
                
                // Draw image width duplicated edge pixels on canvas
                faceContext.putImageData(imgData, 0, 0);
                
                loaded++;
                if (loaded == 6) {
                    fallbackImgSize = this.width;
                    container.appendChild(world);
                    callback();
                }
            };
            for (s = 0; s < 6; s++) {
                var faceImg = new Image();
                faceImg.crossOrigin = 'anonymous';
                faceImg.side = s;
                faceImg.onload = onLoad;
                if (imageType == 'multires') {
                    faceImg.src = encodeURI(path.replace('%s', sides[s]) + '.' + image.extension);
                } else {
                    faceImg.src = encodeURI(image[s].src);
                }
            }
            
            return;
        } else if (!gl) {
            console.log('Error: no WebGL support detected!');
            throw {type: 'no webgl'};
        }
        if (image.basePath) {
            image.fullpath = image.basePath + image.path;
        } else {
            image.fullpath = image.path;
        }
        image.invTileResolution = 1 / image.tileResolution;
        
        var vertices = createCube();
        vtmps = [];
        for (s = 0; s < 6; s++) {
            vtmps[s] = vertices.slice(s * 12, s * 12 + 12);
            vertices = createCube();
        }
        
        // Make sure image isn't too big
        var width, maxWidth;
        if (imageType == 'equirectangular') {
            width = Math.max(image.width, image.height);
            maxWidth = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            if (width > maxWidth) {
                console.log('Error: The image is too big; it\'s ' + width + 'px wide, but this device\'s maximum supported width is ' + maxWidth + 'px.');
                throw {type: 'webgl size error', width: width, maxWidth: maxWidth};
            }
        } else if (imageType == 'cubemap') {
            width = image[0].width;
            maxWidth = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
            if (width > maxWidth) {
                console.log('Error: The cube face image is too big; it\'s ' + width + 'px wide, but this device\'s maximum supported width is ' + maxWidth + 'px.');
                throw {type: 'webgl size error', width: width, maxWidth: maxWidth};
            }
        }

        // Store horizon pitch and roll if applicable
        if (params !== undefined && (params.horizonPitch !== undefined || params.horizonRoll !== undefined))
            pose = [params.horizonPitch == undefined ? 0 : params.horizonPitch,
                    params.horizonRoll == undefined ? 0 : params.horizonRoll];

        // Set 2d texture binding
        var glBindType = gl.TEXTURE_2D;

        // Create viewport for entire canvas
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Create vertex shader
        vs = gl.createShader(gl.VERTEX_SHADER);
        var vertexSrc = v;
        if (imageType == 'multires') {
            vertexSrc = vMulti;
        }
        gl.shaderSource(vs, vertexSrc);
        gl.compileShader(vs);

        // Create fragment shader
        fs = gl.createShader(gl.FRAGMENT_SHADER);
        var fragmentSrc = fragEquirectangular;
        if (imageType == 'cubemap') {
            glBindType = gl.TEXTURE_CUBE_MAP;
            fragmentSrc = fragCube;
        } else if (imageType == 'multires') {
            fragmentSrc = fragMulti;
        }
        gl.shaderSource(fs, fragmentSrc);
        gl.compileShader(fs);

        // Link WebGL program
        program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        // Log errors
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
            console.log(gl.getShaderInfoLog(vs));
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
            console.log(gl.getShaderInfoLog(fs));
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            console.log(gl.getProgramInfoLog(program));

        // Use WebGL program
        gl.useProgram(program);

        program.drawInProgress = false;

        // Look up texture coordinates location
        program.texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
        gl.enableVertexAttribArray(program.texCoordLocation);

        if (imageType != 'multires') {
            // Provide texture coordinates for rectangle
            if (!texCoordBuffer)
                texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]), gl.STATIC_DRAW);
            gl.vertexAttribPointer(program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

            // Pass aspect ratio
            program.aspectRatio = gl.getUniformLocation(program, 'u_aspectRatio');
            gl.uniform1f(program.aspectRatio, canvas.width / canvas.height);

            // Locate psi, theta, focal length, horizontal extent, vertical extent, and vertical offset
            program.psi = gl.getUniformLocation(program, 'u_psi');
            program.theta = gl.getUniformLocation(program, 'u_theta');
            program.f = gl.getUniformLocation(program, 'u_f');
            program.h = gl.getUniformLocation(program, 'u_h');
            program.v = gl.getUniformLocation(program, 'u_v');
            program.vo = gl.getUniformLocation(program, 'u_vo');
            program.rot = gl.getUniformLocation(program, 'u_rot');

            // Pass horizontal extent, vertical extent, and vertical offset
            gl.uniform1f(program.h, haov / (Math.PI * 2.0));
            gl.uniform1f(program.v, vaov / Math.PI);
            gl.uniform1f(program.vo, voffset / Math.PI * 2);

            // Create texture
            program.texture = gl.createTexture();
            gl.bindTexture(glBindType, program.texture);

            // Upload images to texture depending on type
            if (imageType == 'cubemap') {
                // Load all six sides of the cube map
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[1]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[3]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[4]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[5]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[0]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image[2]);
            } else {
                // Upload image to the texture
                gl.texImage2D(glBindType, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            }

            // Set parameters for rendering any size
            gl.texParameteri(glBindType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(glBindType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(glBindType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(glBindType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        } else {
            // Look up vertex coordinates location
            program.vertPosLocation = gl.getAttribLocation(program, 'a_vertCoord');
            gl.enableVertexAttribArray(program.vertPosLocation);

            // Create buffers
            if (!cubeVertBuf)
                cubeVertBuf = gl.createBuffer();
            if (!cubeVertTexCoordBuf)
                cubeVertTexCoordBuf = gl.createBuffer();
            if (!cubeVertIndBuf)
                cubeVertIndBuf = gl.createBuffer();

            // Bind texture coordinate buffer and pass coordinates to WebGL
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertTexCoordBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,1,0,1,1,0,1]), gl.STATIC_DRAW);

            // Bind square index buffer and pass indicies to WebGL
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertIndBuf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);

            // Find uniforms
            program.perspUniform = gl.getUniformLocation(program, 'u_perspMatrix');
            program.cubeUniform = gl.getUniformLocation(program, 'u_cubeMatrix');
            //program.colorUniform = gl.getUniformLocation(program, 'u_color');

            program.level = -1;

            program.currentNodes = [];
            program.nodeCache = [];
            program.nodeCacheTimestamp = 0;
        }

        // Check if there was an error
        if (gl.getError() !== 0) {
            console.log('Error: Something went wrong with WebGL!');
            throw {type: 'webgl error'};
        }

        callback();
     };

    /**
     * Destroy renderer.
     * @memberof Renderer
     * @instance
     */
    this.destroy = function() {
        if (container !== undefined) {
            if (canvas !== undefined) {
                container.removeChild(canvas);
            }
            if (world !== undefined) {
                container.removeChild(world);
            }
        }
    };

    /**
     * Resize renderer (call after resizing container).
     * @memberof Renderer
     * @instance
     */
    this.resize = function() {
        var pixelRatio = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * pixelRatio;
        canvas.height = canvas.clientHeight * pixelRatio;
        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height);
            if (imageType != 'multires') {
                gl.uniform1f(program.aspectRatio, canvas.width / canvas.height);
            }
        }
    };
    // Initialize canvas size
    this.resize();

    /**
     * Render new view of panorama.
     * @memberof Renderer
     * @instance
     * @param {number} pitch - Pitch to render at (in radians).
     * @param {number} yaw - Yaw to render at (in radians).
     * @param {number} hfov - Horizontal field of view to render with (in radians).
     * @param {Object} [params] - Extra configuration parameters. 
     * @param {number} [params.roll] - Camera roll (in radians).
     * @param {boolean} [params.returnImage] - Return rendered image?
     */
    this.render = function(pitch, yaw, hfov, params) {
        var focal, i, s, roll = 0;
        if (params === undefined)
            params = {};
        if (params.roll)
            roll = params.roll;

        // Apply pitch and roll transformation if applicable
        if (pose !== undefined) {
            var horizonPitch = pose[0],
                horizonRoll = pose[1];

            // Calculate new pitch and yaw
            var orig_pitch = pitch,
                orig_yaw = yaw,
                x = Math.cos(horizonRoll) * Math.sin(pitch) * Math.sin(horizonPitch) +
                    Math.cos(pitch) * (Math.cos(horizonPitch) * Math.cos(yaw) +
                    Math.sin(horizonRoll) * Math.sin(horizonPitch) * Math.sin(yaw)),
                y = -Math.sin(pitch) * Math.sin(horizonRoll) +
                    Math.cos(pitch) * Math.cos(horizonRoll) * Math.sin(yaw),
                z = Math.cos(horizonRoll) * Math.cos(horizonPitch) * Math.sin(pitch) +
                    Math.cos(pitch) * (-Math.cos(yaw) * Math.sin(horizonPitch) +
                    Math.cos(horizonPitch) * Math.sin(horizonRoll) * Math.sin(yaw));
            pitch = Math.asin(Math.max(Math.min(z, 1), -1));
            yaw = Math.atan2(y, x);

            // Calculate roll
            var v = [Math.cos(orig_pitch) * (Math.sin(horizonRoll) * Math.sin(horizonPitch) * Math.cos(orig_yaw) -
                    Math.cos(horizonPitch) * Math.sin(orig_yaw)),
                    Math.cos(orig_pitch) * Math.cos(horizonRoll) * Math.cos(orig_yaw),
                    Math.cos(orig_pitch) * (Math.cos(horizonPitch) * Math.sin(horizonRoll) * Math.cos(orig_yaw) +
                    Math.sin(orig_yaw) * Math.sin(horizonPitch))],
                w = [-Math.cos(pitch) * Math.sin(yaw), Math.cos(pitch) * Math.cos(yaw)];
            var roll_adj = Math.acos(Math.max(Math.min((v[0]*w[0] + v[1]*w[1]) /
                (Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]) *
                Math.sqrt(w[0]*w[0]+w[1]*w[1])), 1), -1));
            if (v[2] < 0)
                roll_adj = 2 * Math.PI - roll_adj;
            roll += roll_adj;
        }

        // If no WebGL
        if (!gl && (imageType == 'multires' || imageType == 'cubemap')) {
            // Determine face transforms
            s = fallbackImgSize / 2;
            
            var transforms = {
                f: 'translate3d(-' + (s + 2) + 'px, -' + (s + 2) + 'px, -' + s + 'px)',
                b: 'translate3d(' + (s + 2) + 'px, -' + (s + 2) + 'px, ' + s + 'px) rotateX(180deg) rotateZ(180deg)',
                u: 'translate3d(-' + (s + 2) + 'px, -' + s + 'px, ' + (s + 2) + 'px) rotateX(270deg)',
                d: 'translate3d(-' + (s + 2) + 'px, ' + s + 'px, -' + (s + 2) + 'px) rotateX(90deg)',
                l: 'translate3d(-' + s + 'px, -' + (s + 2) + 'px, ' + (s + 2) + 'px) rotateX(180deg) rotateY(90deg) rotateZ(180deg)',
                r: 'translate3d(' + s + 'px, -' + (s + 2) + 'px, -' + (s + 2) + 'px) rotateY(270deg)'
            };
            focal = 1 / Math.tan(hfov / 2);
            var zoom = focal * canvas.width / (window.devicePixelRatio || 1) / 2 + 'px';
            var transform = 'perspective(' + zoom + ') translateZ(' + zoom + ') rotateX(' + pitch + 'rad) rotateY(' + yaw + 'rad) ';
            
            // Apply face transforms
            var faces = Object.keys(transforms);
            for (i = 0; i < 6; i++) {
                var face = world.querySelector('.pnlm-' + faces[i] + 'face').style;
                face.webkitTransform = transform + transforms[faces[i]];
                face.transform = transform + transforms[faces[i]];
            }
            return;
        }
        
        if (imageType != 'multires') {
            // Calculate focal length from vertical field of view
            var vfov = 2 * Math.atan(Math.tan(hfov * 0.5) / (canvas.width / canvas.height));
            focal = 1 / Math.tan(vfov * 0.5);

            // Pass psi, theta, roll, and focal length
            gl.uniform1f(program.psi, yaw);
            gl.uniform1f(program.theta, pitch);
            gl.uniform1f(program.rot, roll);
            gl.uniform1f(program.f, focal);
            
            if (dynamic === true) {
                // Update texture if dynamic
                if (imageType == 'equirectangular') {
                    gl.bindTexture(gl.TEXTURE_2D, program.texture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
                }
            }
            
            // Draw using current buffer
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        } else {
            // Create perspective matrix
            var perspMatrix = makePersp(hfov, canvas.width / canvas.height, 0.1, 100.0);
            
            // Find correct zoom level
            checkZoom(hfov);
            
            // Create rotation matrix
            var matrix = identityMatrix3();
            matrix = rotateMatrix(matrix, -roll, 'z');
            matrix = rotateMatrix(matrix, -pitch, 'x');
            matrix = rotateMatrix(matrix, yaw, 'y');
            matrix = makeMatrix4(matrix);
            
            // Set matrix uniforms
            gl.uniformMatrix4fv(program.perspUniform, false, new Float32Array(transposeMatrix4(perspMatrix)));
            gl.uniformMatrix4fv(program.cubeUniform, false, new Float32Array(transposeMatrix4(matrix)));
            
            // Find current nodes
            var rotPersp = rotatePersp(perspMatrix, matrix);
            program.nodeCache.sort(multiresNodeSort);
            if (program.nodeCache.length > 200 &&
                program.nodeCache.length > program.currentNodes.length + 50) {
                // Remove older nodes from cache
                var removed = program.nodeCache.splice(200, program.nodeCache.length - 200);
                for (var i = 0; i < removed.length; i++) {
                    // Explicitly delete textures
                    gl.deleteTexture(removed[i].texture);
                }
            }
            program.currentNodes = [];
            
            var sides = ['f', 'b', 'u', 'd', 'l', 'r'];
            for (s = 0; s < 6; s++) {
                var ntmp = new MultiresNode(vtmps[s], sides[s], 1, 0, 0, image.fullpath);
                testMultiresNode(rotPersp, ntmp, pitch, yaw, hfov);
            }
            program.currentNodes.sort(multiresNodeRenderSort);
            // Only process one tile per frame to improve responsiveness
            for (i = 0; i < program.currentNodes.length; i++) {
                if (!program.currentNodes[i].texture) {
                    setTimeout(processNextTile(program.currentNodes[i]), 0);
                    break;
                }
            }
            
            // Draw tiles
            multiresDraw();
        }
        
        if (params.returnImage !== undefined) {
            return canvas.toDataURL('image/png');
        }
    };
    
    /**
     * Check if images are loading.
     * @memberof Renderer
     * @instance
     * @returns {boolean} Whether or not images are loading.
     */
    this.isLoading = function() {
        if (gl && imageType == 'multires') {
            for ( var i = 0; i < program.currentNodes.length; i++ ) {
                if (!program.currentNodes[i].textureLoaded) {
                    return true;
                }
            }
        }
        return false;
    };
    
    /**
     * Retrieve renderer's canvas.
     * @memberof Renderer
     * @instance
     * @returns {HTMLElement} Renderer's canvas.
     */
    this.getCanvas = function() {
        return canvas;
    };
    
    /**
     * Sorting method for multires nodes.
     * @private
     * @param {MultiresNode} a - First node.
     * @param {MultiresNode} b - Second node.
     * @returns {number} Base tiles first, then higher timestamp first.
     */
    function multiresNodeSort(a, b) {
        // Base tiles are always first
        if (a.level == 1 && b.level != 1) {
            return -1;
        }
        if (b. level == 1 && a.level != 1) {
            return 1;
        }
        
        // Higher timestamp first
        return b.timestamp - a.timestamp;
    }
    
    /**
     * Sorting method for multires node rendering.
     * @private
     * @param {MultiresNode} a - First node.
     * @param {MultiresNode} b - Second node.
     * @returns {number} Lower zoom levels first, then closest to center first.
     */
    function multiresNodeRenderSort(a, b) {
        // Lower zoom levels first
        if (a.level != b.level) {
            return a.level - b.level;
        }
        
        // Lower distance from center first
        return a.diff - b.diff;
    }
    
    /**
     * Draws multires nodes.
     * @private
     */
    function multiresDraw() {
        if (!program.drawInProgress) {
            program.drawInProgress = true;
            for ( var i = 0; i < program.currentNodes.length; i++ ) {
                if (program.currentNodes[i].textureLoaded) {
                    //var color = program.currentNodes[i].color;
                    //gl.uniform4f(program.colorUniform, color[0], color[1], color[2], 1.0);
                    
                    // Bind vertex buffer and pass vertices to WebGL
                    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(program.currentNodes[i].vertices), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(program.vertPosLocation, 3, gl.FLOAT, false, 0, 0);
                    
                    // Prep for texture
                    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertTexCoordBuf);
                    gl.vertexAttribPointer(program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
                    
                    // Bind texture and draw tile
                    gl.bindTexture(gl.TEXTURE_2D, program.currentNodes[i].texture); // Bind program.currentNodes[i].texture to TEXTURE0
                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                }
            }
            program.drawInProgress = false;
        }
    }

    /**
     * Creates new multires node.
     * @constructor
     * @private
     * @param {number[]} vertices - Node's verticies.
     * @param {string} side - Node's cube face.
     * @param {number} level - Node's zoom level.
     * @param {number} x - Node's x position.
     * @param {number} y - Node's y position.
     * @param {string} path - Node's path.
     */
    function MultiresNode(vertices, side, level, x, y, path) {
        this.vertices = vertices;
        this.side = side;
        this.level = level;
        this.x = x;
        this.y = y;
        this.path = path.replace('%s',side).replace('%l',level).replace('%x',x).replace('%y',y);
    }

    /**
     * Test if multires node is visible. If it is, add it to current nodes,
     * load its texture, and load appropriate child nodes.
     * @private
     * @param {number[]} rotPersp - Rotated perspective matrix.
     * @param {MultiresNode} node - Multires node to check.
     * @param {number} pitch - Pitch to check at.
     * @param {number} yaw - Yaw to check at.
     * @param {number} hfov - Horizontal field of view to check at.
     */
    function testMultiresNode(rotPersp, node, pitch, yaw, hfov) {
        if (checkSquareInView(rotPersp, node.vertices)) {
            // Calculate central angle between center of view and center of tile
            var v = node.vertices;
            var x = v[0] + v[3] + v[6] + v[ 9];
            var y = v[1] + v[4] + v[7] + v[10];
            var z = v[2] + v[5] + v[8] + v[11];
            var r = Math.sqrt(x*x + y*y + z*z);
            var theta = Math.asin(z / r);
            var phi = Math.atan2(y, x);
            var ydiff = phi - yaw;
            ydiff += (ydiff > Math.PI) ? -2 * Math.PI : (ydiff < -Math.PI) ? 2 * Math.PI : 0;
            ydiff = Math.abs(ydiff);
            node.diff = Math.acos(Math.sin(pitch) * Math.sin(theta) + Math.cos(pitch) * Math.cos(theta) * Math.cos(ydiff));
            
            // Add node to current nodes and load texture if needed
            var inCurrent = false;
            for (var k = 0; k < program.nodeCache.length; k++) {
                if (program.nodeCache[k].path == node.path) {
                    inCurrent = true;
                    program.nodeCache[k].timestamp = program.nodeCacheTimestamp++;
                    program.nodeCache[k].diff = node.diff;
                    program.currentNodes.push(program.nodeCache[k]);
                    break;
                }
            }
            if (!inCurrent) {
                //node.color = [Math.random(), Math.random(), Math.random()];
                node.timestamp = program.nodeCacheTimestamp++;
                program.currentNodes.push(node);
                program.nodeCache.push(node);
            }
            
            // TODO: Test error
            // Create child nodes
            if (node.level < program.level) {
                var cubeSize = image.cubeResolution * Math.pow(2, node.level - image.maxLevel);
                var numTiles = Math.ceil(cubeSize * image.invTileResolution) - 1;
                var doubleTileSize = cubeSize % image.tileResolution * 2;
                var lastTileSize = (cubeSize * 2) % image.tileResolution;
                if (lastTileSize === 0) {
                    lastTileSize = image.tileResolution;
                }
                if (doubleTileSize === 0) {
                    doubleTileSize = image.tileResolution * 2;
                }
                var f = 0.5;
                if (node.x == numTiles || node.y == numTiles) {
                    f = 1.0 - image.tileResolution / (image.tileResolution + lastTileSize);
                }
                var i = 1.0 - f;
                var children = [];
                var vtmp, ntmp;
                var f1 = f, f2 = f, f3 = f, i1 = i, i2 = i, i3 = i;
                // Handle non-symmetric tiles
                if (lastTileSize < image.tileResolution) {
                    if (node.x == numTiles && node.y != numTiles) {
                        f2 = 0.5;
                        i2 = 0.5;
                        if (node.side == 'd' || node.side == 'u') {
                            f3 = 0.5;
                            i3 = 0.5;
                        }
                    } else if (node.x != numTiles && node.y == numTiles) {
                        f1 = 0.5;
                        i1 = 0.5;
                        if (node.side == 'l' || node.side == 'r') {
                            f3 = 0.5;
                            i3 = 0.5;
                        }
                    }
                }
                // Handle small tiles that have fewer than four children
                if (doubleTileSize <= image.tileResolution) {
                    if (node.x == numTiles) {
                        f1 = 0;
                        i1 = 1;
                        if (node.side == 'l' || node.side == 'r') {
                            f3 = 0;
                            i3 = 1;
                        }
                    }
                    if (node.y == numTiles) {
                        f2 = 0;
                        i2 = 1;
                        if (node.side == 'd' || node.side == 'u') {
                            f3 = 0;
                            i3 = 1;
                        }
                    }
                }
                
                vtmp = [           v[0],             v[1],             v[2],
                        v[0]*f1+v[3]*i1,    v[1]*f+v[4]*i,  v[2]*f3+v[5]*i3,
                        v[0]*f1+v[6]*i1,  v[1]*f2+v[7]*i2,  v[2]*f3+v[8]*i3,
                          v[0]*f+v[9]*i, v[1]*f2+v[10]*i2, v[2]*f3+v[11]*i3
                ];
                ntmp = new MultiresNode(vtmp, node.side, node.level + 1, node.x*2, node.y*2, image.fullpath);
                children.push(ntmp);
                if (!(node.x == numTiles && doubleTileSize <= image.tileResolution)) {
                    vtmp = [v[0]*f1+v[3]*i1,    v[1]*f+v[4]*i,  v[2]*f3+v[5]*i3,
                                       v[3],             v[4],             v[5],
                              v[3]*f+v[6]*i,  v[4]*f2+v[7]*i2,  v[5]*f3+v[8]*i3,
                            v[0]*f1+v[6]*i1,  v[1]*f2+v[7]*i2,  v[2]*f3+v[8]*i3
                    ];
                    ntmp = new MultiresNode(vtmp, node.side, node.level + 1, node.x*2+1, node.y*2, image.fullpath);
                    children.push(ntmp);
                }
                if (!(node.x == numTiles && doubleTileSize <= image.tileResolution) &&
                    !(node.y == numTiles && doubleTileSize <= image.tileResolution)) {
                    vtmp = [v[0]*f1+v[6]*i1,  v[1]*f2+v[7]*i2,  v[2]*f3+v[8]*i3,
                              v[3]*f+v[6]*i,  v[4]*f2+v[7]*i2,  v[5]*f3+v[8]*i3,
                                       v[6],             v[7],             v[8],
                            v[9]*f1+v[6]*i1,   v[10]*f+v[7]*i, v[11]*f3+v[8]*i3
                    ];
                    ntmp = new MultiresNode(vtmp, node.side, node.level + 1, node.x*2+1, node.y*2+1, image.fullpath);
                    children.push(ntmp);
                }
                if (!(node.y == numTiles && doubleTileSize <= image.tileResolution)) {
                    vtmp = [  v[0]*f+v[9]*i, v[1]*f2+v[10]*i2, v[2]*f3+v[11]*i3,
                            v[0]*f1+v[6]*i1,  v[1]*f2+v[7]*i2,  v[2]*f3+v[8]*i3,
                            v[9]*f1+v[6]*i1,   v[10]*f+v[7]*i, v[11]*f3+v[8]*i3,
                                       v[9],            v[10],            v[11]
                    ];
                    ntmp = new MultiresNode(vtmp, node.side, node.level + 1, node.x*2, node.y*2+1, image.fullpath);
                    children.push(ntmp);
                }
                for (var j = 0; j < children.length; j++) {
                    testMultiresNode(rotPersp, children[j], pitch, yaw, hfov);
                }
            }
        }
    }
    
    /**
     * Creates cube vertex array.
     * @private
     * @returns {number[]} Cube vertex array.
     */
    function createCube() {
        return [-1,  1, -1,  1,  1, -1,  1, -1, -1, -1, -1, -1, // Front face
                 1,  1,  1, -1,  1,  1, -1, -1,  1,  1, -1,  1, // Back face
                -1,  1,  1,  1,  1,  1,  1,  1, -1, -1,  1, -1, // Up face
                -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1, // Down face
                -1,  1,  1, -1,  1, -1, -1, -1, -1, -1, -1,  1, // Left face
                 1,  1, -1,  1,  1,  1,  1, -1,  1,  1, -1, -1  // Right face
        ];
    }
    
    /**
     * Creates 3x3 identity matrix.
     * @private
     * @returns {number[]} Identity matrix.
     */
    function identityMatrix3() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }
    
    /**
     * Rotates a 3x3 matrix.
     * @private
     * @param {number[]} m - Matrix to rotate.
     * @param {number[]} angle - Angle to rotate by in radians.
     * @param {string} axis - Axis to rotate about (`x`, `y`, or `z`).
     * @returns {number[]} Rotated matrix.
     */
    function rotateMatrix(m, angle, axis) {
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        if (axis == 'x') {
            return [
                m[0], c*m[1] + s*m[2], c*m[2] - s*m[1],
                m[3], c*m[4] + s*m[5], c*m[5] - s*m[4],
                m[6], c*m[7] + s*m[8], c*m[8] - s*m[7]
            ];
        }
        if (axis == 'y') {
            return [
                c*m[0] - s*m[2], m[1], c*m[2] + s*m[0],
                c*m[3] - s*m[5], m[4], c*m[5] + s*m[3],
                c*m[6] - s*m[8], m[7], c*m[8] + s*m[6]
            ];
        }
        if (axis == 'z') {
            return [
                c*m[0] + s*m[1], c*m[1] - s*m[0], m[2],
                c*m[3] + s*m[4], c*m[4] - s*m[3], m[5],
                c*m[6] + s*m[7], c*m[7] - s*m[6], m[8]
            ];
        }
    }
    
    /**
     * Turns a 3x3 matrix into a 4x4 matrix.
     * @private
     * @param {number[]} m - Input matrix.
     * @returns {number[]} Expanded matrix.
     */
    function makeMatrix4(m) {
        return [
            m[0], m[1], m[2],    0,
            m[3], m[4], m[5],    0,
            m[6], m[7], m[8],    0,
               0,    0,    0,    1
        ];
    }
    
    /**
     * Transposes a 4x4 matrix.
     * @private
     * @param {number[]} m - Input matrix.
     * @returns {number[]} Transposed matrix.
     */
    function transposeMatrix4(m) {
        return [
            m[ 0], m[ 4], m[ 8], m[12],
            m[ 1], m[ 5], m[ 9], m[13],
            m[ 2], m[ 6], m[10], m[14],
            m[ 3], m[ 7], m[11], m[15]
        ];
    }
    
    /**
     * Creates a perspective matrix.
     * @private
     * @param {number} hfov - Desired horizontal field of view.
     * @param {number} aspect - Desired aspect ratio.
     * @param {number} znear - Near distance.
     * @param {number} zfar - Far distance.
     * @returns {number[]} Generated perspective matrix.
     */
    function makePersp(hfov, aspect, znear, zfar) {
        var fovy = 2 * Math.atan(Math.tan(hfov/2) * canvas.height / canvas.width);
        var f = 1 / Math.tan(fovy/2);
        return [
            f/aspect,   0,  0,  0,
                   0,   f,  0,  0,
                   0,   0,  (zfar+znear)/(znear-zfar), (2*zfar*znear)/(znear-zfar),
                   0,   0, -1,  0
        ];
    }
    
    /**
     * Processes a loaded texture image into a WebGL texture.
     * @private
     * @param {Image} img - Input image.
     * @param {WebGLTexture} tex - Texture to bind image to.
     */
    function processLoadedTexture(img, tex) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    // Based on http://blog.tojicode.com/2012/03/javascript-memory-optimization-and.html
    var loadTexture = (function() {
        var cacheTop = 4;   // Maximum number of concurrents loads
        var textureImageCache = {};
        var pendingTextureRequests = [];

        function TextureImageLoader() {
            var self = this;
            this.texture = this.callback = null;
            this.image = new Image();
            this.image.crossOrigin = 'anonymous';
            this.image.addEventListener('load', function() {
                processLoadedTexture(self.image, self.texture);
                self.callback(self.texture);
                releaseTextureImageLoader(self);
            });
        };

        TextureImageLoader.prototype.loadTexture = function(src, texture, callback) {
            this.texture = texture;
            this.callback = callback;
            this.image.src = src;
        };

        function PendingTextureRequest(src, texture, callback) {
            this.src = src;
            this.texture = texture;
            this.callback = callback;
        };

        function releaseTextureImageLoader(til) {
            if (pendingTextureRequests.length) {
                var req = pendingTextureRequests.shift();
                til.loadTexture(req.src, req.texture, req.callback);
            } else
                textureImageCache[cacheTop++] = til;
        }

        for (var i = 0; i < cacheTop; i++)
            textureImageCache[i] = new TextureImageLoader();

        return function(src, callback) {
            var texture = gl.createTexture();
            if (cacheTop)
                textureImageCache[--cacheTop].loadTexture(src, texture, callback);
            else
                pendingTextureRequests.push(new PendingTextureRequest(src, texture, callback));
            return texture;
        };
    })();

    /**
     * Loads image and creates texture for a multires node / tile.
     * @private
     * @param {MultiresNode} node - Input node.
     */
    function processNextTile(node) {
        if (!node.texture) {
            loadTexture(encodeURI(node.path + '.' + image.extension), function(texture) {
                node.texture = texture;
                node.textureLoaded = true;
            });
        }
    }
    
    /**
     * Finds and applies optimal multires zoom level.
     * @private
     * @param {number} hfov - Horizontal field of view to check at.
     */
    function checkZoom(hfov) {
        // Find optimal level
        var newLevel = 1;
        while ( newLevel < image.maxLevel &&
            canvas.width > image.tileResolution *
            Math.pow(2, newLevel - 1) * Math.tan(hfov / 2) * 0.707 ) {
            newLevel++;
        }
        
        // Apply change
        program.level = newLevel;
    }
    
    /**
     * Rotates perspective matrix.
     * @private
     * @param {number[]} p - Perspective matrix.
     * @param {number[]} r - Rotation matrix.
     * @returns {number[]} Rotated matrix.
     */
    function rotatePersp(p, r) {
        return [
            p[ 0]*r[0], p[ 0]*r[1], p[ 0]*r[ 2],     0,
            p[ 5]*r[4], p[ 5]*r[5], p[ 5]*r[ 6],     0,
            p[10]*r[8], p[10]*r[9], p[10]*r[10], p[11],
                 -r[8],      -r[9],      -r[10],     0
        ];
    }
    
    /**
     * Applies rotated perspective matrix to a 3-vector
     * (last element is inverted).
     * @private
     * @param {number[]} m - Rotated perspective matrix.
     * @param {number[]} v - Input 3-vector.
     * @returns {number[]} Resulting 4-vector.
     */
    function applyRotPerspToVec(m, v) {
        return [
                    m[ 0]*v[0] + m[ 1]*v[1] + m[ 2]*v[2],
                    m[ 4]*v[0] + m[ 5]*v[1] + m[ 6]*v[2],
            m[11] + m[ 8]*v[0] + m[ 9]*v[1] + m[10]*v[2],
                 1/(m[12]*v[0] + m[13]*v[1] + m[14]*v[2])
        ];
    }
    
    /**
     * Checks if a vertex is visible.
     * @private
     * @param {number[]} m - Rotated perspective matrix.
     * @param {number[]} v - Input vertex.
     * @returns {number} 1 or -1 if the vertex is or is not visible,
     *      respectively.
     */
    function checkInView(m, v) {
        var vpp = applyRotPerspToVec(m, v);
        var winX = vpp[0]*vpp[3];
        var winY = vpp[1]*vpp[3];
        var winZ = vpp[2]*vpp[3];
        var ret = [0, 0, 0];
        
        if ( winX < -1 )
            ret[0] = -1;
        if ( winX > 1 )
            ret[0] = 1;
        if ( winY < -1 )
            ret[1] = -1;
        if ( winY > 1 )
            ret[1] = 1;
        if ( winZ < -1 || winZ > 1 )
            ret[2] = 1;
        return ret;
    }
    
    /**
     * Checks if a square (tile) is visible.
     * @private
     * @param {number[]} m - Rotated perspective matrix.
     * @param {number[]} v - Square's vertex array.
     * @returns {boolean} Whether or not the square is visible.
     */
    function checkSquareInView(m, v) {
        var check1 = checkInView(m, v.slice(0, 3));
        var check2 = checkInView(m, v.slice(3, 6));
        var check3 = checkInView(m, v.slice(6, 9));
        var check4 = checkInView(m, v.slice(9, 12));
        var testX = check1[0] + check2[0] + check3[0] + check4[0];
        if ( testX == -4 || testX == 4 )
            return false;
        var testY = check1[1] + check2[1] + check3[1] + check4[1];
        if ( testY == -4 || testY == 4 )
            return false;
        var testZ = check1[2] + check2[2] + check3[2] + check4[2];
        return testZ != 4;
        

    }
}

// Vertex shader for equirectangular and cube
var v = [
'attribute vec2 a_texCoord;',
'varying vec2 v_texCoord;',

'void main() {',
    // Set position
    'gl_Position = vec4(a_texCoord, 0.0, 1.0);',
    
    // Pass the coordinates to the fragment shader
    'v_texCoord = a_texCoord;',
'}'
].join('');

// Vertex shader for multires
var vMulti = [
'attribute vec3 a_vertCoord;',
'attribute vec2 a_texCoord;',

'uniform mat4 u_cubeMatrix;',
'uniform mat4 u_perspMatrix;',

'varying mediump vec2 v_texCoord;',

'void main(void) {',
    // Set position
    'gl_Position = u_perspMatrix * u_cubeMatrix * vec4(a_vertCoord, 1.0);',
    
    // Pass the coordinates to the fragment shader
    'v_texCoord = a_texCoord;',
'}'
].join('');

// Fragment shader
var fragCube = [
'precision mediump float;',

'uniform float u_aspectRatio;',
'uniform float u_psi;',
'uniform float u_theta;',
'uniform float u_f;',
'uniform float u_h;',
'uniform float u_v;',
'uniform float u_vo;',
'uniform float u_rot;',

'const float PI = 3.14159265358979323846264;',

// Texture
'uniform samplerCube u_image;',

// Coordinates passed in from vertex shader
'varying vec2 v_texCoord;',

'void main() {',
    // Find the vector of focal point to view plane
    'vec3 planePos = vec3(v_texCoord.xy, 0.0);',
    'planePos.x *= u_aspectRatio;',
    'float sinrot = sin(u_rot);',
    'float cosrot = cos(u_rot);',
    'vec3 rotPos = vec3(planePos.x * cosrot - planePos.y * sinrot, planePos.x * sinrot + planePos.y * cosrot, 0.0);',
    'vec3 viewVector = rotPos - vec3(0.0, 0.0, -u_f);',

    // Rotate vector for psi (yaw) and theta (pitch)
    'float sinpsi = sin(-u_psi);',
    'float cospsi = cos(-u_psi);',
    'float sintheta = sin(u_theta);',
    'float costheta = cos(u_theta);',
    
    // Now apply the rotations
    'vec3 viewVectorTheta = viewVector;',
    'viewVectorTheta.z = viewVector.z * costheta - viewVector.y * sintheta;',
    'viewVectorTheta.y = viewVector.z * sintheta + viewVector.y * costheta;',
    'vec3 viewVectorPsi = viewVectorTheta;',
    'viewVectorPsi.x = viewVectorTheta.x * cospsi - viewVectorTheta.z * sinpsi;',
    'viewVectorPsi.z = viewVectorTheta.x * sinpsi + viewVectorTheta.z * cospsi;',

    // Look up color from texture
    'gl_FragColor = textureCube(u_image, viewVectorPsi);',
'}'
].join('\n');

// Fragment shader
var fragEquirectangular = [
'precision mediump float;',

'uniform float u_aspectRatio;',
'uniform float u_psi;',
'uniform float u_theta;',
'uniform float u_f;',
'uniform float u_h;',
'uniform float u_v;',
'uniform float u_vo;',
'uniform float u_rot;',

'const float PI = 3.14159265358979323846264;',

// Texture
'uniform sampler2D u_image;',

// Coordinates passed in from vertex shader
'varying vec2 v_texCoord;',

'void main() {',
    // Map canvas/camera to sphere
    'float x = v_texCoord.x * u_aspectRatio;',
    'float y = v_texCoord.y;',
    'float sinrot = sin(u_rot);',
    'float cosrot = cos(u_rot);',
    'float rot_x = x * cosrot - y * sinrot;',
    'float rot_y = x * sinrot + y * cosrot;',
    'float sintheta = sin(u_theta);',
    'float costheta = cos(u_theta);',
    'float a = u_f * costheta - rot_y * sintheta;',
    'float root = sqrt(rot_x * rot_x + a * a);',
    'float lambda = atan(rot_x / root, a / root) + u_psi;',
    'float phi = atan((rot_y * costheta + u_f * sintheta) / root);',

    // Wrap image
    'if(lambda > PI)',
        'lambda = lambda - PI * 2.0;',
    'if(lambda < -PI)',
       'lambda = lambda + PI * 2.0;',
    
    // Map texture to sphere
    'vec2 coord = vec2(lambda / PI, phi / (PI / 2.0));',
    
    // Look up color from texture
    // Map from [-1,1] to [0,1] and flip y-axis
    'if(coord.x < -u_h || coord.x > u_h || coord.y < -u_v + u_vo || coord.y > u_v + u_vo)',
        'gl_FragColor = vec4(0, 0, 0, 1.0);',
    'else',
        'gl_FragColor = texture2D(u_image, vec2((coord.x + u_h) / (u_h * 2.0), (-coord.y + u_v + u_vo) / (u_v * 2.0)));',
'}'
].join('\n');

// Fragment shader
var fragMulti = [
'varying mediump vec2 v_texCoord;',
'uniform sampler2D u_sampler;',
//'uniform mediump vec4 u_color;',

'void main(void) {',
    // Look up color from texture
    'gl_FragColor = texture2D(u_sampler, v_texCoord);',
//    'gl_FragColor = u_color;',
'}'
].join('');

return {
    renderer: function(container, image, imagetype, dynamic) {
        return new Renderer(container, image, imagetype, dynamic);
    }
};

})(window, document);
