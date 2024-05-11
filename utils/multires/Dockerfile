# syntax=docker/dockerfile:1

FROM ubuntu:24.04

# docker build -t generate-panorama .
# docker run -it -v $PWD:/data generate-panorama /data/image.jpg

# renovate: datasource=repology depName=ubuntu_24_04/python3-defaults versioning=loose
ARG PYTHON3_VERSION="3.12.3-0ubuntu1"

# renovate: datasource=repology depName=ubuntu_24_04/numpy versioning=loose
ARG PYTHON3_NUMPY_VERSION="1:1.26.4+ds-6ubuntu1"

# renovate: datasource=repology depName=ubuntu_24_04/python-pip versioning=loose
ARG PYTHON3_PIP_VERSION="24.0+dfsg-1ubuntu1"

# renovate: datasource=repology depName=ubuntu_24_04/pillow versioning=loose
ARG PYTHON3_PIL_VERSION="10.2.0-1ubuntu1"

# renovate: datasource=repology depName=ubuntu_24_04/hugin versioning=loose
ARG HUGIN_VERSION="2023.0.0+dfsg-1build4"

# pyshtools dependencies

# renovate: datasource=repology depName=ubuntu_24_04/python3-astropy versioning=loose
ARG PYTHON3_ASTROPY_VERSION="6.0.0-1ubuntu2"

# renovate: datasource=repology depName=ubuntu_24_04/python3-matplotlib versioning=loose
ARG PYTHON3_MATPLOTLIB_VERSION="3.6.3-1ubuntu5"

# renovate: datasource=repology depName=ubuntu_24_04/python3-pooch versioning=loose
ARG PYTHON3_POOCH_VERSION="1.8.1-1"

# renovate: datasource=repology depName=ubuntu_24_04/requests versioning=loose
ARG PYTHON3_REQUESTS_VERSION="2.31.0+dfsg-1ubuntu1"

# renovate: datasource=repology depName=ubuntu_24_04/python3-tqdm versioning=loose
ARG PYTHON3_TQDM_VERSION="4.66.2-2"

# renovate: datasource=repology depName=ubuntu_24_04/python3-xarray versioning=loose
ARG PYTHON3_XARRAY_VERSION="2024.02.0-2"

ENV DEBIAN_FRONTEND noninteractive

RUN set -eux; \
# installation
        apt-get update; \
        apt-get full-upgrade -y; \
        apt-get install -y --no-install-recommends \
                python3=${PYTHON3_VERSION} \
                python3-dev=${PYTHON3_VERSION} \
                python3-numpy=${PYTHON3_NUMPY_VERSION} \
                python3-pip=${PYTHON3_PIP_VERSION} \
                python3-pil=${PYTHON3_PIL_VERSION} \
                hugin-tools=${HUGIN_VERSION} \
                python3-astropy=${PYTHON3_ASTROPY_VERSION} \
                python3-matplotlib=${PYTHON3_MATPLOTLIB_VERSION} \
                python3-pooch=${PYTHON3_POOCH_VERSION} \
                python3-requests=${PYTHON3_REQUESTS_VERSION} \
                python3-tqdm=${PYTHON3_TQDM_VERSION} \
                python3-xarray=${PYTHON3_XARRAY_VERSION} \
                ; \
        apt-get remove --purge --auto-remove -y; \
        rm -rf /var/lib/apt/lists/*;

RUN pip3 install --break-system-packages pyshtools

ADD generate.py /generate.py
ENTRYPOINT ["python3", "/generate.py"]
