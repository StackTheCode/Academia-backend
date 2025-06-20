# Academia Backend

Backend for Academia, a database of various professors in and around the world. The goal of academia is to help ease the process of finding research internships

## Tech Stack

- NodeJS
- ExpressJS
- MongoDB
- Swagger
- Typesense

## Local Setup

### Install the node modules

`npm i`

### Create .env from the .env.example and fill the necessary details

`cp .env.example .env`

### Start the Server

`npm run dev`

## Note:

To access the swagger documentation, set NODE_ENV=DEV and check localhost:{PORT}/api-docs in your browser

## Docker Setup

### Give permission to replica init
`chmod +x ./scripts/init-replica.sh`

### Generate a mongo key file using openssl
`openssl rand -base64 756 > mongo-keyfile`

### Give proper permission to key file
`chmod 400 mongo-keyfile`

### Start Docker 
docker compose up