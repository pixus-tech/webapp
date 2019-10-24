#!/bin/sh

for FILE in $(find build -name "*.*")
do
  if [ -f "$FILE" ]
  then
    sed -i 's/pixus.local:3000/'"$HOST"'/g' $FILE
  fi
done
