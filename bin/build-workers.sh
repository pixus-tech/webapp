#!/bin/sh

mkdir -p ./build/static/js/

for WORKER_SCRIPT in $(ls src/worker-scripts/*.ts)
do
  SCRIPT_PREFIX=$(basename $WORKER_SCRIPT ".ts") npm run build:worker-script
done

cat ./node_modules/blockstack/dist/blockstack.js > ./build/static/js/blockstack.dev.js
