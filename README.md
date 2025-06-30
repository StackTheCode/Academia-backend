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

## ⚡AWS Lambda Usage
AWS Lambda is used to manage the summarization of research papers uploaded to an S3 bucket.

An API Gateway triggers the first Lambda function, which checks DynamoDB for an existing summary. If not found, it checks the Summary Status table. If there's no pending entry, it adds one and sends a message to SQS.

SQS triggers the second Lambda function, which uses Amazon Textract to extract text from the PDF and sends it to the Hugging Face API (Facebook’s BART model) for summarization. The result is saved to DynamoDB, and the status is updated to completed.

## 📝 Note:

To access the swagger documentation, set `NODE_ENV=DEV` and check `localhost:{PORT}/api-docs` on your browser

## 🔗 Link to Frontend Repository

[Academia Frontend Repository](https://github.com/RithvikR1218/Academia-frontend)

