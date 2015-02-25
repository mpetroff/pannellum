# Pannellum

## About

Pannellum is a lightweight, free, and open source panorama viewer for the web. Built using HTML5, CSS3, JavaScript, and WebGL, it is plug-in free. It can be deployed easily as a single file, just 13kB gzipped, and then embedded into pages as an `<iframe>`. A configuration utility is included to generate the required code for embedding.

## How to use
1. Upload `build/pannellum.htm` and a full equirectangular panorama to a web server.
    * Due to browser security restrictions, a web server must be used locally as well. With Python 2, one can use `python -m SimpleHTTPServer`, and with Python 3, one can use `python -m http.server`, but any other web server will work as well.
2. Use the included multi-resolution generator (`utils/multires/generate.py`) or configuration tool (`utils/config/configuration.htm`).
3. Insert the generated `<iframe>` code into a page.

### Using `generate.py` to create multires panoramas
To be able to create multiresolution panoramas, you need to have the `nona` program installed, which is available as part of [Hugin](http://hugin.sourceforge.net/), as well as Python with the [Pillow](https://pillow.readthedocs.org/) package. Then, run

```
python generate.py pano_image.jpg
```

in the `utils/multires` directory. This will generate all the image tiles and the `config.json` file in the `./output` folder by default. For this to work, `nona` needs to be on the system path; otherwise, the location of `nona` can be specified using the `-n` flag, e.g. `python generate.py -n /path/to/nona pano_image.jpg`.

## Examples

Examples using both the minified version and the version in the `src` directory are included in the `examples` directory.

## Browser Compatibility

Since Pannellum is built with emerging web standards, it requires a modern browser to function.

#### Full support (with appropriate graphics drivers):
* Firefox 10+
* Chrome 15+
* Safari 8+
* Internet Explorer 11+

#### Almost full support (no full screen):
* Firefox 4+
* Chrome 9+

#### Partial support (WebGL support must first be enabled in preferences)

* Safari 5.1+

#### No support:
Internet Explorer 10 and previous

## Building
The `utils` folder contains the required build tools, with the exception of Python 3.2+ and Java installations. To build a minified version of Pannellum, run either `build.sh` or `build.bat` depending on your platform.

## License
Pannellum is distributed under the MIT License. For more information, read the file `COPYING` or peruse the license [online](https://github.com/mpetroff/pannellum/blob/master/COPYING).

In the past, parts of Pannellum were based on [three.js](https://github.com/mrdoob/three.js) r40, which is licensed under the [MIT License](https://github.com/mrdoob/three.js/blob/44a8652c37e576d51a7edd97b0f99f00784c3db7/LICENSE).

The panoramic image provided with the examples is licensed under the [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-sa/3.0/).

## Credits

* [Matthew Petroff](http://mpetroff.net/), Original Author
* [three.js](https://github.com/mrdoob/three.js) r40, Former Underlying Framework
