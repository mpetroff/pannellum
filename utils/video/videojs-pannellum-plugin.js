/*
 * Video.js plugin for Pannellum
 * Copyright (c) 2015 Matthew Petroff
 * MIT License
 */

(function(document, videojs, pannellum) {
'use strict';

videojs.plugin('pannellum', function() {
    // Create Pannellum instance
    var player = this;
    var container = player.el();
    var vid = container.getElementsByTagName('video')[0],
        pnlmContainer = document.createElement('div'),
        config = {
            'type': 'equirectangular',
            'dynamic': true,
            'showZoomCtrl': false,
            'showFullscreenCtrl': false,
            'autoLoad': true,
            'panorama': vid
        };
    pnlmContainer.style.visibility = 'hidden';
    var pnlm = pannellum.viewer(pnlmContainer, config);
    container.insertBefore(pnlmContainer, container.firstChild);
    vid.style.display = 'none';

    // Handle update settings
    player.on('play', function() {
        pnlm.setUpdate(true);
    });
    player.on('pause', function() {
        pnlm.setUpdate(false);
    });
    player.on('loadeddata', function() {
        pnlmContainer.style.visibility = 'visible';
    });
    player.on('seeking', function() {
        if (player.paused())
            pnlm.setUpdate(true);
    });
    player.on('seeked', function() {
        if (player.paused())
            pnlm.setUpdate(false);
    });
});

})(document, videojs, pannellum);
