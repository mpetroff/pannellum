(function(t) {
    'use strict';
    t.test('nested render-loop ownership resumes only after the final release', async function() {
        var element = document.createElement('div');
        element.style.width = '128px'; element.style.height = '128px';
        document.body.appendChild(element);
        var viewer = pannellum.viewer(element, {panorama:'../examples/examplepano.jpg',autoLoad:true});
        await new Promise(function(resolve) {viewer.on('load',resolve);});
        var renderer = viewer.getRenderer(), draws = 0, resizes = 0;
        var originalRender = renderer.render, originalResize = renderer.resize;
        renderer.render = function() {draws++; return originalRender.apply(renderer,arguments);};
        renderer.resize = function() {resizes++; return originalResize.apply(renderer,arguments);};
        var releaseA = viewer.suspendRendering(), releaseB = viewer.suspendRendering();
        viewer.setYaw(30,false); viewer.resize();
        await new Promise(function(resolve) {requestAnimationFrame(resolve);});
        t.assert(draws===0 && resizes===0,'desktop rendered while suspended');
        releaseA(); releaseA(); viewer.resize();
        t.assert(draws===0 && resizes===0,'nested owner or repeated release resumed early');
        releaseB();
        t.assert(draws>0 && resizes>0,'last release did not restore desktop');
        var events=0, releaseC=viewer.suspendRendering();
        viewer.on('destroy',function(){events++;releaseC();});
        viewer.destroy(); releaseC();
        t.assert(events===1,'destroy cleanup event missing');
        element.remove();
    });
})(rendererTests);
