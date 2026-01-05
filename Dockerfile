# Use Node 18 (LTS) or 20
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies (including devDependencies so we can build)
# In a stricter prod env we might separate stages, but this is simple for user.
RUN npm install

# Bundle app source
COPY . .

# Build the React frontend
RUN npm run build

# Expose the API port
EXPOSE 3001

# Start the server
CMD [ "npm", "run", "server" ]
