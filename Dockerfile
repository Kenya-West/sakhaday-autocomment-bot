FROM node:19.9-buster-slim

EXPOSE 8080
WORKDIR /usr/app
COPY package.json .
COPY package-lock.json .
RUN npm ci --quiet
RUN npm install cross-env -g
COPY . .