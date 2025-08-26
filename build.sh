#!/bin/bash

# Build script for Hugo site
echo "Building Hugo site..."

# Clean previous build
if [ -d "public" ]; then
    rm -rf public
fi

# Build the site
hugo --gc --minify

echo "Build complete!"
echo "Files generated in ./public directory"