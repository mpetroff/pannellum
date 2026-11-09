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
    return {test:test, run:run, assert:assert, source:source, fixture:fixture, pixel:pixel};
})();
