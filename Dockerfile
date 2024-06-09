# Use the official Node.js v14 image as the base image
FROM node:14-alpine

# Install necessary dependencies
RUN apk update && apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    nasm \
    bash \
    vips-dev \
    git

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory inside the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory inside the container
COPY . .

# Build the Strapi application
RUN npm run build

# Expose the port that Strapi will run on
EXPOSE 1337

# Start the Strapi server
CMD ["npm", "start"]
