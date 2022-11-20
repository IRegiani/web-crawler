FROM node:lts-alpine3.14

WORKDIR /usr/src/app

RUN apk update && apk upgrade && rm -rf /var/lib/apt/lists/*

RUN apk add --no-cache tzdata

ENV TZ America/Sao_Paulo

COPY package*.json ./

RUN npm ci --production

COPY . .

EXPOSE 4040

CMD ["npm", "run", "serve-big-memory"]
