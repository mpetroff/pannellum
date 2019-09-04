#!/bin/sh

# Generates API documentation.
# Requires documentationjs <https://documentation.js.org/>.

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
documentation build ../../src/js/pannellum.js ../../src/js/libpannellum.js -o generated_docs -f html --project-name Pannellum --project-version $version -g $private
