FROM node:14-alpine

RUN mkdir -p /usr/src/app
COPY ./ /usr/src/app/
WORKDIR /usr/src/app

RUN npm install; chown -R node.node /usr/src/app

EXPOSE 3000

CMD ["node", "app.js"]
