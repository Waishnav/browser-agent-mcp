# Browser Agent MCP - Chrome Extension Icons

This directory contains the extension icons.

## Current Icons

- `icon.svg` - Source SVG icon (128x128)

## Required PNG Icons

For the extension to work properly in Chrome, you need to create PNG versions:
- `icon-16.png` (16x16 pixels)
- `icon-48.png` (48x48 pixels)
- `icon-128.png` (128x128 pixels)

## Generating PNG Icons

You can generate PNG icons from the SVG using various tools:

### Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
convert icon.svg -resize 16x16 icon-16.png
convert icon.svg -resize 48x48 icon-48.png
convert icon.svg -resize 128x128 icon-128.png
```

### Using Inkscape (Command Line)
```bash
inkscape icon.svg -w 16 -h 16 -o icon-16.png
inkscape icon.svg -w 48 -h 48 -o icon-48.png
inkscape icon.svg -w 128 -h 128 -o icon-128.png
```

### Using Online Tools
- Visit https://convertio.co/svg-png/
- Upload icon.svg
- Download as PNG at different sizes

### Using Figma/Design Tools
1. Import icon.svg
2. Export at 16x16, 48x48, and 128x128

## Note

Until PNG icons are generated, the extension may show a default Chrome icon. The extension will still function correctly.

