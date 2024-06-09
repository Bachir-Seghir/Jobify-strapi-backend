# Jobify - REST API Server

This server is built with [Strapi.io](https://strapi.io).
Strapi is the leading open-source headless CMS. It’s 100% JavaScript, fully customizable and developer-first.

## REST API 
Jobify - Server exports a RESTfull API with CRUD functionnalities and Role-Based Acess Control (RBAC)


## Installation 

clone the repository into your machine :

`git clone https://github.com/Bachir-Seghir/Jobify-strapi-backend.git`

In the project directory install all dependencies,run:

`npm install`

### Configure Environment variables 

In the root folder ./ \
create file : .env \
and put your variables inside \

example : \
HOST=0.0.0.0 \
PORT=1337 \
STRIPE_SK=put your stripe secret key here \

### Run the Server on local
`npm run develop`

### Deploy 

You can deploy this API Server on Heroku or an other server you want 
