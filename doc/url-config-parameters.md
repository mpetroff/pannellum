# URL Configuration Parameters

URL parameters are used to configure Pannellum. If an `equirectangular` image
is being used without some of Pannellum's more advanced features, Pannellum can
be configured with just URL parameters; else, a JSON configuration file needs
to be used, using either the `config` parameter or `tour` parameter.


## `config`

Specifies the URL of a JSON configuration file.


## `tour`

Specifies the URL of a JSON tour configuration file.


## Other parameters

A subset of the JSON configuration file options can be used as URL parameters.
These include `author`, `title`, `hfov`, `pitch`, `yaw`, `haov`, `vaov`,
`vOffset`, `autoLoad`, `autoRotate`, `firstScene`, `ignoreGPanoXMP`, and
`fallback`.
