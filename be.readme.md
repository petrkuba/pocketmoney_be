## Starting commands
run commands under /app/ folder
- `node server.js`
- `node server`

## Local DEV env
### MongoDB connection

- connection string: `mongodb://admin:password@localhost:27017`
- db name: `pocketmoney_dev`

MongoDB can run as a service or in docker

## Git repo
commit
```
git commit -m "Your commit message"
```

push
```
git push origin main
```
Note: run the commands in project root

## Local Docker env

### Create mongodb in docker 
Download mongo image
```
docker pull mongo
```
Run mongodb container
```
sudo docker run -d \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=password \
--net pocketmoney-network \
-v pocketmoney-data:/data/db \
--name mongo-db \
mongo
```
--name must be same as the host in DB connection string in Dockerfile ENV

### Build docker image from Dockerfile
- run this command in project root:
```
docker build -f be.Dockerfile -t pocketmoney-server:2.2 .
```


### Run application container
```
docker run -d \
-p 3001:3001 \
--net pocketmoney-network \
--name pocketmoney-be \
pocketmoney-server:2.2
```
- network must be the same as MongoDB is running in

### Deploy new version of application
- create new application image
- run application container from new image