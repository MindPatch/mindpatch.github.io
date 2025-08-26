#!/bin/bash

# Build script for Hugo site
echo "Building Hugo site..."

# Clean previous build
if [ -d "public" ]; then
    rm -rf public
fi

# Build the site for production
hugo --gc --minify --baseURL "https://www.mindpatch.net/"

echo "Build complete!"
echo "Files generated in ./public directory"
echo "Built for production with base URL: https://www.mindpatch.net/"