# Dockerized Profile Form (Express + Native MongoDB Driver)

A full-stack profile configuration form built with a Node.js/Express backend and a vanilla JavaScript frontend. This project demonstrates how to handle multipart form data (text inputs + file uploads) in a single request and persist both metadata and assets across isolated Docker containers.

## Project Structure & Architecture

```text
├── app/
│   ├── public/         # Static frontend assets
│   │   ├── uploads/    # Persisted user profile images
│   │   └── index.html  # UI & form submission logic
│   ├── package.json
│   └── server.js       # Express API & Native Mongo integration
├── Dockerfile          # Multi-stage/Node build instructions
└── mongo.yaml          # Docker Compose multi-container orchestration

[ Browser UI ] ──( Multipart FormData )──> [ Express App Container (:3000) ]
                                                    │ (Saves file to volume)
                                                    ▼
[ MongoDB Container (:27017) ] <──( Native Driver )─┘ (Queries service alias 'mongo')

```
### How to Run Locally

Prerequisites
Docker and Docker Compose installed and running on your host machine.

``` 
git clone <repo-url>
cd profile-upload-feature
docker compose -f mongo.yaml up --build
http://localhost:3000 // access the application here
```




