# Pannellum

## About

Pannellum is a lightweight, free, and open source panorama viewer for the web. Built using HTML5, CSS3, JavaScript, and WebGL, it is plug-in free. It can be deployed easily as a single file, just 15kB gzipped, and then embedded into pages as an `<iframe>`. A configuration utility is included to generate the required code for embedding.

## Documentation
* [Live Examples](https://pannellum.org/documentation/examples/simple-example/)
* [Configuration](https://pannellum.org/documentation/reference/)
* [API](https://pannellum.org/documentation/api/)

## Using with NPM
```
npm i --save github:saidmoya12/pannellum
```

### Usage of npm module
```
import pannellum 		from 'pannellum';
...
let viewer = pannellum.viewer('elementID', [configuration]);
```

Tested with React
*Node SERVER is not required!*

## Examples

Examples using both the minified version and the version in the `src` directory are included in the `examples` directory.

## Browser Compatibility

Since Pannellum is built with recent web standards, it requires a modern browser to function.

#### Full support (with appropriate graphics drivers):
* Firefox 10+
* Chrome 15+
* Safari 8+
* Internet Explorer 11+
* Edge

#### Almost full support (no full screen):
* Firefox 4+
* Chrome 9+

#### Partial support (WebGL support must first be enabled in preferences)

* Safari 5.1+

#### No support:
Internet Explorer 10 and previous

#### Not officially supported:

Mobile / app frameworks are not officially supported. They may work, but they're not tested and are not the targeted platform.

## Translations

All user-facing strings can be changed using the `strings` configuration parameter. There exists a [third-party respository of user-contributed translations](https://github.com/DanielBiegler/pannellum-translation) that can be used with this configuration option.

## Building
### using python
The `utils` folder contains the required build tools, with the exception of Python 3.2+ and Java installations. To build a minified version of Pannellum, run either `build.sh` or `build.bat` depending on your platform.

### using npm
1. Clone the repository

2. In pannellum folder use:
```
npm install
```
3. Enjoy your code

4. Compile your modifications (Babelify and compression)
```
npm run build
```

## License
Pannellum is distributed under the MIT License. For more information, read the file `COPYING` or peruse the license [online](https://github.com/mpetroff/pannellum/blob/master/COPYING).

In the past, parts of Pannellum were based on [three.js](https://github.com/mrdoob/three.js) r40, which is licensed under the [MIT License](https://github.com/mrdoob/three.js/blob/44a8652c37e576d51a7edd97b0f99f00784c3db7/LICENSE).

The panoramic image provided with the examples is licensed under the [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-sa/3.0/).

## Credits

* [Matthew Petroff](http://mpetroff.net/), Original Author
* [three.js](https://github.com/mrdoob/three.js) r40, Former Underlying Framework
