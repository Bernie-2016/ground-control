#!/usr/bin/env bash

rm -rf ./node_modules/react-formal/node_modules/react
DATAVIEW="{\"enable_rollbar\": true, \"env\": \"$NODE_ENV\", \"git_sha\": \"$SOURCE_VERSION\"}"
echo "$DATAVIEW" | mustache - ./src/frontend/index/index.mustache > ./src/frontend/public/index.html

mkdir -p ./src/frontend/public/assets/js
webpack --config ./webpack/config.js
node ./version.js
