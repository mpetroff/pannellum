# Generating multi-resolution tiles for a panorama

## Get a Panorama
If you don't have your own, it's easy to use one of the examples in the repository.
From this directory, run:

```bash
$ cp ../../examples/examplepano.jpg .
```

## Generate tiles

To use the `generate.py` script, either its dependencies need to be installed,
or [Docker](https://www.docker.com/) can be used to avoid this installation.

### Option 1: with local dependencies

The `generate.py` script depends on `nona` (from [Hugin](http://hugin.sourceforge.net/)),
as well as Python with the [Pillow](https://pillow.readthedocs.org/) package. On Ubuntu,
these dependencies can be installed by running:

```bash
$ sudo apt install python3 python3-pil hugin-tools
```

Once the dependencies are installed, a tileset can generated with:

```bash
$ python3 generate.py examplepano.jpg
Processing input image information...
Assuming --haov 360.0
Assuming --vaov 180.0
Generating cube faces...
Generating tiles...
Generating fallback tiles...
```


### Option 2: with Docker

A small Dockerfile is provided that allows one to easily generate a panorama tileset
with the [generate.py](generate.py) script, without needing to install dependencies
on one's host.

First, build the Docker container:

```bash
$ docker build -t generate-panorama .
```

When it's finished, you can bind the present working directory to a location in 
the container (`/data`) so that your image is found in the container. Notice
that the output needs to be specified in a directory that is bound to the host:

```bash
$ docker run -it -v $PWD:/data generate-panorama --output /data/output /data/examplepano.jpg
Processing input image information...
Assuming --haov 360.0
Assuming --vaov 180.0
Generating cube faces...
Generating tiles...
Generating fallback tiles...
```

## Viewing output (for either method)

The final output will be in your present working directory:

```bash
$ ls output/
1  2  3  config.json  fallback
```

Next, change back to the root and start a server:

```bash
$ cd ../..
$ python3 -m http.server
```

A generated tileset and configuration in `utils/multires/output` can then be viewed by navigating a browser to:

[http://localhost:8000/src/standalone/pannellum.htm?config=../../utils/multires/output/config.json](http://localhost:8000/src/standalone/pannellum.htm?config=../../utils/multires/output/config.json)

When the page is loaded, the console will output a logging stream corresponding to the HTTP requests:

```bash
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /src/standalone/pannellum.htm?config=../../utils/multires/output/config.json HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /src/css/pannellum.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /src/standalone/standalone.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /src/js/libpannellum.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /src/js/pannellum.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /src/standalone/standalone.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /utils/multires/output/config.json HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /src/css/img/background.svg HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /src/css/img/sprites.svg HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:24] "GET /src/css/img/compass.svg HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:26] "GET /src/css/img/grab.svg HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:27] "GET /utils/multires/output//1/r0_0.jpg HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:27] "GET /utils/multires/output//1/f0_0.jpg HTTP/1.1" 200 -
127.0.0.1 - - [09/Aug/2019 09:41:27] "GET /utils/multires/output//1/u0_0.jpg HTTP/1.1" 200 -
...
```

The panorama, in multi-resolution format, should display in the browser.
