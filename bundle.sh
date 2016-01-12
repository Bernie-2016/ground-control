#!/usr/bin/env bash

cat ./src/frontend/index/production.json <(echo "\"git_sha\": \"$SOURCE_VERSION\" }") | mustache - ./src/frontend/index/index.mustache > ./src/frontend/public/index.html
mkdir -p ./src/frontend/public/assets/js
webpack --config ./webpack/config.js
