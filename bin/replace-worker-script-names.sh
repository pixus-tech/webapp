#!/bin/sh

for WORKER_SCRIPT in $(ls build/static/js/*.dev.js)
do
  if [ -f "$WORKER_SCRIPT" ]
  then
    base=$(basename $WORKER_SCRIPT ".dev.js")
    hash=$(sha1sum $WORKER_SCRIPT | cut -c-8)
    name="${base}.${hash}.js"
    cp $WORKER_SCRIPT "build/static/js/${name}"

    for SCRIPT in $(find build -name "*.js")
    do
      if [ -f "$SCRIPT" ]
      then
         sed -i 's/'"$base"'.dev.js/'"$name"'/g' $SCRIPT
      fi
    done
  fi
done
