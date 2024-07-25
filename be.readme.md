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

### Build docker image from Dockerfile
- run this command in project root:
```
docker build -f be.Dockerfile -t pocketmoney-server:2.3 .
```

### Run application container
locally
```
docker run -d \
-p 3001:3001 \
--net pocketmoney-network \
--name pocketmoney-be \
pocketmoney-server:2.3
```
- network must be the same as MongoDB is running in

run on cloud VM
```
sudo docker run -d \
-p 3001 \
--net pocketmoney-network \
--name pocketmoney-be \
petrkuba/pk:pocketmoney_be
```

### Deploy new version of application
- create new application image
- run application container from new image