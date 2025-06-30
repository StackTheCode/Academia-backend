# Academia Backend

Academia is a platform designed to simplify the process of finding and connecting with professors around the world for research opportunities. This backend serves the Academia application by offering a structured database of professors and tools that help students explore research interests and connect with potential mentors.

## 🚀 Features

- 🔎 Search and Filter Professors<br>
  Find Professors based on:
  - College
  - Department
  - Research Interests
- 📄 Paper Summarizations<br>
  Summarized versions of professors' recent papers to:
  - Understand their research at a glance
  - Write cold emails more effectively
- 🗂️ Personalized Dashboard<br>
  A user-specific dashboard to:
  - Save and manage professor profiles
  - Upload and organize research files
  - Keep track of interactions and progress
  
## 🛠️ Tech Stack

- NodeJS
- ExpressJS
- MongoDB
- Docker
- Swagger
- Typesense
- AWS Lambda
- Amazon Textract
- Amazon S3
- Amazon SES
- Amazon SQS
- Amazon API Gateway
- Dynamo DB

## 📂 Project Structure

```
/Academia-backend
├── scripts/                 
├── crawlers/                
├── src/
│   ├── config/              
│   ├── middleware/
│   ├── utils/         
│   ├── modules/             
│   │   ├── models/         
│   │   ├── routes/          
│   │   ├── controllers/     
│   │   └── services/                 
│   └── server.js            
├── .env                     
├── .gitignore               
├── package.json
├── Dockerfile
├── docker-compose.yml
├── keyfile.sh            
└── README.md 
```

## 📦 Local Setup

### Install the node modules

`npm install`

### Create .env file

`cp .env.example .env`

### Start the Server

`npm run dev`

## 📝 Note:

To access the swagger documentation, set NODE_ENV=DEV and check localhost:{PORT}/api-docs in your browser

## 🐳 Docker Setup

### Give permission to the keyfile script and execute
```
chmod +x keyfile.sh
./keyfile.sh
```
### Install Node Modules 
`npm install`

### Start Docker 
`docker compose up`

### Run Crawlers
```
docker exec -it academia-backend-server-1 bash
node crawlers/{COLLEGE-NAME}/{DEPARTMENT}.js
```
