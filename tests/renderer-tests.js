/* Real WebGL tests; no XR runtime or third-party renderer. */
var rendererTests = (function() {
    'use strict';
    var cases = [];
    function assert(condition, message) { if (!condition) throw new Error(message); }
    function source(width, height) {
        var image = document.createElement('canvas');
        image.width = width || 128;
        image.height = height || 64;
        var ctx = image.getContext('2d');
        ctx.fillStyle = 'rgb(60, 120, 180)';
        ctx.fillRect(0, 0, image.width, image.height);
        return image;
    }
    function fixture(type) {
        var element = document.createElement('div');
        element.style.width = '128px'; element.style.height = '128px';
        document.body.appendChild(element);
        var renderer = libpannellum.renderer(element), image = source(128, 128);
        renderer.init(type === 'cubemap' ? [image,image,image,image,image,image] : image,
            type || 'equirectangular', 2 * Math.PI, Math.PI, 0, function() {}, {});
        return {renderer: renderer, image: image,
            gl: renderer.getCanvas().getContext('experimental-webgl'),
            dispose: function() { renderer.destroy(); element.remove(); }};
    }
    function pixel(gl, x, y) {
        var rgba = new Uint8Array(4);
        gl.readPixels(x === undefined ? 64 : x, y === undefined ? 64 : y,
            1, 1, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
        return Array.from(rgba);
    }
    function unbind(gl) {
        gl.useProgram(null);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        for (var i = 0; i < gl.getParameter(gl.MAX_VERTEX_ATTRIBS); i++) gl.disableVertexAttribArray(i);
    }
    function test(name, fn) { cases.push({name:name, run:fn}); }
    async function run() {
        var passed = [];
        try {
            for (var i = 0; i < cases.length; i++) {
                await cases[i].run();
                passed.push(cases[i].name);
            }
            document.getElementById('result').textContent = 'PASS (' + passed.length + ')\n' + passed.join('\n');
        } catch(error) {
            document.getElementById('result').textContent = 'FAIL\n' + passed.join('\n') + '\n' + error.stack;
        }
    }
    ['equirectangular', 'cubemap'].forEach(function(type) {
        test(type + ' restores its bindings after another GL user', function() {
            var f = fixture(type);
            try {
                f.renderer.render(0, 0, Math.PI / 2);
                var expected = pixel(f.gl);
                unbind(f.gl);
                f.renderer.render(0, 0, Math.PI / 2);
                assert(pixel(f.gl).join() === expected.join(), 'panorama changed after foreign GL bindings');
                assert(f.gl.getError() === 0, 'invalid GL state');
                f.renderer.render(0, 0, Math.PI / 2, {hook:function(data) { unbind(data.gl); }});
                assert(pixel(f.gl).join() === expected.join(), 'render hook bindings leaked into panorama');
                assert(f.gl.getError() === 0, 'hook left invalid GL state');
                unbind(f.gl);
                f.renderer.resize();
                assert(f.gl.getError() === 0, 'resize used another GL program');
            } finally { f.dispose(); }
        });
    });
    test('source and context access do not draw or change GL state', function() {
        var f = fixture();
        try {
            f.gl.useProgram(null);
            var before = f.gl.getParameter(f.gl.CURRENT_PROGRAM);
            var data = f.renderer.getSource();
            assert(data.image === f.image && data.type === 'equirectangular', 'borrowed decoded source');
            assert(data.width === 128 && data.height === 128 && data.haov === 2 * Math.PI, 'source metadata');
            assert(f.renderer.getContext() === f.gl, 'context identity');
            assert(f.gl.getParameter(f.gl.CURRENT_PROGRAM) === before && f.gl.getError() === 0, 'getter changed GL state');
            data.haov = 1;
            assert(f.renderer.getSource().haov === 2 * Math.PI, 'metadata snapshot must be independent');
            f.renderer.setPose(0.2, 0.1);
            assert(f.renderer.getSource().horizonPitch === 0.2, 'metadata follows horizon correction');
            var called = false;
            f.renderer.render(0, 0, Math.PI / 2, {hook:function() {called=true; return true;}});
            assert(called && pixel(f.gl)[3] === 255 && f.gl.getError() === 0, 'legacy hook return value remains ignored');
        } finally { f.dispose(); }
    });
    test('multires clear option preserves another viewport and defaults to clearing', function() {
        var f = fixture(), gl = f.gl;
        try {
            f.renderer.init({path:'../examples/multires/1/%s00', extension:'png',
                tileResolution:128, cubeResolution:128, maxLevel:1},
                'multires', 2*Math.PI, Math.PI, 0, function() {}, {});
            gl.clearColor(1, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
            gl.viewport(64, 0, 64, 128); gl.clearColor(0, 0, 1, 1);
            f.renderer.render(0, 0, Math.PI/2, {clear:false});
            assert(pixel(gl, 32, 64)[0] === 255, 'clear:false erased the other viewport');
            f.renderer.render(0, 0, Math.PI/2);
            assert(pixel(gl, 32, 64)[2] === 255, 'omitting clear must retain the existing clear');
            gl.clearColor(1, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
            gl.clearColor(0, 0, 1, 1);
            f.renderer.render(0, 0, Math.PI/2, {clear:true});
            assert(pixel(gl, 32, 64)[2] === 255, 'clear:true did not clear');
            assert(gl.getError() === 0, 'multires clear GL error');
        } finally { f.dispose(); }
    });
    function perspective() {
        return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,-1.002,-1, 0,0,-0.2002,0]);
    }
    function camera(pitch, yaw, roll) {
        // Rotate camera basis vectors into the world, then transpose to a view.
        var cp=Math.cos(pitch), sp=Math.sin(pitch), cy=Math.cos(yaw), sy=Math.sin(yaw);
        var cr=Math.cos(roll), sr=Math.sin(roll);
        var right=[cy*cr-sy*sp*sr, cp*sr, sy*cr+cy*sp*sr];
        var up=[-cy*sr-sy*sp*cr, cp*cr, -sy*sr+cy*sp*cr];
        var back=[-sy*cp, -sp, cy*cp];
        return new Float32Array([right[0],up[0],back[0],0,
            right[1],up[1],back[1],0, right[2],up[2],back[2],0, 0,0,0,1]);
    }
    function pixels(gl) {
        var data = new Uint8Array(128*128*4);
        gl.readPixels(0, 0, 128, 128, gl.RGBA, gl.UNSIGNED_BYTE, data);
        return data;
    }
    function comparePixels(actual, expected, label, xOffset, yOffset, size) {
        size = size || 128;
        for (var y=8; y<size; y+=13) for (var x=8; x<size; x+=13) {
            for (var c=0; c<4; c++) {
                var a=actual[(y*128+x)*4+c];
                var b=expected[((y+(yOffset||0))*128+x+(xOffset||0))*4+c];
                assert(Math.abs(a-b)<=3, label+' at '+x+','+y+' channel '+c+': '+a+' vs '+b);
            }
        }
    }
    function cameraImage(face) {
        var image=source(512, face === undefined ? 256 : 512), ctx=image.getContext('2d');
        var data=ctx.createImageData(image.width, image.height);
        for (var y=0; y<image.height; y++) for (var x=0; x<image.width; x++) {
            var i=(y*image.width+x)*4;
            data.data[i]=30+x/image.width*160;
            data.data[i+1]=30+y/image.height*160;
            data.data[i+2]=30+(face||0)*35;
            data.data[i+3]=255;
        }
        ctx.putImageData(data, 0, 0);
        return image;
    }
    ['equirectangular', 'cubemap'].forEach(function(type) {
        test(type+' external cameras match classic rotation, horizon and asymmetric views', function() {
            var f=fixture(type), gl=f.gl;
            try {
                var image=type==='cubemap' ? [0,1,2,3,4,5].map(cameraImage) : cameraImage();
                f.renderer.init(image, type, 2*Math.PI, Math.PI, 0, function() {}, {});
                var view={projectionMatrix:perspective(), viewMatrix:camera(0,0,0), width:128, height:128};
                [[0,0,0], [0.3,0.7,0.2], [-0.4,-1.4,-0.3]].forEach(function(angles) {
                    [false, true].forEach(function(correctHorizon) {
                        f.renderer.setPose(correctHorizon ? 0.2 : 0, correctHorizon ? -0.15 : 0);
                        f.renderer.render(angles[0], angles[1], Math.PI/2, {roll:angles[2]});
                        var expected=pixels(gl);
                        view.viewMatrix=camera(angles[0], angles[1], angles[2]);
                        f.renderer.render(0, 0, Math.PI/2, {view:view});
                        comparePixels(pixels(gl), expected, type+' matrix camera');
                        view.viewMatrix[12]=10; view.viewMatrix[13]=3; view.viewMatrix[14]=-7;
                        f.renderer.render(0, 0, Math.PI/2, {view:view});
                        comparePixels(pixels(gl), expected, 'translation must not add parallax');
                        f.renderer.render(angles[0], angles[1], Math.PI/2, {roll:angles[2]});
                        comparePixels(pixels(gl), expected, 'return to classic camera');
                    });
                });
                f.renderer.setPose(0, 0);
                f.renderer.render(0, 0, Math.PI/2);
                var full=pixels(gl);
                view.projectionMatrix=perspective(); view.viewMatrix=camera(0,0,0);
                view.projectionMatrix[0]=view.projectionMatrix[5]=2;
                view.projectionMatrix[8]=0.5; view.projectionMatrix[9]=-0.5;
                view.width=view.height=64;
                gl.viewport(0, 0, 64, 64);
                f.renderer.render(0, 0, Math.PI/2, {view:view});
                comparePixels(pixels(gl), full, 'off-axis camera crop', 48, 16, 64);
                assert(gl.getError()===0, 'camera GL error');
            } finally { f.dispose(); }
        });
    });
    test('invalid external cameras fail explicitly without changing the next classic draw', function() {
        var f=fixture();
        try {
            f.renderer.render(0, 0, Math.PI/2);
            var expected=pixels(f.gl);
            [function(v) {v.projectionMatrix=new Float32Array(16);},
                function(v) {v.viewMatrix[0]=NaN;}, function(v) {v.width=0;},
                function(v) {v.viewMatrix=[1,2,3];}].forEach(function(invalidate) {
                var view={projectionMatrix:perspective(), viewMatrix:camera(0,0,0), width:128, height:128};
                invalidate(view);
                var rejected=false;
                try { f.renderer.render(0, 0, Math.PI/2, {view:view}); }
                catch(e) { rejected=e instanceof RangeError || e instanceof TypeError; }
                assert(rejected, 'invalid camera was accepted');
                f.renderer.render(0, 0, Math.PI/2);
                comparePixels(pixels(f.gl), expected, 'classic recovery');
            });
            assert(f.gl.getError()===0, 'invalid camera changed GL state');
        } finally { f.dispose(); }
    });
    test('external multires cameras preserve other viewports when clearing is disabled', function() {
        var f=fixture(), gl=f.gl;
        try {
            f.renderer.init({path:'../examples/multires/1/%s00', extension:'png',
                tileResolution:128, cubeResolution:128, maxLevel:1},
                'multires', 2*Math.PI, Math.PI, 0, function() {}, {});
            gl.clearColor(1,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
            gl.viewport(64,0,64,128); gl.clearColor(0,0,1,1);
            var view={projectionMatrix:perspective(), viewMatrix:camera(0,0,0), width:64, height:128};
            f.renderer.render(0,0,Math.PI/2,{view:view, clear:false});
            assert(pixel(gl,32,64)[0]===255, 'external draw cleared the other viewport');
            f.renderer.render(0,0,Math.PI/2,{view:view});
            assert(pixel(gl,32,64)[2]===255, 'supplying a camera changed default clearing');
            assert(gl.getError()===0, 'multires external view GL error');
        } finally { f.dispose(); }
    });
    test('external multires cameras match classic culling and use view dimensions for tile selection', function() {
        var f=fixture(), program;
        function capture(data) { program=data.program; }
        function nodes() { return program.currentNodes.map(function(node) {return node.path;}).sort().join(); }
        try {
            f.renderer.init({path:'../examples/multires/%l/%s%y%x', extension:'png',
                tileResolution:256, cubeResolution:2048, maxLevel:4},
                'multires', 2*Math.PI, Math.PI, 0, function() {}, {});
            f.renderer.setPose(0.2, -0.15);
            f.renderer.render(0.3, 0.7, Math.PI/2, {roll:0.2, hook:capture});
            var expected=nodes();
            assert(expected.length>0, 'classic culling selected no tiles');
            var view={projectionMatrix:perspective(), viewMatrix:camera(0.3,0.7,0.2), width:128, height:128};
            f.renderer.render(0, 0, Math.PI/2, {view:view});
            assert(nodes()===expected, 'external culling differs from the classic camera');
            view.width=view.height=2048;
            f.renderer.render(0, 0, Math.PI/2, {view:view});
            var large=program.currentNodes.length;
            view.width=view.height=64;
            f.renderer.render(0, 0, Math.PI/2, {view:view});
            assert(program.currentNodes.length<large, 'tile detail ignored the view dimensions');
            f.renderer.render(0.3, 0.7, Math.PI/2, {roll:0.2});
            assert(nodes()===expected, 'classic tile selection retained external dimensions');
            assert(f.gl.getError()===0, 'multires culling GL error');
        } finally { f.dispose(); }
    });
    test('multires preview follows the external camera and returns to classic rendering', function() {
        var f=fixture();
        try {
            f.renderer.init({path:'../examples/multires/1/%s00', extension:'png',
                tileResolution:128, cubeResolution:128, maxLevel:1,
                equirectangularThumbnail:cameraImage()},
                'multires', 2*Math.PI, Math.PI, 0, function() {}, {});
            f.renderer.setPose(0.2, -0.15);
            f.renderer.render(0.3, 0.7, Math.PI/2, {roll:0.2});
            var expected=pixels(f.gl);
            assert(expected[64*128*4+64*4+3]===255, 'preview did not render');
            var view={projectionMatrix:perspective(), viewMatrix:camera(0.3,0.7,0.2), width:128, height:128};
            f.renderer.render(0, 0, Math.PI/2, {view:view});
            comparePixels(pixels(f.gl), expected, 'multires matrix preview');
            f.renderer.render(0.3, 0.7, Math.PI/2, {roll:0.2});
            comparePixels(pixels(f.gl), expected, 'classic preview recovery');
            assert(f.gl.getError()===0, 'multires preview GL error');
        } finally { f.dispose(); }
    });
    return {test:test, run:run, assert:assert, source:source, fixture:fixture, pixel:pixel};
})();
