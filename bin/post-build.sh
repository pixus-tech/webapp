#!/bin/sh

./bin/build-workers.sh
./bin/replace-worker-script-names.sh
./bin/replace-host.sh
