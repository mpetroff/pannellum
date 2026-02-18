function anError(error) {
    var errorMsg = document.createElement('div');
    errorMsg.className = 'pnlm-info-box';
    var p = document.createElement('p');
    p.textContent = error;
    errorMsg.appendChild(p);
    document.getElementById('container').appendChild(errorMsg);
}

var viewer;
function parseURLParameters() {
    var url;
    if (window.location.hash.length > 0) {
        // Prefered method since parameters aren't sent to server
        url = window.location.hash.slice(1);
    } else {
        url = window.location.search.slice(1);
    }
    if (!url) {
        // Display error if no configuration parameters are specified
        anError('No configuration options were specified.');
        return;
    }
    url = url.split('&');
    var configFromURL = {};
    for (var i = 0; i < url.length; i++) {
        var option = url[i].split('=')[0];
        var value = url[i].split('=')[1];
        if (value == '')
            continue; // Skip options with empty values in URL config
        switch(option) {
            case 'hfov': case 'pitch': case 'yaw': case 'haov': case 'vaov':
            case 'minHfov': case 'maxHfov': case 'minPitch': case 'maxPitch':
            case 'minYaw': case 'maxYaw': case 'vOffset': case 'autoRotate':
                configFromURL[option] = Number(value);
                break;
            case 'autoLoad': case 'ignoreGPanoXMP':
                configFromURL[option] = JSON.parse(value);
                break;
            case 'author': case 'title': case 'firstScene': case 'fallback':
            case 'preview': case 'panorama': case 'config':
                configFromURL[option] = decodeURIComponent(value);
                break;
            default:
                anError('An invalid configuration parameter was specified: ' + option);
                return;
        }
    }

    var request;

    // Check for JSON configuration file
    if (configFromURL.config) {
        var configUrl;
        try {
            configUrl = new URL(configFromURL.config, window.location.href);
        } catch(err) {
            anError('Invalid config URL specified.');
            return;
        }

        // Prohibit cross-origin requests, to mitigate XSS risk
        if (configUrl.origin !== window.location.origin) {
            anError('Config URL must be on same origin.');
            return;
        }

        // Get JSON configuration file
        request = new XMLHttpRequest();
        request.onload = function() {
            if (request.status != 200) {
                // Display error if JSON can't be loaded
                var a = document.createElement('a');
                a.href = configUrl;
                a.textContent = a.href;
                anError('The file ' + a.outerHTML + ' could not be accessed.');
                return;
            }

            var responseMap = JSON.parse(request.responseText);

            // Set JSON file location
            if (responseMap.basePath === undefined) {
                var configUrlStr = String(configUrl);
                responseMap.basePath = configUrlStr.substring(0, configUrlStr.lastIndexOf('/') + 1);
            }

            // Merge options
            for (var key in responseMap) {
                if (configFromURL.hasOwnProperty(key)) {
                    continue;
                }
                configFromURL[key] = responseMap[key];
            }

            // Set title
            if ('title' in configFromURL)
                document.title = configFromURL.title;

            // Create viewer
            configFromURL.escapeHTML = true;
            viewer = pannellum.viewer('container', configFromURL);
        };
        request.open('GET', configUrl);
        request.send();
        return;
    }

    // Set title
    if ('title' in configFromURL)
        document.title = configFromURL.title;

    // Create viewer
    configFromURL.escapeHTML = true;
    viewer = pannellum.viewer('container', configFromURL);
}

// Display error if opened from local file
if (window.location.protocol == 'file:') {
    anError('Due to browser security restrictions, Pannellum can\'t be run ' +
        'from the local filesystem; some sort of web server must be used.');
} else {
    // Initialize viewer
    parseURLParameters();
}
