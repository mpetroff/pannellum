FROM ubuntu:24.04

# docker build -t generate-panorama .
# docker run -it -v $PWD:/data generate-panorama /data/image.jpg

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-dev python3-pip python3-pil hugin-tools \
 && rm -rf /var/lib/apt/lists/*

# Install build dependencies for pyshtools only if binary wheel doesn't exist
RUN pip3 download --no-deps --only-binary :all: pyshtools==4.13.1 || \
    (apt-get install -y --no-install-recommends \
    gcc gfortran libfftw3-dev libopenblas-dev liblapack-dev pkg-config \
 && rm -rf /var/lib/apt/lists/*)
RUN pip3 install --break-system-packages pyshtools==4.13.1

ADD generate.py /generate.py
ENTRYPOINT ["python3", "/generate.py"]
