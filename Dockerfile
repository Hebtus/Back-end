# Use an official Node.js runtime as a parent image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install
RUN npm install -g nodemon
#install pm2 process manager
RUN npm install -g pm2

# Copy the rest of the app source code to the working directory
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the app using pm2
CMD [ "pm2-runtime", "npm", "--", "start" ]
# Start the app using pm2
#CMD ["pm2-runtime", "start", "server.js", "--watch", "--no-daemon"]


