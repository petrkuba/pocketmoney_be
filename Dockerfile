ARG NODE_VERSION=19.8.1

FROM node:${NODE_VERSION}-alpine

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password \
    MONGODB_CONN_STRING=mongodb://admin:password@mongo-db:27017 \
    MONGODB_DATABASE_NAME=pocketmoney

# Copy the the source files . into the image /usr/src/spp file
COPY ./app/ /usr/src/app/

WORKDIR /usr/src/app

# runs the commands inside the container
RUN npm install

# Expose the port that the application listens on.
EXPOSE 3000

# initial command
CMD ["node", "server.js"]



