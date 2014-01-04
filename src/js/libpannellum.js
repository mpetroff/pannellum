/*
 * libpannellum - An WebGL based Panorama Renderer
 * Copyright (c) 2012-2013 Matthew Petroff
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
function Renderer(canvas, image, imageType) {
    this.canvas = canvas;
    this.image = image;

    // Default argument for image type
    this.imageType = 'equirectangular';
    if(typeof imageType != 'undefined'){
        this.imageType = imageType;
    }

    var program, gl;

    this.init = function(haov, vaov, voffset) {
        // Enable WebGL on canvas
        gl = this.canvas.getContext('experimental-webgl');
        var glBindType = gl.TEXTURE_2D;

        // Create viewport for entire canvas and clear canvas
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);   
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

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
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image[1]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image[3]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image[4]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image[5]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image[0]);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image[2]);
            } else {
                // Upload image to the texture
                gl.texImage2D(glBindType, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
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
            
            program.subdivisions = -1;
        }
    }

    this.render = function(pitch, yaw, hfov) {
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
            // Clear canvas
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            // Create perspective matrix
            var perspMatrix = this.makePersp(hfov, this.canvas.width / this.canvas.height, 0.1, 100.0);
            
            // Find correct zoom level
            this.checkZoom(hfov);
            
            // Create rotation matrix
            var matrix = this.identityMatrix3();
            matrix = this.rotateMatrix(matrix, -pitch, 'x');
            matrix = this.rotateMatrix(matrix, yaw, 'y');
            matrix = this.makeMatrix4(matrix);
            
            // Bind square verticies
            gl.bindBuffer(gl.ARRAY_BUFFER, program.cubeVertBuf);
            gl.vertexAttribPointer(program.vertPosLocation, 3, gl.FLOAT, false, 0, 0);
            
            // Bind square indicies
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program.cubeVertIndBuf);
            
            // Set matrix uniforms
            var perspUniform = gl.getUniformLocation(program, "u_perspMatrix");
            gl.uniformMatrix4fv(perspUniform, false, new Float32Array(this.transposeMatrix4(perspMatrix)));
            var cubeUniform = gl.getUniformLocation(program, "u_cubeMatrix");
            gl.uniformMatrix4fv(cubeUniform, false, new Float32Array(this.transposeMatrix4(matrix)));
            
            // Prep for texture
            gl.bindBuffer(gl.ARRAY_BUFFER, program.cubeVertTexCoordBuf);
            gl.vertexAttribPointer(program.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE0);  // Make TEXTURE0 the active texture
            gl.uniform1i(gl.getUniformLocation(program, "u_sampler"), 0);   // Tell shader to use TEXTURE0
            
            var rotPersp = this.rotatePersp(perspMatrix, matrix);
            // Draw cube
            var sides = ['f', 'b', 'u', 'd', 'l', 'r'];
            // side
            for ( var s = 0; s < 6; s++ ) {
                // row
                for ( var i = 0; i < program.subdivisions; i++ ) {
                    // column
                    for ( var j = 0; j < program.subdivisions; j++ ) {
                        var index = s*program.subdivisions*program.subdivisions + i*program.subdivisions + j;
                        if(this.checkSquareInView(rotPersp, program.vertices.slice(index * 12, index * 12 + 12))) {
                            if (!program.texArray[program.subdivisions][index]) {
                                this.processNextTile(index, pitch, yaw, hfov);
                                return;
                            } else if (!program.texLoadedArray[program.subdivisions][index]) {
                                return;
                            }
                            // Bind texture and draw tile
                            gl.bindTexture(gl.TEXTURE_2D, program.texArray[program.subdivisions][index]); // Bind program.texArray[program.subdivisions][index] to TEXTURE0
                            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, index * 12);
                        }
                    }
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
    
    this.initBuffers = function() {
        // Create and bind vertex buffer
        program.cubeVertBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, program.cubeVertBuf);
        
        // Create cube vertices
        program.vertices = this.createCube(program.subdivisions);
        
        // Pass vertices to WebGL
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(program.vertices), gl.STATIC_DRAW);
        
        // Create and bind texture buffer
        program.cubeVertTexCoordBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, program.cubeVertTexCoordBuf);
        
        // Generate texture coordinates and pass to WebGL
        var texCoords = this.createCubeVertexTextureCoords(program.subdivisions);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
        
        // Create and bind square index buffer
        program.cubeVertIndBuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program.cubeVertIndBuf);
        
        // Generate indicies and pass to WebGL
        var cubeVertInd = this.createCubeVertexIndices(program.subdivisions);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertInd), gl.STATIC_DRAW);
    }
    
    this.createCube = function(subdiv) {
        var increment = 2.0 / subdiv;
        
        var v = [];
        // Front face
        for (var j = 1.0, k = 0; k < subdiv; j -= increment, k++ ) {
            for (var i = -1.0, l = 0; l < subdiv; i += increment, l++) {
                v[v.length] = i;
                v[v.length] = j;
                v[v.length] = -1.0;
                v[v.length] = i + increment;
                v[v.length] = j;
                v[v.length] = -1.0;
                v[v.length] = i + increment;
                v[v.length] = j - increment;
                v[v.length] = -1.0;
                v[v.length] = i;
                v[v.length] = j - increment;
                v[v.length] = -1.0;
            }
        }
        
        // Back face
        for (var j = 1.0, k = 0; k < subdiv; j -= increment, k++ ) {
            for (var i = 1.0, l = 0; l < subdiv; i -= increment, l++ ) {
                v[v.length] = i;
                v[v.length] = j;
                v[v.length] = 1.0;
                v[v.length] = i - increment;
                v[v.length] = j;
                v[v.length] = 1.0;
                v[v.length] = i - increment;
                v[v.length] = j - increment;
                v[v.length] = 1.0;
                v[v.length] = i;
                v[v.length] = j - increment;
                v[v.length] = 1.0;
            }
        }
        
        // Up face
        for (var j = 1.0, k = 0; k < subdiv; j -= increment, k++ ) {
            for (var i = -1.0, l = 0; l < subdiv; i += increment, l++ ) {
                v[v.length] = i;
                v[v.length] = 1.0;
                v[v.length] = j;
                v[v.length] = i + increment;
                v[v.length] = 1.0;
                v[v.length] = j;
                v[v.length] = i + increment;
                v[v.length] = 1.0;
                v[v.length] = j - increment;
                v[v.length] = i;
                v[v.length] = 1.0;
                v[v.length] = j - increment;
            }
        }
        
        // Down face
        for (var j = -1.0, k = 0; k < subdiv; j += increment, k++ ) {
            for (var i = -1.0, l = 0; l < subdiv; i += increment, l++ ) {
                v[v.length] = i;
                v[v.length] = -1.0;
                v[v.length] = j;
                v[v.length] = i + increment;
                v[v.length] = -1.0;
                v[v.length] = j;
                v[v.length] = i + increment;
                v[v.length] = -1.0;
                v[v.length] = j + increment;
                v[v.length] = i;
                v[v.length] = -1.0;
                v[v.length] = j + increment;
            }
        }
        
        // Left face
        for (var j = 1.0, k = 0; k < subdiv; j -= increment, k++ ) {
            for (var i = 1.0, l = 0; l < subdiv; i -= increment, l++ ) {
                v[v.length] = -1.0;
                v[v.length] = j;
                v[v.length] = i;
                v[v.length] = -1.0;
                v[v.length] = j;
                v[v.length] = i - increment;
                v[v.length] = -1.0;
                v[v.length] = j - increment;
                v[v.length] = i - increment;
                v[v.length] = -1.0;
                v[v.length] = j - increment;
                v[v.length] = i;
            }
        }
        
        // Right face
        for (var j = 1.0, k = 0; k < subdiv; j -= increment, k++ ) {
            for (var i = -1.0, l = 0; l < subdiv; i += increment, l++ ) {
                v[v.length] = 1.0;
                v[v.length] = j;
                v[v.length] = i;
                v[v.length] = 1.0;
                v[v.length] = j;
                v[v.length] = i + increment;
                v[v.length] = 1.0;
                v[v.length] = j - increment;
                v[v.length] = i + increment;
                v[v.length] = 1.0;
                v[v.length] = j - increment;
                v[v.length] = i;
            }
        }
        
        return v;
    }
    
    this.createCubeVertexIndices = function(subdiv) {
        var ind = [];
        
        // subdivisions^2 * side of cube * triangles per side * verticies per side
        for ( var i = 0; i < subdiv * subdiv * 6 * 2 * 4; i += 4 ) {
            ind[ind.length] = i;
            ind[ind.length] = i + 1;
            ind[ind.length] = i + 2;
            ind[ind.length] = i;
            ind[ind.length] = i + 2;
            ind[ind.length] = i + 3;
        }
        
        return ind;
    }
    
    this.createCubeVertexTextureCoords = function(subdiv) {
        var r = [];
        
        for ( var i = 0; i < subdiv * subdiv * 6; i++ ) {
            r = r.concat([0, 0, 1, 0, 1, 1, 0, 1]);
        }
        
        return r;
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
    
    this.makePersp = function(fovy, aspect, znear, zfar) {
        var f = 1 / Math.tan(fovy/2);
        return [
            f/aspect,   0,  0,  0,
                   0,   f,  0,  0,
                   0,   0,  (zfar+znear)/(znear-zfar), (2*zfar*znear)/(znear-zfar),
                   0,   0, -1,  0
        ];
    }
    
    this.initTextures = function() {
        if (!program.imageArray) {
            program.imageArray = [];
            program.texArray = [];
            program.texLoadedArray = [];
            program.tileNameArray = [];
        }
        if (!program.imageArray[program.subdivisions]) {
            program.imageArray[program.subdivisions] = [];
            program.texArray[program.subdivisions] = [];
            program.texLoadedArray[program.subdivisions] = [];
            program.tileNameArray[program.subdivisions] = [];
        }
        var sides = ['f', 'b', 'u', 'd', 'l', 'r'];
        for ( var s = 0; s < 6; s++ ) {
            // rows
            for ( var i = 0; i < program.subdivisions; i++ ) {
                // columns
                for ( var j = 0; j < program.subdivisions; j++ ) {
                    var index = s*program.subdivisions*program.subdivisions + i*program.subdivisions + j;
                    
                    program.tileNameArray[program.subdivisions][index] = this.image.path + program.subdivisions + "/" + sides[s] + i + j + ".png";
                }
            }
        }
    }
    
    this.processLoadedTexture = function(img, tex) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    
    this.processNextTile = function(index, pitch, yaw, hfov) {
        program.texArray[program.subdivisions][index] = gl.createTexture();
        program.imageArray[program.subdivisions][index] = new Image();
        var self = this;
        program.imageArray[program.subdivisions][index].onload = function() {
            self.processLoadedTexture(program.imageArray[program.subdivisions][index], program.texArray[program.subdivisions][index]);
            program.texLoadedArray[program.subdivisions][index] = true;
            self.render(pitch, yaw, hfov);
        }
        program.imageArray[program.subdivisions][index].src = program.tileNameArray[program.subdivisions][index];
    }
    
    this.checkZoom = function(hfov) {
        // Focal length
        var f = 1 / Math.tan(hfov);
        
        // Keep in bounds
        if (f < 0.00001)
            f = 0.00001;
        
        // Find optimal subdivisions
        var newSubdiv = 1;
        while ( this.canvas.width > (newSubdiv * this.image.tileResolution) / f && newSubdiv <= this.image.maxSubdivisions ) {
            newSubdiv++;
        }
        
        // Apply if there is a change
        if ( newSubdiv != program.subdivisions ) {
            program.subdivisions = newSubdiv;
            this.initTextures();
            this.initBuffers();
        }
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
        var winX = this.canvas.width * ( vpp[0]/vpp[3] + 1 ) / 2;
        var winY = this.canvas.height * ( vpp[1]/vpp[3] + 1 ) / 2;
        var winZ = ( vpp[2]/vpp[3] + 1 ) / 2;
        if ( winZ < 0 || winZ > 1 )
            return false;
        if ( winX < 0 || winX > this.canvas.width )
            return false;
        if ( winY < 0 || winY > this.canvas.height )
            return false;
        return true;
    }
    
    this.checkSquareInView = function(m, v) {
        // Check if at least one vertex is on canvas
        if ( !( this.checkInView(m, v.slice(0, 3)) || this.checkInView(m, v.slice(3, 6)) || this.checkInView(m, v.slice(6, 9)) || this.checkInView(m, v.slice(9, 12)) ) )
            return false;
        
        var vpp = this.applyRotPerspToVec(m, v.slice(0, 3));
        var w1 = Object(), w2 = Object(), w3 = Object, w4 = Object();
        w1.x = this.canvas.width * ( vpp[0]/vpp[3] + 1 ) / 2;
        w1.y = this.canvas.height * ( vpp[1]/vpp[3] + 1 ) / 2;
        w1.z = ( vpp[2]/vpp[3] + 1 ) / 2;
        vpp = this.applyRotPerspToVec(m, v.slice(3, 6));
        w2.x = this.canvas.width * ( vpp[0]/vpp[3] + 1 ) / 2;
        w2.y = this.canvas.height * ( vpp[1]/vpp[3] + 1 ) / 2;
        w2.z = ( vpp[2]/vpp[3] + 1 ) / 2;
        vpp = this.applyRotPerspToVec(m, v.slice(6, 9));
        w3.x = this.canvas.width * ( vpp[0]/vpp[3] + 1 ) / 2;
        w3.y = this.canvas.height * ( vpp[1]/vpp[3] + 1 ) / 2;
        w3.z = ( vpp[2]/vpp[3] + 1 ) / 2;
        vpp = this.applyRotPerspToVec(m, v.slice(9, 12));
        w4.x = this.canvas.width * ( vpp[0]/vpp[3] + 1 ) / 2;
        w4.y = this.canvas.height * ( vpp[1]/vpp[3] + 1 ) / 2;
        w4.z = ( vpp[2]/vpp[3] + 1 ) / 2;
        
        // Throw away tiles with vertices behind window plane
        if ( (w1.z < 0 || w1.z > 1) && (w2.z < 0 || w2.z > 1) && (w3.z < 0 || w3.z > 1) && (w4.z < 0 || w4.z > 1) )
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

'varying highp vec2 v_texCoord;',

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
'varying highp vec2 v_texCoord;',
'uniform sampler2D u_sampler;',

'void main(void) {',
    // Look up color from texture
    'gl_FragColor = texture2D(u_sampler, v_texCoord);',
'}'
].join('');

return {
    renderer: function(canvas, image, imagetype) {
        return new Renderer(canvas, image, imagetype);
    }
}

})(window, document);
