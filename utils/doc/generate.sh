#!/bin/sh

# Generates API documentation.
# Requires documentationjs <http://documentation.js.org/>.

# Usage:
#
# Regular: ./generate.sh
# Include private methods: ./generate.sh private
# Release: ./generate.sh release

version=`git rev-parse --short=10 @`
private=""

if [ "$1" = "release" ]; then
    version=`cat ../../VERSION`
elif [ "$1" = "private" ]; then
    private="-p"
fi

echo "Generating documentation..."
documentation ../../src/js/pannellum.js ../../src/js/libpannellum.js -o generated_docs -f html --name Pannellum --version $version -g $private
