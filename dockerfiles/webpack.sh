#!/usr/bin/env bash

if [ ! -f "/tmp/schema.json" ]; then
  # Wait for scheam.json to appear
  echo "Waiting for schema.json"
  change=$(inotifywait -e create /tmp)
  file=$(echo "$change" | cut -d " " -f 3)
  folder=$(echo "$change" | cut -d " " -f 1)

  # watch for schema.json to appear in /tmp
  while ! echo "$folder/$file" | grep -E "schema\.json" > /dev/null; do
    change=$(inotifywait -r -e close_write,moved_to,create ./webpack ./package.json /tmp/schema.json)
    file=$(echo "$change" | cut -d " " -f 3)
    folder=$(echo "$change" | cut -d " " -f 1)
  done

fi

while true; do
  echo "Starting ${@}"

  # Start the process and let it run in the background. $! holds this process id
  exec "${@}" &
  pid=$!

  # watch for file changes. This blocks.
  change=$(inotifywait -r -e close_write,moved_to,create ./webpack ./package.json /tmp/schema.json)

  # Get the filename that changed
  file=$(echo "$change" | cut -d " " -f 3)
  folder=$(echo "$change" | cut -d " " -f 1)

  # ignore .git directory and .swp files from vim
  until ! echo "$folder/$file" | grep -E "\.git|\.swp" > /dev/null; do
    echo "Ignoring change"
    change=$(inotifywait -r -e close_write,moved_to,create ./webpack ./package.json /tmp/schema.json)
    file=$(echo "$change" | cut -d " " -f 3)
    folder=$(echo "$change" | cut -d " " -f 1)
  done

  echo $change
  echo "Detected change in folder ${folder} and file ${file}. Killing process ${!}"
  kill -9 $pid

  # If our package.json changed, rerun npm install
  if [ "$folder" == "./package.json" ]; then
    echo "Rerunning npm install"
    npm install
  else
    sleep 3 # Need to wait for port to be released
  fi
done
