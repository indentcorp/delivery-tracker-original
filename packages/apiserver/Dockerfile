FROM node:16

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
