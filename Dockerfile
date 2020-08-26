FROM node:alpine

RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

COPY package.json .
RUN npm install
COPY . .

EXPOSE 8443

CMD ["npm","start"]