#!/bin/sh

mkdir -p ./build/static/js/
cat ./node_modules/blockstack/dist/blockstack.js > ./build/static/js/crypto.js
cat ./node_modules/dexie/dist/dexie.min.js > ./build/static/js/dexie.js
cat ./node_modules/@tensorflow/tfjs/dist/tf.min.js > ./build/static/js/tf.min.js
