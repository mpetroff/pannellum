# Generate a Panorama

This is a small Dockerfile that will allow you to easily generate a panorama
with the [generate.py](generate.py), without needing to install dependencies
on your host.

## Get a Panorama
If you don't have your own, it's easy to use one of the examples in the repository.
From this folder:

```bash
$ cp ../../examples/examplepano.jpg .
```

Then build the Docker container:

```bash
$ docker build -t generate-panorama .
```

When it's finished, you can bind the present working directory to a location in 
the container (/data) so that your image is found in the container. Notice
that we also need to specify the output to be in a directory that is bound
to our host:

```
$ docker run -it -v $PWD:/data generate-panorama --output /data/output /data/examplepano.jpg
Processing input image information...
Assuming --haov 360.0
Assuming --vaov 180.0
Generating cube faces...
Generating tiles...
Generating fallback tiles...
```

The final output will be in your present working directory,

```
$ ls output/
1  2  3  config.json  fallback
```

Now let's cd back to the root and start a server:

```bash
$ cd ../..
$ python3 -m http.server
```

Given a config folder in `utils/multires/config` we would want to open the browser to

[http://localhost:8000/src/standalone/pannellum.htm?config=../../utils/multires/output/config.json](http://localhost:8000/src/standalone/pannellum.htm?config=../../utils/multires/output/config.json)

And as you load the panorama, you'll see lots of output in the console! Good job,
you're done!

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
