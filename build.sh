#!/bin/bash
# Rise Extension Build Script
# Packages the extension into clean zip files for Chrome Web Store and Firefox AMO.

echo "========================================"
echo "Building Rise Browser Extension..."
echo "========================================"

# Reference target project directory
PROJECT_DIR="/Users/mohsen/Projects/Rise"

# Clean existing build directory
if [ -d "$PROJECT_DIR/dist" ]; then
    echo "Cleaning existing dist/ directory..."
    rm -rf "$PROJECT_DIR/dist"
fi

mkdir -p "$PROJECT_DIR/dist"

# Pack the extension using zip
echo "Packaging core extension assets (excluding dev templates & scripts)..."
cd "$PROJECT_DIR"

# Zip only files needed for extension loading
zip -q -r "dist/rise-chrome.zip" manifest.json newtab.html newtab.css newtab.js icons/

# Duplicate package for Firefox submission
cp "dist/rise-chrome.zip" "dist/rise-firefox.zip"

echo "----------------------------------------"
echo "Build completed successfully!"
echo "Output packages created:"
echo "  -> dist/rise-chrome.zip (Size: $(du -sh dist/rise-chrome.zip | cut -f1))"
echo "  -> dist/rise-firefox.zip (Size: $(du -sh dist/rise-firefox.zip | cut -f1))"
echo "========================================"
