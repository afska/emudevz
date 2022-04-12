#!/bin/bash

. ./scripts/try.sh

# build generic version
try ./scripts/build-desktop.sh

# build desktop version
try cd build/
try ../node_modules/.bin/electron-builder . emudevz --linux --x64
try cd ../

# move and rename
try mv "build/dist/emudevz-1.0.0.AppImage" emudevz.AppImage
