# Pannellum

## About

Pannellum is a lightweight, free, and open source panorama viewer for the web. Built using HTML5, CSS3, JavaScript, and WebGL, it is plug-in free. It can be deployed easily as a single file, just 18kB gzipped, and then embedded into pages as an `<iframe>`. A configuration utility is included to generate the required code for embedding.

## How to use
1. Upload `build/pannellum.htm` and a full equirectangular panorama to a web server.
    * Due to browser security restrictions, a web server must be used locally as well. With Python 2, one can use `python -m SimpleHTTPServer`, and with Python 3, one can use `python -m http.server`, but any other web server will work as well.
2. Use the included configuration tool (`utils/config/configuration.htm`).
    * `Pannellum Location` is the address of `pannellum.htm` and can be either a full or relative path (relative to the page containing the `<iframe>`).
    * `Panorama URL` is the address of the panorama image file and can be either a full or relative path (relative to `pannellum.htm`).
    * `Basic Information` is optional. If provided, it is displayed in the bottom left corner.
    * `Embed Size` is the dimensions of the `<iframe>`.
    * `Auto Load` loads the panorama when the page is loaded. If left unchecked, the user must click to load the panorama.
    * `Generate` creates the embed code that can then be copied wherever desired.
3. Insert the generated `<iframe>` code into a page.

## Examples

Examples using both the minified version and the version in the `src` directory are included in the `examples` directory.

## Browser Compatibility

Since Pannellum is built with emerging web standards, it requires a modern browser to function.

#### Full support (with appropriate graphics drivers):
* Firefox 10+
* Chrome 15+
* Safari 5.1+ (WebGL support must first be enabled in preferences)
* Internet Explorer 11+

#### Almost full support (no full screen):
* Firefox 4+
* Chrome 9+
* Opera 12+ (WebGL support must first be enabled in preferences)

#### No support:
Internet Explorer 10 and previous

## Building
The `utils` folder contains the required build tools, with the exception of Python 3.2+ and Java installations. To build a minified version of Pannellum, run either `build.sh` or `build.bat` depending on your platform.

## License
Pannellum is distributed under the MIT License. For more information, read the file `COPYING` or peruse the license [online](http://www.opensource.org/licenses/MIT).

In the past, parts of Pannellum were based on [three.js](https://github.com/mrdoob/three.js) r40, which is licensed under the [MIT License](https://github.com/mrdoob/three.js/blob/44a8652c37e576d51a7edd97b0f99f00784c3db7/LICENSE).

The panoramic image provided with the examples is licensed under the [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-sa/3.0/).

## Credits

* [Matthew Petroff](http://www.mpetroff.net/), Original Author
* [three.js](https://github.com/mrdoob/three.js) r40, Former Underlying Framework
