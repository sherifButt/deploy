# Use the official Node.js 16 as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /src/app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Bundle app source inside the Docker image
COPY . .

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Install Docker CLI dependencies
USER root
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

# Add Docker’s official GPG key
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -

# Set up the Docker stable repository
RUN add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable"

# Install the Docker CLI
RUN apt-get update && apt-get install -y docker-ce-cli

# Define the command to run your app using CMD which defines your runtime
# Adjust the CMD if your app.js is located in a different path
CMD [ "node", "app.js" ]
