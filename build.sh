#!/bin/bash
set -e

echo "Setting executable permissions..."
chmod +x node_modules/.bin/*

echo "Running Vite build..."
npx vite build

echo "Build completed successfully!"
