FROM ubuntu:18.04

# docker build -t generate-panorama .
# docker run -it -v $PWD:/data generate-panorama /data/image.jpg

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
    apt-get install -y python3 python3-dev python3-pil hugin-tools

ADD generate.py /generate.py
ENTRYPOINT ["python3", "/generate.py"]
