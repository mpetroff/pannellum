FROM ubuntu:18.04

# docker build -t generate-panorama .
# docker run -it -v $PWD:/data generate-panorama /data/image.png

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
    apt-get install -y python3 python3-dev software-properties-common && \
    add-apt-repository ppa:ubuntuhandbook1/apps && \
    apt-get update && \
    apt-get install -y hugin

RUN apt-get install -y wget && \
    wget https://bootstrap.pypa.io/get-pip.py && \
    python3 get-pip.py && \
    pip3 install Pillow

ADD generate.py /generate.py
ENTRYPOINT ["python3", "/generate.py"]
