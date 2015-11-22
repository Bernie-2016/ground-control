FROM nodesource/node:argon

ENV NODE_ENV development
ADD package.json package.json
RUN npm install
ADD . .

RUN apt-get update \
 && apt-get install -y --force-yes --no-install-recommends\
      inotify-tools \
 && rm -rf /var/lib/apt/lists/*;

ENV SUDO_USER root

CMD ["./dockerfiles/graph.sh","nodejs","./node_modules/babel/lib/_babel-node","./src/backend/server.js"]
