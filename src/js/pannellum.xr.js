/**
 * Pannellum WebXR VR Extension
 * Progressive enhancement plugin to add VR headset support to Pannellum.
 */
(function(pannellum) {
    if (!pannellum || !navigator.xr) return;

    var origViewer = pannellum.viewer;
    pannellum.viewer = function(container, config) {
        var viewer = origViewer(container, config);
        initXR(viewer);
        return viewer;
    };

    function initXR(viewer) {
        viewer.isVRPresenting = false;
        var xrSession = null;
        var xrRefSpace = null;
        var snapTurnCooldown = false;
        var gl = null;
        var renderer = null;

        // Custom WebGL components for VR Hotspots and Pointer Lines
        var vrProgram = null;
        var lineProgram = null;
        var quadBuffer = null;
        var lineBuffer = null;
        var infoTexture = null;
        var sceneTexture = null;

        // VR Controllers tracking
        var controllers = [];

        // Tooltip rendering components
        var tooltipTexture = null;
        var hoveredHotspot = null;
        var tooltipAspect = 2.0;
        var tooltipCanvas = document.createElement('canvas');
        var tooltipCtx = tooltipCanvas.getContext('2d');

        // Spinner rendering components
        var spinnerTexture = null;
        var spinnerCanvas = document.createElement('canvas');
        spinnerCanvas.width = 512;
        spinnerCanvas.height = 512;
        var spinnerCtx = spinnerCanvas.getContext('2d');

        // Pre-allocated array buffer for controller pointer rendering
        var linePoints = new Float32Array(6);

        // Hook into the VR button click
        viewer.on('vrtoggle', function() {
            if (xrSession) {
                exitVR();
            } else {
                enterVR();
            }
        });

        function enterVR() {
            var rendererInstance = viewer.getRenderer();
            if (!rendererInstance) return;
            var details = rendererInstance.getGLContextDetails();
            gl = details.gl;
            renderer = rendererInstance;

            if (!gl) {
                console.error("WebGL context not available for WebXR.");
                return;
            }

            navigator.xr.requestSession('immersive-vr', {
                requiredFeatures: ['local-floor']
            }).then(onSessionStarted).catch(function(err) {
                // Fallback to local session if local-floor is unavailable
                navigator.xr.requestSession('immersive-vr', {
                    requiredFeatures: ['local']
                }).then(onSessionStarted).catch(function(e) {
                    console.error("Failed to start WebXR session:", e);
                });
            });
        }

        function exitVR() {
            if (xrSession) {
                xrSession.end();
            }
        }

        function onSessionStarted(session) {
            xrSession = session;
            viewer.isVRPresenting = true;
            session.addEventListener('end', onSessionEnded);
            session.addEventListener('select', onSelect);

            // Setup layer
            var glLayer = new XRWebGLLayer(session, gl);
            session.updateRenderState({ baseLayer: glLayer });

            // Initialize custom VR shaders if not already done
            initVRShaders();

            // Hide standard UI elements that shouldn't overlay in VR
            var container = viewer.getContainer();
            if (container) {
                container.classList.add('pnlm-vr-active');
            }

            // Request reference space
            var spaceType = session.enabledFeatures.indexOf('local-floor') !== -1 ? 'local-floor' : 'local';
            session.requestReferenceSpace(spaceType).then(function(refSpace) {
                xrRefSpace = refSpace;
                session.requestAnimationFrame(onXRFrame);
            });
        }

        function onSessionEnded() {
            xrSession = null;
            xrRefSpace = null;
            controllers = [];
            viewer.isVRPresenting = false;

            // Restore standard UI classes
            var container = viewer.getContainer();
            if (container) {
                container.classList.remove('pnlm-vr-active');
            }

            // Trigger load to force standard viewer render loop recovery
            viewer.fire('load');
        }

        // Initialize shaders for 3D hotspots and laser lines
        function initVRShaders() {
            if (vrProgram) return;

            // 1. Hotspot billboard shader
            var vsSource = [
                'attribute vec2 a_position;',
                'attribute vec2 a_texCoord;',
                'uniform mat4 u_viewProj;',
                'uniform vec3 u_center;',
                'uniform vec3 u_cameraRight;',
                'uniform vec3 u_cameraUp;',
                'uniform vec2 u_size;',
                'varying vec2 v_texCoord;',
                'void main() {',
                '    vec3 worldPos = u_center + (a_position.x * u_size.x * u_cameraRight) + (a_position.y * u_size.y * u_cameraUp);',
                '    gl_Position = u_viewProj * vec4(worldPos, 1.0);',
                '    v_texCoord = a_texCoord;',
                '}'
            ].join('\n');

            var fsSource = [
                'precision mediump float;',
                'varying vec2 v_texCoord;',
                'uniform sampler2D u_texture;',
                'void main() {',
                '    gl_FragColor = texture2D(u_texture, v_texCoord);',
                '}'
            ].join('\n');

            vrProgram = createShaderProgram(vsSource, fsSource);
            vrProgram.a_position = gl.getAttribLocation(vrProgram, 'a_position');
            vrProgram.a_texCoord = gl.getAttribLocation(vrProgram, 'a_texCoord');
            vrProgram.u_viewProj = gl.getUniformLocation(vrProgram, 'u_viewProj');
            vrProgram.u_center = gl.getUniformLocation(vrProgram, 'u_center');
            vrProgram.u_cameraRight = gl.getUniformLocation(vrProgram, 'u_cameraRight');
            vrProgram.u_cameraUp = gl.getUniformLocation(vrProgram, 'u_cameraUp');
            vrProgram.u_size = gl.getUniformLocation(vrProgram, 'u_size');

            // Setup quad buffer
            quadBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                -0.5,  0.5, 0, 0, // top-left
                -0.5, -0.5, 0, 1, // bottom-left
                 0.5,  0.5, 1, 0, // top-right
                 0.5, -0.5, 1, 1  // bottom-right
            ]), gl.STATIC_DRAW);

            // Generate textures
            infoTexture = createHotspotTexture('info');
            sceneTexture = createHotspotTexture('scene');

            // 2. Line shader for VR pointers
            var vsLine = [
                'attribute vec3 a_position;',
                'uniform mat4 u_viewProj;',
                'void main() {',
                '    gl_Position = u_viewProj * vec4(a_position, 1.0);',
                '}'
            ].join('\n');

            var fsLine = [
                'precision mediump float;',
                'uniform vec4 u_color;',
                'void main() {',
                '    gl_FragColor = u_color;',
                '}'
            ].join('\n');

            lineProgram = createShaderProgram(vsLine, fsLine);
            lineProgram.a_position = gl.getAttribLocation(lineProgram, 'a_position');
            lineProgram.u_viewProj = gl.getUniformLocation(lineProgram, 'u_viewProj');
            lineProgram.u_color = gl.getUniformLocation(lineProgram, 'u_color');

            lineBuffer = gl.createBuffer();
        }

        function createShaderProgram(vsSrc, fsSrc) {
            var vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, vsSrc);
            gl.compileShader(vs);
            if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
                console.error("VS compilation fail:", gl.getShaderInfoLog(vs));
            }

            var fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fs, fsSrc);
            gl.compileShader(fs);
            if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
                console.error("FS compilation fail:", gl.getShaderInfoLog(fs));
            }

            var program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Shader link fail:", gl.getProgramInfoLog(program));
            }
            return program;
        }

        function createHotspotTexture(type) {
            var canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            var ctx = canvas.getContext('2d');

            ctx.beginPath();
            ctx.arc(32, 32, 28, 0, 2 * Math.PI);
            ctx.fillStyle = type === 'scene' ? '#4CAF50' : '#007AFF';
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (type === 'scene') {
                ctx.font = 'bold 32px sans-serif';
                ctx.fillText('➔', 32, 32);
            } else {
                ctx.font = 'bold 38px serif';
                ctx.fillText('i', 32, 30);
            }

            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            return texture;
        }

        // WebXR Frame Callback
        function onXRFrame(time, frame) {
            if (!xrSession) return;
            xrSession.requestAnimationFrame(onXRFrame);

            // Check controller thumbsticks/joysticks for snap turning
            var joystickActive = false;
            if (xrSession.inputSources) {
                xrSession.inputSources.forEach(function(source) {
                    if (source.gamepad && source.gamepad.axes) {
                        var axes = source.gamepad.axes;
                        var joystickX = 0;
                        if (axes.length > 2 && Math.abs(axes[2]) > 0.5) {
                            joystickX = axes[2];
                        } else if (axes.length > 0 && Math.abs(axes[0]) > 0.5) {
                            joystickX = axes[0];
                        }

                        if (Math.abs(joystickX) > 0.7) {
                            joystickActive = true;
                            if (!snapTurnCooldown) {
                                var angle = joystickX > 0 ? 30 : -30;
                                snapTurn(angle);
                                snapTurnCooldown = true;
                            }
                        }
                    }
                });
            }
            if (!joystickActive) {
                snapTurnCooldown = false;
            }

            var pose = frame.getViewerPose(xrRefSpace);
            if (!pose) return;

            var glLayer = xrSession.renderState.baseLayer;
            gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);

            // Clean state & depth buffer
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Update controllers tracking state
            var headPos = [pose.transform.position.x || 0, pose.transform.position.y || 0, pose.transform.position.z || 0];
            updateControllers(frame, headPos);

            var config = viewer.getConfig();
            var details = renderer.getGLContextDetails();

            // Hover detection
            var hotspots = config.hotSpots || [];
            var newHovered = null;
            var closestDistance = Infinity;

            controllers.forEach(function(c) {
                hotspots.forEach(function(hs) {
                    var pos = getHotspotCartesianPosition(hs);
                    var dist = raySphereIntersection(c.relOrigin, c.dir, pos, 0.25);
                    if (dist > 0 && dist < closestDistance) {
                        closestDistance = dist;
                        newHovered = hs;
                    }
                });
            });

            if (newHovered !== hoveredHotspot) {
                hoveredHotspot = newHovered;
                if (hoveredHotspot && hoveredHotspot.text) {
                    updateTooltipTexture(hoveredHotspot.text);
                }
            }

            // Update loading spinner texture if loading
            if (!viewer.isLoaded()) {
                updateSpinnerTexture(time);
            }

            for (var i = 0; i < pose.views.length; i++) {
                var view = pose.views[i];
                var viewport = glLayer.getViewport(view);
                gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

                if (details.imageType !== 'multires') {
                    // 1. Render standard Equirectangular / Cubemap
                    var viewMatrix = stripMatrix4Translation(view.transform.inverse.matrix);
                    var projView = multiplyMatrix4(view.projectionMatrix, viewMatrix);
                    var invProjView = invertMatrix4(projView);
                    renderer.renderXR(invProjView, { dynamic: config.dynamic });
                } else {
                    // 2. Render Multiresolution
                    var projMatrix = view.projectionMatrix;
                    var viewMatrix = stripMatrix4Translation(view.transform.inverse.matrix);

                    // Compute row-major equivalents for frustum culling
                    var projRowMajor = transposeMatrix4(projMatrix);
                    var viewRowMajor = transposeMatrix4(viewMatrix);

                    var rotPersp = multiplyMatrix4(projRowMajor, viewRowMajor);

                    // Reconstruct perspMatrixNoClip equivalents by setting near clip far boundaries
                    var projNoClipRowMajor = new Float32Array(projRowMajor);
                    projNoClipRowMajor[10] = 0.0;
                    projNoClipRowMajor[11] = 100.0;
                    var rotPerspNoClip = multiplyMatrix4(projNoClipRowMajor, viewRowMajor);

                    renderer.renderXR(null, {
                        projMatrix: projMatrix,
                        viewMatrix: viewMatrix,
                        rotPersp: rotPersp,
                        rotPerspNoClip: rotPerspNoClip,
                        pitch: config.pitch,
                        yaw: config.yaw,
                        hfov: config.hfov
                    });
                }

                // 3. Render 3D Hotspot Billboards
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

                renderVRHotspots(view, config.hotSpots || []);

                // 4. Render Laser Pointer Line from controllers
                renderVRControllerPointers(view);

                // 5. Render Hover Tooltip
                if (hoveredHotspot) {
                    renderVRTooltip(view, hoveredHotspot);
                }

                // 6. Render Loading Spinner
                if (!viewer.isLoaded()) {
                    renderVRSpinner(view);
                }

                gl.disable(gl.BLEND);
            }
        }

        // VR Controller ray/select handler
        function onSelect(event) {
            var frame = event.frame;
            var inputSource = event.inputSource;
            var viewerPose = frame.getViewerPose(xrRefSpace);
            if (!viewerPose) return;
            var headPos = [
                viewerPose.transform.position.x || 0,
                viewerPose.transform.position.y || 0,
                viewerPose.transform.position.z || 0
            ];

            var pose = frame.getPose(inputSource.targetRaySpace, xrRefSpace);
            if (!pose) return;

            var matrix = pose.transform.matrix;
            var rayOrigin = [
                matrix[12] - headPos[0],
                matrix[13] - headPos[1],
                matrix[14] - headPos[2]
            ];
            var rayDir = normalizeVector([-matrix[8], -matrix[9], -matrix[10]]);

            // Check intersections with all hotspots
            var config = viewer.getConfig();
            var hotspots = config.hotSpots || [];
            var closestDistance = Infinity;
            var selectedHotspot = null;

            hotspots.forEach(function(hs) {
                var pos = getHotspotCartesianPosition(hs);
                var dist = raySphereIntersection(rayOrigin, rayDir, pos, 0.25); // Radius 0.25m
                if (dist > 0 && dist < closestDistance) {
                    closestDistance = dist;
                    selectedHotspot = hs;
                }
            });

            if (selectedHotspot) {
                if (selectedHotspot.sceneId) {
                    viewer.loadScene(selectedHotspot.sceneId, selectedHotspot.targetPitch, selectedHotspot.targetYaw, selectedHotspot.targetHfov);
                } else if (selectedHotspot.URL) {
                    window.open(selectedHotspot.URL, selectedHotspot.targetBlank ? '_blank' : '_self');
                } else if (selectedHotspot.clickHandlerFunc) {
                    selectedHotspot.clickHandlerFunc(event, selectedHotspot.clickHandlerArgs);
                }
            }
        }

        function updateControllers(frame, headPos) {
            controllers = [];
            xrSession.inputSources.forEach(function(source) {
                if (source.targetRaySpace) {
                    var pose = frame.getPose(source.targetRaySpace, xrRefSpace);
                    if (pose) {
                        var matrix = pose.transform.matrix;
                        var origin = [matrix[12], matrix[13], matrix[14]];
                        var relOrigin = [
                            origin[0] - headPos[0],
                            origin[1] - headPos[1],
                            origin[2] - headPos[2]
                        ];
                        controllers.push({
                            origin: origin,
                            relOrigin: relOrigin,
                            dir: normalizeVector([-matrix[8], -matrix[9], -matrix[10]])
                        });
                    }
                }
            });
        }

        // Render VR Hotspots as 3D Billboards
        function renderVRHotspots(view, hotspots) {
            if (hotspots.length === 0) return;

            gl.useProgram(vrProgram);

            // Compute View-Projection matrix for standard shader transforms
            var viewMatrix = stripMatrix4Translation(view.transform.inverse.matrix);
            var viewProj = multiplyMatrix4(view.projectionMatrix, viewMatrix);
            gl.uniformMatrix4fv(vrProgram.u_viewProj, false, viewProj);

            // Extract camera right & up vectors from view matrix for billboarding
            var vm = viewMatrix;
            var cameraRight = [vm[0], vm[4], vm[8]];
            var cameraUp = [vm[1], vm[5], vm[9]];
            gl.uniform3fv(vrProgram.u_cameraRight, cameraRight);
            gl.uniform3fv(vrProgram.u_cameraUp, cameraUp);

            // Bind quad buffer and attributes
            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
            gl.enableVertexAttribArray(vrProgram.a_position);
            gl.vertexAttribPointer(vrProgram.a_position, 2, gl.FLOAT, false, 16, 0);
            gl.enableVertexAttribArray(vrProgram.a_texCoord);
            gl.vertexAttribPointer(vrProgram.a_texCoord, 2, gl.FLOAT, false, 16, 8);

            gl.uniform2f(vrProgram.u_size, 0.4, 0.4); // Size of hotspot in meters

            hotspots.forEach(function(hs) {
                var center = getHotspotCartesianPosition(hs);
                gl.uniform3fv(vrProgram.u_center, center);

                var tex = hs.type === 'scene' ? sceneTexture : infoTexture;
                gl.bindTexture(gl.TEXTURE_2D, tex);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            });

            // Clean up attributes
            gl.disableVertexAttribArray(vrProgram.a_position);
            gl.disableVertexAttribArray(vrProgram.a_texCoord);
        }

        function renderVRControllerPointers(view) {
            if (controllers.length === 0) return;

            gl.useProgram(lineProgram);

            var viewMatrix = stripMatrix4Translation(view.transform.inverse.matrix);
            var viewProj = multiplyMatrix4(view.projectionMatrix, viewMatrix);
            gl.uniformMatrix4fv(lineProgram.u_viewProj, false, viewProj);

            var config = viewer.getConfig();
            var hotspots = config.hotSpots || [];

            controllers.forEach(function(c) {
                // Determine if this controller is pointing to any hotspot
                var isPointing = false;
                hotspots.forEach(function(hs) {
                    var pos = getHotspotCartesianPosition(hs);
                    var dist = raySphereIntersection(c.relOrigin, c.dir, pos, 0.25);
                    if (dist > 0) {
                        isPointing = true;
                    }
                });

                // Color: green if pointing at a hotspot, red otherwise
                var color = isPointing ? [0.2, 1.0, 0.2, 0.8] : [1.0, 0.2, 0.2, 0.8];
                gl.uniform4f(lineProgram.u_color, color[0], color[1], color[2], color[3]);

                linePoints[0] = c.relOrigin[0];
                linePoints[1] = c.relOrigin[1];
                linePoints[2] = c.relOrigin[2];
                linePoints[3] = c.relOrigin[0] + c.dir[0] * 5.0;
                linePoints[4] = c.relOrigin[1] + c.dir[1] * 5.0;
                linePoints[5] = c.relOrigin[2] + c.dir[2] * 5.0;

                gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, linePoints, gl.DYNAMIC_DRAW);

                gl.enableVertexAttribArray(lineProgram.a_position);
                gl.vertexAttribPointer(lineProgram.a_position, 3, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.LINES, 0, 2);
            });

            // Clean up attributes
            gl.disableVertexAttribArray(lineProgram.a_position);
        }

        function updateTooltipTexture(text) {
            if (!tooltipTexture) {
                tooltipTexture = gl.createTexture();
            }

            var textCtx = tooltipCanvas.getContext('2d');
            textCtx.font = '16px sans-serif';
            var textMetrics = textCtx.measureText(text);
            var paddingX = 20;

            var neededWidth = Math.max(128, Math.pow(2, Math.ceil(Math.log2(textMetrics.width + paddingX * 2))));
            tooltipCanvas.width = neededWidth;
            tooltipCanvas.height = 64;

            // Re-acquire context as setting width/height clears and resets state
            var ctx = tooltipCanvas.getContext('2d');
            ctx.clearRect(0, 0, neededWidth, 64);

            // Draw rounded rectangle background with dark semi-transparent glassmorphism styling
            var w = neededWidth;
            var h = 64;
            var r = 10;
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(w - r, 0);
            ctx.quadraticCurveTo(w, 0, w, r);
            ctx.lineTo(w, h - r);
            ctx.quadraticCurveTo(w, h, w - r, h);
            ctx.lineTo(r, h);
            ctx.quadraticCurveTo(0, h, 0, h - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();

            ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();

            // Draw text centered
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, w / 2, h / 2);

            gl.bindTexture(gl.TEXTURE_2D, tooltipTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tooltipCanvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            tooltipAspect = neededWidth / 64;
        }

        function renderVRTooltip(view, hs) {
            if (!tooltipTexture || !hs || !hs.text) return;

            gl.useProgram(vrProgram);

            var viewMatrix = stripMatrix4Translation(view.transform.inverse.matrix);
            var viewProj = multiplyMatrix4(view.projectionMatrix, viewMatrix);
            gl.uniformMatrix4fv(vrProgram.u_viewProj, false, viewProj);

            var vm = viewMatrix;
            var cameraRight = [vm[0], vm[4], vm[8]];
            var cameraUp = [vm[1], vm[5], vm[9]];
            gl.uniform3fv(vrProgram.u_cameraRight, cameraRight);
            gl.uniform3fv(vrProgram.u_cameraUp, cameraUp);

            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
            gl.enableVertexAttribArray(vrProgram.a_position);
            gl.vertexAttribPointer(vrProgram.a_position, 2, gl.FLOAT, false, 16, 0);
            gl.enableVertexAttribArray(vrProgram.a_texCoord);
            gl.vertexAttribPointer(vrProgram.a_texCoord, 2, gl.FLOAT, false, 16, 8);

            var hSize = 0.25;
            var wSize = hSize * tooltipAspect;
            gl.uniform2f(vrProgram.u_size, wSize, hSize);

            // Shift position 0.45 meters above the hotspot's physical center
            var center = getHotspotCartesianPosition(hs);
            center[1] += 0.45;
            gl.uniform3fv(vrProgram.u_center, center);

            gl.bindTexture(gl.TEXTURE_2D, tooltipTexture);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.disableVertexAttribArray(vrProgram.a_position);
            gl.disableVertexAttribArray(vrProgram.a_texCoord);
        }

        function updateSpinnerTexture(time) {
            if (!spinnerTexture) {
                spinnerTexture = gl.createTexture();
            }

            spinnerCtx.clearRect(0, 0, 512, 512);

            var progress = typeof viewer.getLoadProgress === 'function' ? viewer.getLoadProgress() : -1;

            var center = 256;
            var radius = 180;

            if (progress >= 0) {
                // Draw a circular progress ring
                // 1. Background circle
                spinnerCtx.beginPath();
                spinnerCtx.arc(center, center, radius, 0, 2 * Math.PI);
                spinnerCtx.lineWidth = 16;
                spinnerCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                spinnerCtx.stroke();

                // 2. Progress arc
                var startAngle = -0.5 * Math.PI; // Top
                var endAngle = startAngle + (progress / 100) * 2 * Math.PI;
                spinnerCtx.beginPath();
                spinnerCtx.arc(center, center, radius, startAngle, endAngle);
                spinnerCtx.lineWidth = 24;
                spinnerCtx.lineCap = 'round';
                spinnerCtx.strokeStyle = '#007AFF';
                spinnerCtx.stroke();

                // 3. Percentage text in the center
                spinnerCtx.font = 'bold 80px sans-serif';
                spinnerCtx.fillStyle = '#FFFFFF';
                spinnerCtx.textAlign = 'center';
                spinnerCtx.textBaseline = 'middle';
                spinnerCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                spinnerCtx.shadowBlur = 10;
                spinnerCtx.fillText(Math.round(progress) + '%', center, center);
                spinnerCtx.shadowBlur = 0; // Reset shadow
            } else {
                // Draw indeterminate spinning arc
                var startAngle = (time / 200) % (2 * Math.PI);
                var endAngle = startAngle + 1.5 * Math.PI;

                spinnerCtx.beginPath();
                spinnerCtx.arc(center, center, radius, startAngle, endAngle);
                spinnerCtx.lineWidth = 32;
                spinnerCtx.lineCap = 'round';
                spinnerCtx.strokeStyle = '#007AFF';
                spinnerCtx.stroke();
            }

            gl.bindTexture(gl.TEXTURE_2D, spinnerTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spinnerCanvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

        function renderVRSpinner(view) {
            if (!spinnerTexture) return;

            gl.useProgram(vrProgram);

            var viewMatrix = stripMatrix4Translation(view.transform.inverse.matrix);
            var viewProj = multiplyMatrix4(view.projectionMatrix, viewMatrix);
            gl.uniformMatrix4fv(vrProgram.u_viewProj, false, viewProj);

            // Extract camera right & up vectors
            var vm = viewMatrix;
            var cameraRight = [vm[0], vm[4], vm[8]];
            var cameraUp = [vm[1], vm[5], vm[9]];
            gl.uniform3fv(vrProgram.u_cameraRight, cameraRight);
            gl.uniform3fv(vrProgram.u_cameraUp, cameraUp);

            gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
            gl.enableVertexAttribArray(vrProgram.a_position);
            gl.vertexAttribPointer(vrProgram.a_position, 2, gl.FLOAT, false, 16, 0);
            gl.enableVertexAttribArray(vrProgram.a_texCoord);
            gl.vertexAttribPointer(vrProgram.a_texCoord, 2, gl.FLOAT, false, 16, 8);

            gl.uniform2f(vrProgram.u_size, 0.3, 0.3);

            // Position it 2.0 meters directly in front of the camera's current gaze direction
            var m = view.transform.matrix;
            var forward = normalizeVector([-m[8], -m[9], -m[10]]);
            var center = [
                forward[0] * 2.0,
                forward[1] * 2.0,
                forward[2] * 2.0
            ];
            gl.uniform3fv(vrProgram.u_center, center);

            gl.bindTexture(gl.TEXTURE_2D, spinnerTexture);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.disableVertexAttribArray(vrProgram.a_position);
            gl.disableVertexAttribArray(vrProgram.a_texCoord);
        }

        // Convert spherical coordinates (pitch, yaw) of hotspot into 3D position
        function getHotspotCartesianPosition(hs) {
            var R = 5.0; // Render sphere radius (meters)
            var p = hs.pitch * Math.PI / 180;
            var y = hs.yaw * Math.PI / 180;

            // Coordinate conversion: Z is forward/back, X is right/left, Y is up/down
            return [
                R * Math.cos(p) * Math.sin(y),
                R * Math.sin(p),
                -R * Math.cos(p) * Math.cos(y)
            ];
        }

        // Raycast-sphere intersection check
        function raySphereIntersection(rayOrigin, rayDir, sphereCenter, radius) {
            var v = [sphereCenter[0] - rayOrigin[0], sphereCenter[1] - rayOrigin[1], sphereCenter[2] - rayOrigin[2]];
            var a = v[0] * rayDir[0] + v[1] * rayDir[1] + v[2] * rayDir[2];
            if (a < 0) return -1;
            var d2 = (v[0]*v[0] + v[1]*v[1] + v[2]*v[2]) - a*a;
            var r2 = radius * radius;
            if (d2 > r2) return -1;
            return a - Math.sqrt(r2 - d2);
        }

        // --- Matrix Math Helpers ---
        function stripMatrix4Translation(m) {
            var out = new Float32Array(m);
            out[12] = 0.0;
            out[13] = 0.0;
            out[14] = 0.0;
            return out;
        }
        function transposeMatrix4(m) {
            var out = new Float32Array(16);
            out[0] = m[0]; out[1] = m[4]; out[2] = m[8]; out[3] = m[12];
            out[4] = m[1]; out[5] = m[5]; out[6] = m[9]; out[7] = m[13];
            out[8] = m[2]; out[9] = m[6]; out[10] = m[10]; out[11] = m[14];
            out[12] = m[3]; out[13] = m[7]; out[14] = m[11]; out[15] = m[15];
            return out;
        }

        function multiplyMatrix4(a, b) {
            var out = new Float32Array(16);
            for (var col = 0; col < 4; col++) {
                for (var row = 0; row < 4; row++) {
                    var sum = 0;
                    for (var k = 0; k < 4; k++) {
                        sum += a[k * 4 + row] * b[col * 4 + k];
                    }
                    out[col * 4 + row] = sum;
                }
            }
            return out;
        }

        function invertMatrix4(m) {
            var out = new Float32Array(16);
            var m00 = m[0], m01 = m[4], m02 = m[8], m03 = m[12];
            var m10 = m[1], m11 = m[5], m12 = m[9], m13 = m[13];
            var m20 = m[2], m21 = m[6], m22 = m[10], m23 = m[14];
            var m30 = m[3], m31 = m[7], m32 = m[11], m33 = m[15];

            var b00 = m00 * m11 - m01 * m10;
            var b01 = m00 * m12 - m02 * m10;
            var b02 = m00 * m13 - m03 * m10;
            var b03 = m01 * m12 - m02 * m11;
            var b04 = m01 * m13 - m03 * m11;
            var b05 = m02 * m13 - m03 * m12;
            var b06 = m20 * m31 - m21 * m30;
            var b07 = m20 * m32 - m22 * m30;
            var b08 = m20 * m33 - m23 * m30;
            var b09 = m21 * m32 - m22 * m31;
            var b10 = m21 * m33 - m23 * m31;
            var b11 = m22 * m33 - m23 * m32;

            var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) return out;
            det = 1.0 / det;

            out[0] = (m11 * b11 - m12 * b10 + m13 * b09) * det;
            out[1] = (m12 * b08 - m10 * b11 - m13 * b07) * det;
            out[2] = (m10 * b10 - m11 * b08 + m13 * b06) * det;
            out[3] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
            out[4] = (m02 * b10 - m01 * b11 - m03 * b09) * det;
            out[5] = (m00 * b11 - m02 * b08 + m03 * b07) * det;
            out[6] = (m01 * b08 - m00 * b10 - m03 * b06) * det;
            out[7] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
            out[8] = (m31 * b05 - m32 * b04 + m33 * b03) * det;
            out[9] = (m32 * b02 - m30 * b05 - m33 * b01) * det;
            out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
            out[11] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
            out[12] = (m22 * b04 - m21 * b05 - m23 * b03) * det;
            out[13] = (m20 * b05 - m22 * b02 + m23 * b01) * det;
            out[14] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
            out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;

            return out;
        }

        function normalizeVector(v) {
            var len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
            if (len > 0) {
                return [v[0]/len, v[1]/len, v[2]/len];
            }
            return v;
        }

        function snapTurn(angleDegrees) {
            if (!xrRefSpace) return;
            var theta = angleDegrees * Math.PI / 180;
            var sinHalf = Math.sin(theta / 2);
            var cosHalf = Math.cos(theta / 2);
            
            try {
                var transform = new XRRigidTransform(
                    {x: 0, y: 0, z: 0},
                    {x: 0, y: sinHalf, z: 0, w: cosHalf}
                );
                xrRefSpace = xrRefSpace.getOffsetReferenceSpace(transform);
            } catch(e) {
                console.error("Snap turn failed:", e);
            }
        }
    }
})(window.pannellum);
