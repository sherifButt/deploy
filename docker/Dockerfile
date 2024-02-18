# Use the official Node.js 16 as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /src/app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
# COPY package*.json ./
# If you are using yarn, don't forget to copy yarn.lock:
COPY package.json yarn.lock ./

# Install dependencies
# RUN npm install
# For yarn, use:
RUN yarn install

# Bundle app source inside the Docker image
COPY . .

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD [ "node", "src/app/app.js" ]
# Adjust "app.js" to your app's entry point file, if different
