# Friends
## Prerequisites
- Install correct version of Node (12.13.0) - consider using Node version manager like nvm or n.
- Install Docker

## Start local MongoDB database
```bash
# If you have not built the Docker database image do it first
docker build -t friends-mongodb -f Dockerfile.mongodb.local .

# Start the MongoDB Docker container
docker run -d --name friends-mongodb -p 27017:27017 friends-mongodb

# Make sure friends-mongodb container is running
docker ps
```
Note! Make sure you have entered a secret key ```app_secret``` in app env files under ```/config```

## Install required dependencies 
```bash
npm install
```

## Start backend app
```bash
npm start
```

## Start backend app in debug mode
```bash
1. npm run debug
2. click the debug icon in vscode
3. click start debugging
4. select node process from the list
```

## Run tests
```bash
npm test
```

## Start backend as Docker cluster (MongoDB and Server app)
In the root directory execute following command
(--build is optional. If you've already built the images you want to run in the cluster, obtain this option)

```bash
docker-compose up --build
```

## Why MongoDb?
I usually choose MongoDb in node projects that are simple and don't require many document types/collections and relations between these documents.
Some other reasons why:
  - Easy to setup
  - Easy scalable
  - Works on all types of computing platforms
  - Has very large community
  - etc

