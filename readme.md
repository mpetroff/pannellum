# Pannellum

[![Build Status](https://travis-ci.org/mpetroff/pannellum.svg?branch=master)](https://travis-ci.org/mpetroff/pannellum)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3334433.svg)](https://doi.org/10.5281/zenodo.3334433)
[![DOI](https://joss.theoj.org/papers/10.21105/joss.01628/status.svg)](https://doi.org/10.21105/joss.01628)

## About

Pannellum is a lightweight, free, and open source panorama viewer for the web. Built using HTML5, CSS3, JavaScript, and WebGL, it is plug-in free. It can be deployed easily as a single file, just 21kB gzipped, and then embedded into pages as an `<iframe>`. A configuration utility is included to generate the required code for embedding. An API is included for more advanced integrations.

## Getting started

### Hosted examples

A set of [examples](https://pannellum.org/documentation/examples/simple-example/) that demonstrate the viewer's various functionality is hosted on [pannellum.org](https://pannellum.org/). This is the best place to start if you want an overview of Pannellum's functionality. They also provide helpful starting points for creating custom configurations.

### Simple tutorial and configuration utility

If you are just looking to display a single panorama without any advanced functionality, the steps for doing so are covered on the [simple tutorial page](https://pannellum.org/documentation/overview/tutorial/). Said page also includes a utility for easily creating the necessary Pannellum configuration.

### Local testing and self-hosting

If you would like to locally test or self-host Pannellum, continue to the _How to use_ section below.

## How to use
1. Upload `build/pannellum.htm` and a full equirectangular panorama to a web server or run a development web server locally.
    * Due to browser security restrictions, _a web server must be used locally as well_. With Python 3, one can use `python3 -m http.server`, but any other web server should also work.
2. Use the included multi-resolution generator (`utils/multires/generate.py`), the configuration tool (`utils/config/configuration.htm`), or create a configuration from scratch or based on an [example](https://pannellum.org/documentation/examples/simple-example/).
3. Insert the generated `<iframe>` code into a page, or create a more advanced configuration with [JSON](https://pannellum.org/documentation/reference) or the [API](https://pannellum.org/documentation/api/).

Configuration parameters are documented in the `doc/json-config-parameters.md` file, which is also available at [pannellum.org/documentation/reference/](https://pannellum.org/documentation/reference). API methods are documented inline with [JSDoc](https://jsdoc.app/) comments, and generated documentation is available at [pannellum.org/documentation/api/](https://pannellum.org/documentation/api/).

### Using a minified copy

For final deployment, it is recommended that one use a minified copy of Pannellum instead of using the source files in `src` directly. The easiest method is to download the most recent [release](https://github.com/mpetroff/pannellum/releases) and use the pre-built copy of either `pannellum.htm` or `pannellum.js` & `pannellum.css`. If you wish to make changes to Pannellum or use the latest development copy of the code, follow the instructions in the _Building_ section below to create `build/pannellum.htm`, `build/pannellum.js`, and `build/pannellum.css`.

### Using `generate.py` to create multires panoramas
To be able to create multiresolution panoramas, you need to have the `nona` program installed, which is available as part of [Hugin](http://hugin.sourceforge.net/), as well as Python with the [Pillow](https://pillow.readthedocs.org/) package. Then, run

```
python3 generate.py pano_image.jpg
```

in the `utils/multires` directory. This will generate all the image tiles and the `config.json` file in the `./output` folder by default. For this to work, `nona` needs to be on the system path; otherwise, the location of `nona` can be specified using the `-n` flag. On a Unix-like platform, with `nona` already on the system path use:

```bash
$ cd utils/multires
$ python3 generate.py pano_image.jpg
```

where `pano_image.jpg` is the filename of your equirectangular panorama. If `nona` is not on the system path, use:

```bash
$ cd utils/multires
$ python3 generate.py -n /path/to/nona pano_image.jpg
```

For a complete list of options, run:

```bash
$ python3 generate.py --help
```

To view the generated configuration, run:

```bash
$ cd ../..
$ python3 -m http.server
```

This goes back to the root directory of the repository and starts a local development web server. Then open http://localhost:8000/src/standalone/pannellum.htm?config=../../utils/multires/output/config.json in your web browser of choice.


## Bundled examples

Examples using both the minified version and the version in the `src` directory are included in the `examples` directory. These can be viewed by starting a local web server in the root of the repository, e.g., by running:
```bash
$ python3 -m http.server
```
in the directory containing this readme file, and then navigating to the hosted HTML files using a web browser; note that the examples use files from the `src` directory, so **the web server must be started from the repository root, not the `examples` directory**. For the `example-minified.htm` example to work, a minified copy of Pannellum must first be built; see the _Building_ section below for details.

Additional examples are available at [pannellum.org](https://pannellum.org/documentation/examples/simple-example/).

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
The `utils` folder contains the required build tools, with the exception of Python 3.2+ and Java installations. To build a minified version of Pannellum, run either `build.sh` or `build.bat` depending on your platform. On a Unix-like platform:

```bash
$ cd utils/build
$ ./build.sh
```

If successful, this should create `build/pannellum.htm`, `build/pannellum.js`, and `build/pannellum.css`, relative to the root directory of the repository.

## Tests

A minimal [Selenium](https://www.seleniumhq.org/)-based test suite is located in the `tests` directory. The tests can be executed by running:

```bash
python3 run_tests.py
```

A Selenium-driven web browser (with a Chrome driver, by default) is created, and screenshots are generated
and compared against previously generated ones in [tests](tests). For example, to regenerate the screenshots
one can run:

```bash
$ python3 tests/run_tests.py --create-ref
```

And to simply run the tests to compare to, eliminate that argument. By default, a random
port is selected, along with other arguments. One can see usage via:

```bash
$ python tests/run_tests.py --help
```

Continuous integration tests are run via [Travis CI](https://travis-ci.org/mpetroff/pannellum). Running the tests locally requires Python 3, the Selenium Python bindings, [Pillow](https://pillow.readthedocs.io/), [NumPy](https://www.numpy.org/), and either Firefox & [geckodriver](https://github.com/mozilla/geckodriver) or Chrome & [ChromeDriver](https://chromedriver.chromium.org/).

## Seeking support
If you wish to ask a question or report a bug, please open an issue at [github.com/mpetroff/pannellum](https://github.com/mpetroff/pannellum). See the _Contributing_ section below for more details.

## Contributing
Development takes place at [github.com/mpetroff/pannellum](https://github.com/mpetroff/pannellum). Issues should be opened to report bugs or suggest improvements (or ask questions), and pull requests are welcome. When reporting a bug, please try to include a minimum reproducible example (or at least some sort of example). When proposing changes, please try to match the existing code style, e.g., four space indentation and [JSHint](https://jshint.com/) validation. If your pull request adds an additional configuration parameter, please document it in `doc/json-config-parameters.md`. Pull requests should preferably be created from [feature branches](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow).

## License
Pannellum is distributed under the MIT License. For more information, read the file `COPYING` or peruse the license [online](https://github.com/mpetroff/pannellum/blob/master/COPYING).

In the past, parts of Pannellum were based on [three.js](https://github.com/mrdoob/three.js) r40, which is licensed under the [MIT License](https://github.com/mrdoob/three.js/blob/44a8652c37e576d51a7edd97b0f99f00784c3db7/LICENSE).

The panoramic image provided with the examples is licensed under the [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-sa/3.0/).

## Credits

* [Matthew Petroff](http://mpetroff.net/), Original Author
* [three.js](https://github.com/mrdoob/three.js) r40, Former Underlying Framework

If used as part of academic research, please cite:

> Petroff, Matthew A. "Pannellum: a lightweight web-based panorama viewer." _Journal of Open Source Software_ 4, no. 40 (2019): 1628. [doi:10.21105/joss.01628](https://doi.org/10.21105/joss.01628)
