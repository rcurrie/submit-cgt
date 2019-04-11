FROM ubuntu:18.04

RUN apt-get update && apt-get upgrade -y 

# svs/pathology file handling
RUN apt-get install -y \
  libvips libvips-dev libvips-tools

WORKDIR /app
ADD . /app
