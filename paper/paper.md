---
title: 'Pannellum: a lightweight web-based panorama viewer'
tags:
  - panoramas
  - visualization
  - WebGL
authors:
 - name: Matthew A. Petroff
   orcid: 0000-0002-4436-4215
   affiliation: 1
affiliations:
 - name: Department of Physics & Astronomy, Johns Hopkins University, Baltimore, Maryland 21218, USA
   index: 1
date: 15 July 2019
bibliography: paper.bib
---

# Summary

_Pannellum_ is an interactive web browser-based panorama viewer written in
JavaScript and primarily based on the WebGL web standard [@WebGL] for graphics
processing unit (GPU)-accelerated rendering to the HTML5 ``<canvas>`` element
[@Canvas]. It supports the display of panoramic images that cover the full
sphere, or only parts of it, in equirectangular format, in cube map format, or
in a tiled format that encodes the panorama in multiple resolutions, which
allows for parts of the panorama to be dynamically loaded, reducing data
transfer requirements. In addition to single panoramas, multiple panoramas can
be linked together into a virtual tour, with navigation enabled via
"hot spots," which can also be used to add annotations.

The display of interactive panoramic images on the web dates back to the
mid-1990s, with the development of Apple's QuickTime VR format and associated
web browser plug-ins [@Chen1995]. When development on _Pannellum_ started in
2011, WebGL was a nascent technology, and the majority of existing panorama
viewers for websites were then still based on Java or Adobe Flash plug-ins,
which had supplanted QuickTime as the technology of choice. Since then, both
the viewer and underlying technologies have matured immensely. As an aside, the
name _Pannellum_ was derived as a portmanteau of "panorama" and "vellum," as
this made a unique, pronounceable word, with "vellum" used as a quasi-synonym
to the ``<canvas>`` drawing surface used by the viewer.

An application programming interface (API) is provided, which allows external
code to control the viewer and implement features such as custom buttons or
integration with other webpage elements. One such example is integrating the
viewer with a map [@Gede2015; @Albrizio2013; @OSM2018]; the locations where
panoramas were taken can be displayed as markers on the map, whereby clicking a
marker will open the corresponding panorama in the viewer. Panoramic
videos---videos that cover up to a full 360 degrees of azimuth---are supported
via a bundled extension, which is built using
the API. The viewer's underlying rendering code is separate from its user interface
code, which allows for more extensive customization and tighter integration
with external code, if desired. This rendering code uses a pinhole camera model
for equirectangular panoramas implemented as a WebGL fragment shader, instead
of the more common---and less accurate---approach of mapping the panorama onto
a geometric approximation of a sphere.

_Pannellum_ has proven useful in various fields, when the display of panoramic
images is needed to help digest or present information. These research
applications range from cartography [@Gede2015] to digital humanities
[@Srinivasan2018; @Mohr2018] to archaeology [@Albrizio2013] to medical
education [@Herault2018]. It has also found use in public outreach
applications, such as its use by the European Southern Observatory to display
panoramas of their observatories [@ESO2017]. _Pannellum_ is intended to be used
any time an interactive panorama needs to be displayed on a webpage, be it an
internal research application or a publicly accessible website. It may also
work with certain mobile application frameworks, but such use is not officially
supported. [Documentation](https://pannellum.org/documentation/overview/) and
[interactive examples](https://pannellum.org/documentation/examples/simple-example/)
are provided at [pannellum.org](https://pannellum.org/).

# References
