#!/bin/bash

rm -rf build || true
mkdir build
r.js -o build.js
lessc app/style.less > build/style.css
./buildEditor.py
cp ./build/editor-built.html ../
