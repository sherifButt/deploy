# Use the official Node.js 18 as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the working directory
COPY ../package.json ../yarn.lock ./

# Install dependencies
RUN yarn install

# Bundle app source inside the Docker image
COPY ../ ./

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD [ "node", "src/app/app.js" ]