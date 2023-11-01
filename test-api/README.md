# Table of Contents
1. [Overview](#overview)
2. [Module version](#moduleversion)
2. [Setup](#setup)
4. [Development](#development)

# Overview

Admin API microservice for interacting with UI.

# Module version

Need to have the following toolchain:
- nvm: >= 0.34.0
- node: >= v12.19.0
- npm: >= 6.14.8
- yarn: >= 1.22.10

Install project dependencies:
```shell
npm install
```
# Setup

Need to have following ENV variables in .env file (e.g):
- DATABASE_TYPE=localhost
- DATABASE_HOST=localhost
- DATABASE_PORT=27017
- DATABASE_NAME=demo-api
- AWS_ACCESS_KEY=
- AWS_SECRET_ACCESS_KEY=
- FILE_MANAGER=S3/HDFS
- FILE_MANAGER_S3_BUCKET=
- FILE_MANAGER_S3_FOLDER=
- FILE_MANAGER_S3_URL_EXPIRE_TIMEOUT=
- JWT_SECRET

Need to pull hadoop from docker hub, if file manager is HDFS. 
```shell
docker pull sequenceiq/hadoop-docker
```
After pull run docker image with network host and in background mode
```shell
docker run -d --network host sequenceiq/hadoop-docker
```

# Development

Start the project in development mode:
```shell
npm run start:dev
```
