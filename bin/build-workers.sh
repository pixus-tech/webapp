#!/bin/sh

mkdir -p ./build/static/js/
cat ./node_modules/blockstack/dist/blockstack.js > ./build/static/js/crypto.js
