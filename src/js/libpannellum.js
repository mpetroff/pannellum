/*
 * libpannellum - A WebGL and CSS 3D transform based Panorama Renderer
 * Copyright (c) 2012-2014 Matthew Petroff
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
/* Image Type argument can be that of "equirectangular" or "cubemap".
 * If "cubemap" is used, the image argument should be an array of images
 * instead of a single image.  They should be the order of:
 * +z, +x, -z, -x, +y, -y.
 */
function Renderer(container, image, imageType) {
    this.canvas = container.querySelector('#canvas');
    this.image = image;

    // Default argument for image type
    this.imageType = 'equirectangular';
    if(typeof imageType != 'undefined'){
        this.imageType = imageType;
    }

    var program, gl;

    this.init = function(haov, vaov, voffset) {
        // Enable WebGL on canvas
        gl = this.canvas.getContext('experimental-webgl', {alpha: false, depth: false});
        
        // If there is no WebGL, fall back to CSS 3D transform renderer.
        if (!gl && this.imageType == 'multires') {
            // Initialize renderer
            container.className = 'viewport';
            this.world = container.querySelector('.world');
            this.world.style.display = 'block';
            
            // Add images
            var path = this.image.basePath + '/fallback/';
            this.world.querySelector('.fface').style.backgroundImage = 'url("' + path + 'f.' + this.image.extension + '")';
            this.world.querySelector('.bface').style.backgroundImage = 'url("' + path + 'b.' + this.image.extension + '")';
            this.world.querySelector('.uface').style.backgroundImage = 'url("' + path + 'u.' + this.image.extension + '")';
            this.world.querySelector('.dface').style.backgroundImage = 'url("' + path + 'd.' + this.image.extension + '")';
            this.world.querySelector('.lface').style.backgroundImage = 'url("' + path + 'l.' + this.image.extension + '")';
            this.world.querySelector('.rface').style.backgroundImage = 'url("' + path + 'r.' + this.image.extension + '")';
            
            return;
        }
        this.image.path = this.image.basePath + this.image.path;
        
        // Set 2d texture binding
        var glBindType = gl.TEXTURE_2D;

        // Create viewport for entire canvas
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);   

        // Create vertex shader
        var vs = gl.createShader(gl.VERTEX_SHADER);
        var vertexSrc = v;
        if(this.imageType == 'multires') {
            vertexSrc = vMulti;
        }
        gl.shaderSource(vs, vertexSrc);
        gl.compileShader(vs);
        
        // Create fragment shader
        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        var fragmentSrc = fragEquirectangular;
        if(this.imageType == 'cubemap') {
            glBindType = gl.TEXTURE_CUBE_MAP;
            fragmentSrc = fragCube;
        } else if (this.imageType == 'multires') {
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
        
        // Look up texture coordinates location
        program.texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
        gl.enableVertexAttribArray(program.texCoordLocation);
        
        if(this.imageType != 'multires') {
            // Provide texture coordinates for rectangle
            program.texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, program.texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,1,1,1,-1,-1,1,1,-1,-1,-1]), gl.STATIC_DRAW);
            gl.vertexAttribPointer(program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
            
            // Pass aspect ratio
            program.aspectRatio = gl.getUniformLocation(program, 'u_aspectRatio');
            gl.uniform1f(program.aspectRatio, this.canvas.width / this.canvas.height);
            
            // Locate psi, theta, focal length, horizontal extent, vertical extent, and vertical offset
            program.psi = gl.getUniformLocation(program, 'u_psi');
            program.theta = gl.getUniformLocation(program, 'u_theta');
            program.f = gl.getUniformLocation(program, 'u_f');
            program.h = gl.getUniformLocation(program, 'u_h');
            program.v = gl.getUniformLocation(program, 'u_v');
            program.vo = gl.getUniformLocation(program, 'u_vo');
            
            // Pass horizontal extent, vertical extent, and vertical offset
            gl.uniform1f(program.h, haov / (Math.PI * 2.0));
            gl.uniform1f(program.v, vaov / Math.PI);
            gl.uniform1f(program.vo, voffset / Math.PI);
            
            // Create texture
            program.texture = gl.createTexture();
            gl.bindTexture(glBindType, program.texture);
            
            // Upload images to texture depending on type
            if(this.imageType == "cubemap") {
                // Load all six sides of the cube map
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image[1]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image[3]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image[4]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image[5]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image[0]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image[2]);
            } else {
                // Upload image to the texture
                gl.texImage2D(glBindType, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image);
            }
            
            // Set parameters for rendering any size
            gl.texParameteri(glBindType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(glBindType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(glBindType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(glBindType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            
        } else {
            // Look up vertex coordinates location
            program.vertPosLocation = gl.getAttribLocation(program, "a_vertCoord");
            gl.enableVertexAttribArray(program.vertPosLocation);
            
            // Create buffers
            program.cubeVertBuf = gl.createBuffer();
            program.cubeVertTexCoordBuf = gl.createBuffer();
            program.cubeVertIndBuf = gl.createBuffer();
            
            // Bind texture coordinate buffer and pass coordinates to WebGL
            gl.bindBuffer(gl.ARRAY_BUFFER, program.cubeVertTexCoordBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,1,0,1,1,0,1]), gl.STATIC_DRAW);
            
            // Bind square index buffer and pass indicies to WebGL
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program.cubeVertIndBuf);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
            
            // Find uniforms
            program.perspUniform = gl.getUniformLocation(program, "u_perspMatrix");
            program.cubeUniform = gl.getUniformLocation(program, "u_cubeMatrix");
            //program.colorUniform = gl.getUniformLocation(program, "u_color");
            
            program.level = -1;
            
            program.currentNodes = [];
            program.nodeCache = [];
            program.nodeCacheTimestamp = 0;
        }
    }

    this.render = function(pitch, yaw, hfov) {
        // If no WebGL
        if (!gl && this.imageType == 'multires') {
            var transform = 'translate3d(0px, 0px, 700px) rotateX(' + pitch + 'rad) rotateY(' + yaw + 'rad) rotateZ(0rad)';
            this.world.style.webkitTransform = transform;
            this.world.style.transform = transform;
            return;
        }
        
        if(this.imageType != 'multires') {
            // Calculate focal length from horizontal angle of view
            var focal = 1 / Math.tan(hfov / 2);
            
            // Pass psi, theta, and focal length
            gl.uniform1f(program.psi, yaw);
            gl.uniform1f(program.theta, pitch);
            gl.uniform1f(program.f, focal);
            
            // Draw using current buffer
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        } else {
            var fov = 2 * Math.atan(Math.tan(hfov / 2) * this.canvas.width / this.canvas.height);
            
            // Create perspective matrix
            var perspMatrix = this.makePersp(fov, this.canvas.width / this.canvas.height, 0.1, 100.0);
            
            // Find correct zoom level
            this.checkZoom(fov);
            
            // Create rotation matrix
            var matrix = this.identityMatrix3();
            matrix = this.rotateMatrix(matrix, -pitch, 'x');
            matrix = this.rotateMatrix(matrix, yaw, 'y');
            matrix = this.makeMatrix4(matrix);
            
            // Set matrix uniforms
            gl.uniformMatrix4fv(program.perspUniform, false, new Float32Array(this.transposeMatrix4(perspMatrix)));
            gl.uniformMatrix4fv(program.cubeUniform, false, new Float32Array(this.transposeMatrix4(matrix)));
            
            // Find current nodes
            var rotPersp = this.rotatePersp(perspMatrix, matrix);
            program.nodeCache.sort(this.multiresNodeSort);
            if (program.nodeCache.length > 200
                && program.nodeCache.length > program.currentNodes.length + 50) {
                // Remove older nodes from cache
                program.nodeCache.splice(200, program.nodeCache.length - 200);
            }
            program.currentNodes = [];
            var vertices = this.createCube();
            var sides = ['f', 'b', 'u', 'd', 'l', 'r'];
            for ( var s = 0; s < 6; s++ ) {
                var vtmp = vertices.slice(s * 12, s * 12 + 12)
                var ntmp = new MultiresNode(vtmp, sides[s], 1, 0, 0, this.image.path);
                this.testMultiresNode(rotPersp, ntmp, pitch, yaw, fov);
            }
            program.currentNodes.sort(this.multiresNodeRenderSort);
            // Only process one tile per frame to improve responsiveness
            for ( var i = 0; i < program.currentNodes.length; i++ ) {
                if (!program.currentNodes[i].texture) {
                    setTimeout(this.processNextTile(program.currentNodes[i], pitch, yaw, fov), 0);
                    break;
                }
            }
            
            // Draw tiles
            this.multiresDraw()
        }
    }
    
    this.isLoading = function() {
        if (gl && this.imageType == 'multires') {
            for ( var i = 0; i < program.currentNodes.length; i++ ) {
                if (!program.currentNodes[i].textureLoaded) {
                    return true;
                }
            }
        }
        return false;
    }
    
    this.multiresNodeSort = function(a, b) {
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
    
    this.multiresNodeRenderSort = function(a, b) {
        // Lower zoom levels first
        if (a.level != b.level) {
            return a.level - b.level;
        }
        
        // Lower distance from center first
        return a.diff - b.diff;
    }
    
    this.multiresDraw = function() {
        if (!program.drawInProgress) {
            program.drawInProgress = true;
            for ( var i = 0; i < program.currentNodes.length; i++ ) {
                if (program.currentNodes[i].textureLoaded) {
                    //var color = program.currentNodes[i].color;
                    //gl.uniform4f(program.colorUniform, color[0], color[1], color[2], 1.0);
                    
                    // Bind vertex buffer and pass vertices to WebGL
                    gl.bindBuffer(gl.ARRAY_BUFFER, program.cubeVertBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(program.currentNodes[i].vertices), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(program.vertPosLocation, 3, gl.FLOAT, false, 0, 0);
                    
                    // Prep for texture
                    gl.bindBuffer(gl.ARRAY_BUFFER, program.cubeVertTexCoordBuf);
                    gl.vertexAttribPointer(program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
                    
                    // Bind texture and draw tile
                    gl.bindTexture(gl.TEXTURE_2D, program.currentNodes[i].texture); // Bind program.currentNodes[i].texture to TEXTURE0
                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                }
            }
        }
        program.drawInProgress = false;
    }

    function MultiresNode(vertices, side, level, x, y, path) {
        this.vertices = vertices;
        this.side = side;
        this.level = level;
        this.x = x;
        this.y = y;
        this.path = path.replace('%s',side).replace('%l',level).replace('%x',x).replace('%y',y);
    }

    this.testMultiresNode = function(rotPersp, node, pitch, yaw, hfov) {
        if (this.checkSquareInView(rotPersp, node.vertices)) {
            // Calculate central angle between center of view and center of tile
            var v = node.vertices;
            var x = (v[0] + v[3] + v[6] + v[ 9]) / 4;
            var y = (v[1] + v[4] + v[7] + v[10]) / 4;
            var z = (v[2] + v[5] + v[8] + v[11]) / 4;
            var r = Math.sqrt(x*x + y*y + z*z);
            var theta = Math.asin(z / r);
            var phi = Math.atan2(y, x);
            var ydiff = phi - yaw;
            ydiff += (ydiff > Math.PI) ? -2 * Math.PI : (ydiff < -Math.PI) ? 2 * Math.PI : 0;
            ydiff = Math.abs(ydiff);
            node.diff = Math.acos(Math.sin(pitch) * Math.sin(theta) + Math.cos(pitch) * Math.cos(theta) * Math.cos(ydiff));
            
            // Add node to current nodes and load texture if needed
            var inCurrent = false;
            for (var i = 0; i < program.nodeCache.length; i++) {
                if (program.nodeCache[i].path == node.path) {
                    inCurrent = true;
                    program.nodeCache[i].timestamp = program.nodeCacheTimestamp++;
                    program.nodeCache[i].diff = node.diff;
                    program.currentNodes.push(program.nodeCache[i]);
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
                var cubeSize = this.image.cubeResolution / Math.pow(2, this.image.maxLevel - node.level);
                var numTiles = Math.ceil(cubeSize / this.image.tileResolution) - 1;
                doubleTileSize = cubeSize % this.image.tileResolution * 2;
                var lastTileSize = (cubeSize * 2) % this.image.tileResolution;
                if (lastTileSize == 0) {
                    lastTileSize = this.image.tileResolution;
                }
                if (doubleTileSize == 0) {
                    doubleTileSize = this.image.tileResolution * 2;
                }
                var f = 0.5;
                if (node.x == numTiles || node.y == numTiles) {
                    f = 1.0 - this.image.tileResolution / (this.image.tileResolution + lastTileSize);
                }
                var i = 1.0 - f;
                var children = [];
                var v = node.vertices;
                var vtmp, ntmp;
                var f1 = f, f2 = f, f3 = f, i1 = i, i2 = i, i3 = i;
                // Handle non-symmetric tiles
                if (((node.x == numTiles && node.y != numTiles) || (node.x != numTiles && node.y == numTiles)) && lastTileSize < this.image.tileResolution) {
                    if (node.x == numTiles) {
                        f2 = 0.5;
                        i2 = 0.5;
                        if (node.side == 'd' || node.side == 'u') {
                            f3 = 0.5;
                            i3 = 0.5;
                        }
                    } else {
                        f1 = 0.5;
                        i1 = 0.5;
                        if (node.side == 'l' || node.side == 'r') {
                            f3 = 0.5;
                            i3 = 0.5;
                        }
                    }
                }
                // Handle small tiles that have fewer than four children
                if (doubleTileSize < this.image.tileResolution) {
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
                ntmp = new MultiresNode(vtmp, node.side, node.level + 1, node.x*2, node.y*2, this.image.path);
                children.push(ntmp);
                if (!(node.x == numTiles && doubleTileSize < this.image.tileResolution)) {
                    vtmp = [v[0]*f1+v[3]*i1,    v[1]*f+v[4]*i,  v[2]*f3+v[5]*i3,
                                       v[3],             v[4],             v[5],
                              v[3]*f+v[6]*i,  v[4]*f2+v[7]*i2,  v[5]*f3+v[8]*i3,
                            v[0]*f1+v[6]*i1,  v[1]*f2+v[7]*i2,  v[2]*f3+v[8]*i3
                    ];
                    ntmp = new MultiresNode(vtmp, node.side, node.level + 1, node.x*2+1, node.y*2, this.image.path);
                    children.push(ntmp);
                }
                if (!(node.x == numTiles && doubleTileSize < this.image.tileResolution)
                    && !(node.y == numTiles && doubleTileSize < this.image.tileResolution)) {
                    vtmp = [v[0]*f1+v[6]*i1,  v[1]*f2+v[7]*i2,  v[2]*f3+v[8]*i3,
                              v[3]*f+v[6]*i,  v[4]*f2+v[7]*i2,  v[5]*f3+v[8]*i3,
                                       v[6],             v[7],             v[8],
                            v[9]*f1+v[6]*i1,   v[10]*f+v[7]*i, v[11]*f3+v[8]*i3
                    ];
                    ntmp = new MultiresNode(vtmp, node.side, node.level + 1, node.x*2+1, node.y*2+1, this.image.path);
                    children.push(ntmp);
                }
                if (!(node.y == numTiles && doubleTileSize < this.image.tileResolution)) {
                    vtmp = [  v[0]*f+v[9]*i, v[1]*f2+v[10]*i2, v[2]*f3+v[11]*i3,
                            v[0]*f1+v[6]*i1,  v[1]*f2+v[7]*i2,  v[2]*f3+v[8]*i3,
                            v[9]*f1+v[6]*i1,   v[10]*f+v[7]*i, v[11]*f3+v[8]*i3,
                                       v[9],            v[10],            v[11]
                    ];
                    ntmp = new MultiresNode(vtmp, node.side, node.level + 1, node.x*2, node.y*2+1, this.image.path);
                    children.push(ntmp);
                }
                for (var j = 0; j < children.length; j++) {
                    this.testMultiresNode(rotPersp, children[j], pitch, yaw, hfov);
                }
            }
        }
    }

    this.setImage = function(image) {
        this.image = image;
        this.init();
    }
    
    this.setCanvas = function(canvas) {
        this.canvas = canvas;
        this.init();
    }
    
    this.createCube = function() {
        return [-1,  1, -1,  1,  1, -1,  1, -1, -1, -1, -1, -1, // Front face
                 1,  1,  1, -1,  1,  1, -1, -1,  1,  1, -1,  1, // Back face
                -1,  1,  1,  1,  1,  1,  1,  1, -1, -1,  1, -1, // Up face
                -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1, // Down face
                -1,  1,  1, -1,  1, -1, -1, -1, -1, -1, -1,  1, // Left face
                 1,  1, -1,  1,  1,  1,  1, -1,  1,  1, -1, -1  // Right face
        ];
    }
    
    this.identityMatrix3 = function() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }
    
    // angle in radians
    this.rotateMatrix = function(m, angle, axis) {
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        if ( axis == 'x' ) {
            return [
                m[0], c*m[1] + s*m[2], c*m[2] - s*m[1],
                m[3], c*m[4] + s*m[5], c*m[5] - s*m[4],
                m[6], c*m[7] + s*m[8], c*m[8] - s*m[7]
            ];
        }
        if ( axis == 'y' ) {
            return [
                c*m[0] - s*m[2], m[1], c*m[2] + s*m[0],
                c*m[3] - s*m[5], m[4], c*m[5] + s*m[3],
                c*m[6] - s*m[8], m[7], c*m[8] + s*m[6]
            ];
        }
    }
    
    this.makeMatrix4 = function(m) {
        return [
            m[0], m[1], m[2],    0,
            m[3], m[4], m[5],    0,
            m[6], m[7], m[8],    0,
               0,    0,    0,    1
        ];
    }
    
    this.transposeMatrix4 = function(m) {
        return [
            m[ 0], m[ 4], m[ 8], m[12],
            m[ 1], m[ 5], m[ 9], m[13],
            m[ 2], m[ 6], m[10], m[14],
            m[ 3], m[ 7], m[11], m[15]
        ]
    }
    
    this.makePersp = function(hfov, aspect, znear, zfar) {
        var fovy = 2 * Math.atan(Math.tan(hfov/2) * this.canvas.height / this.canvas.width);
        var f = 1 / Math.tan(fovy/2);
        return [
            f/aspect,   0,  0,  0,
                   0,   f,  0,  0,
                   0,   0,  (zfar+znear)/(znear-zfar), (2*zfar*znear)/(znear-zfar),
                   0,   0, -1,  0
        ];
    }
    
    this.processLoadedTexture = function(img, tex) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    this.processNextTile = function(node, pitch, yaw, hfov) {
        if (!node.texture) {
        node.texture = gl.createTexture();
        node.image = new Image();
        var self = this;
        node.image.onload = function() {
            self.processLoadedTexture(node.image, node.texture);
            node.textureLoaded = true;
        }
        node.image.src = node.path + '.' + this.image.extension;
        }
    }
    
    this.checkZoom = function(hfov) {
        // Focal length
        var f = 1 / Math.tan(hfov);
        
        // Keep in bounds
        if (f < 0.00001)
            f = 0.00001;
        
        // Find optimal level
        var newLevel = 1;
        while ( this.canvas.width > this.image.cubeResolution
            / Math.pow(2, this.image.maxLevel - newLevel)
            * hfov / (Math.PI / 2) * 0.9 && newLevel < this.image.maxLevel ) {
            newLevel++;
        }
        
        // Apply change
        program.level = newLevel;
    }
    
    // perspective matrix, rotation matrix
    this.rotatePersp = function(p, r) {
        return [
            p[ 0]*r[0], p[ 0]*r[1], p[ 0]*r[ 2],     0,
            p[ 5]*r[4], p[ 5]*r[5], p[ 5]*r[ 6],     0,
            p[10]*r[8], p[10]*r[9], p[10]*r[10], p[11],
                 -r[8],      -r[9],      -r[10],     0
        ];
    }
    
    // rotated perspective matrix, vec3
    this.applyRotPerspToVec = function(m, v) {
        return [
                    m[ 0]*v[0] + m[ 1]*v[1] + m[ 2]*v[2],
                    m[ 4]*v[0] + m[ 5]*v[1] + m[ 6]*v[2],
            m[11] + m[ 8]*v[0] + m[ 9]*v[1] + m[10]*v[2],
                    m[12]*v[0] + m[13]*v[1] + m[14]*v[2]
        ];
    }
    
    this.checkInView = function(m, v) {
        var vpp = this.applyRotPerspToVec(m, v);
        var winX = ( vpp[0]/vpp[3] + 1 ) / 2;
        var winY = ( vpp[1]/vpp[3] + 1 ) / 2;
        var winZ = ( vpp[2]/vpp[3] + 1 ) / 2;
        var ret = [0, 0, 0];
        
        if ( winX < 0 )
            ret[0] = -1;
        if ( winX > 1 )
            ret[0] = 1;
        if ( winY < 0 )
            ret[1] = -1;
        if ( winY > 1 )
            ret[1] = 1;
        if ( winZ < 0 || winZ > 1 )
            ret[2] = 1;
        return ret;
    }
    
    this.checkSquareInView = function(m, v) {
        var check1 = this.checkInView(m, v.slice(0, 3));
        var check2 = this.checkInView(m, v.slice(3, 6));
        var check3 = this.checkInView(m, v.slice(6, 9));
        var check4 = this.checkInView(m, v.slice(9, 12));
        var testX = check1[0] + check2[0] + check3[0] + check4[0];
        var testY = check1[1] + check2[1] + check3[1] + check4[1];
        var testZ = check1[2] + check2[2] + check3[2] + check4[2];
        if ( testX == -4 || testX == 4 || testY == -4 || testY == 4 || testZ == 4 )
            return false;
        
        return true;
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

'const float PI = 3.14159265358979323846264;',

// Texture
'uniform samplerCube u_image;',

// Coordinates passed in from vertex shader
'varying vec2 v_texCoord;',

'void main() {',
    // Find the vector of focal point to view plane
    'vec3 planePos = vec3(v_texCoord.xy, 0.0);',
    'planePos.x *= u_aspectRatio;',
    'vec3 viewVector = planePos - vec3(0.0,0.0,-u_f);',

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

'const float PI = 3.14159265358979323846264;',

// Texture
'uniform sampler2D u_image;',

// Coordinates passed in from vertex shader
'varying vec2 v_texCoord;',

'void main() {',
    // Map canvas/camera to sphere
    'float x = v_texCoord.x * u_aspectRatio;',
    'float y = v_texCoord.y;',
    'float sintheta = sin(u_theta);',
    'float costheta = cos(u_theta);',
    'float a = u_f * costheta - y * sintheta;',
    'float root = sqrt(x * x + a * a);',
    'float lambda = atan(x / root, a / root) + u_psi;',
    'float phi = atan((y * costheta + u_f * sintheta) / root);',

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
    renderer: function(canvas, image, imagetype) {
        return new Renderer(canvas, image, imagetype);
    }
}

})(window, document);
