# Pannellum

[![Build Status](https://travis-ci.org/mpetroff/pannellum.svg?branch=master)](https://travis-ci.org/mpetroff/pannellum)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3334433.svg)](https://doi.org/10.5281/zenodo.3334433)

## About

Pannellum is a lightweight, free, and open source panorama viewer for the web. Built using HTML5, CSS3, JavaScript, and WebGL, it is plug-in free. It can be deployed easily as a single file, just 21kB gzipped, and then embedded into pages as an `<iframe>`. A configuration utility is included to generate the required code for embedding. An API is included for more advanced integrations.

## How to use
1. Upload `build/pannellum.htm` and a full equirectangular panorama to a web server.
    * Due to browser security restrictions, a web server must be used locally as well. With Python 2, one can use `python -m SimpleHTTPServer`, and with Python 3, one can use `python -m http.server`, but any other web server will work as well.
2. Use the included multi-resolution generator (`utils/multires/generate.py`) or configuration tool (`utils/config/configuration.htm`).
3. Insert the generated `<iframe>` code into a page.

Configuration parameters are documented in the `doc/json-config-parameters.md` file, which is also available at [pannellum.org/documentation/reference/](https://pannellum.org/documentation/reference). API methods are documented inline with [JSDoc](https://jsdoc.app/) comments, and generated documentation is available at [pannellum.org/documentation/api/](https://pannellum.org/documentation/api/).

### Using `generate.py` to create multires panoramas
To be able to create multiresolution panoramas, you need to have the `nona` program installed, which is available as part of [Hugin](http://hugin.sourceforge.net/), as well as Python with the [Pillow](https://pillow.readthedocs.org/) package. Then, run

```
python generate.py pano_image.jpg
```

in the `utils/multires` directory. This will generate all the image tiles and the `config.json` file in the `./output` folder by default. For this to work, `nona` needs to be on the system path; otherwise, the location of `nona` can be specified using the `-n` flag, e.g. `python generate.py -n /path/to/nona pano_image.jpg`.

## Examples

Examples using both the minified version and the version in the `src` directory are included in the `examples` directory. Additional examples are available at [pannellum.org](https://pannellum.org/documentation/examples/simple-example/).

## Browser Compatibility

Since Pannellum is built with web standards, it requires a modern browser to function.

#### Full support (with appropriate graphics drivers):
* Firefox 23+
* Chrome 24+
* Safari 8+
* Internet Explorer 11+
* Edge

The support list is based on feature support. As only recent browsers are tested, there may be regressions in older browsers.

#### Not officially supported:

Mobile / app frameworks are not officially supported. They may work, but they're not tested and are not the targeted platform.

## Translations

All user-facing strings can be changed using the `strings` configuration parameter. There exists a [third-party respository of user-contributed translations](https://github.com/DanielBiegler/pannellum-translation) that can be used with this configuration option.

## Building
The `utils` folder contains the required build tools, with the exception of Python 3.2+ and Java installations. To build a minified version of Pannellum, run either `build.sh` or `build.bat` depending on your platform.

## Tests
A limited [Selenium](https://www.seleniumhq.org/)-based test suite is located in the `tests` directory. The tests can be executed by running `python3 run_tests.py`. Running the tests requires Python 3, the Selenium Python bindings, Firefox, [geckodriver](https://github.com/mozilla/geckodriver), [Pillow](https://pillow.readthedocs.io/), and [NumPy](https://www.numpy.org/).

## Contributing
Development takes place at [github.com/mpetroff/pannellum](https://github.com/mpetroff/pannellum). Issues should be opened to report bugs or suggest improvements (or ask questions), and pull requests are welcome. When reporting a bug, please try to include a minimum reproducible example (or at least some sort of example). When proposing changes, please try to match the existing code style, e.g., four space indentation and [JSHint](https://jshint.com/) validation. If your pull request adds an additional configuration parameter, please document it in `doc/json-config-parameters.md`.

## License
Pannellum is distributed under the MIT License. For more information, read the file `COPYING` or peruse the license [online](https://github.com/mpetroff/pannellum/blob/master/COPYING).

In the past, parts of Pannellum were based on [three.js](https://github.com/mrdoob/three.js) r40, which is licensed under the [MIT License](https://github.com/mrdoob/three.js/blob/44a8652c37e576d51a7edd97b0f99f00784c3db7/LICENSE).

The panoramic image provided with the examples is licensed under the [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-sa/3.0/).

## Credits

* [Matthew Petroff](http://mpetroff.net/), Original Author
* [three.js](https://github.com/mrdoob/three.js) r40, Former Underlying Framework
