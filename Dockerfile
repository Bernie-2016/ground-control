FROM nodesource/node:argon

ENV NODE_ENV development
ADD package.json .
RUN npm install

ADD . .

ENV SUDO_USER root
CMD ["node_modules/.bin/nf","start"]
