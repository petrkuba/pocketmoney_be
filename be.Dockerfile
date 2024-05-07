FROM node:18

WORKDIR /app

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password \
    MONGODB_CONN_STRING=mongodb://admin:password@mongo-db:27017 \
    MONGODB_DATABASE_NAME=pocketmoney

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]



