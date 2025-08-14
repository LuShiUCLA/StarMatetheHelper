# Stage 1: Use an official Node.js runtime as a parent image
# Use a specific version for reproducibility (e.g., lts - Long Term Support)
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
# This leverages Docker's layer caching. These files don't change often,
# so this step will be cached unless they are modified.
COPY package*.json ./

# Install app dependencies
# Use --only=production to avoid installing devDependencies
RUN npm install --only=production

# Bundle app source
# Copy the rest of the application's code
COPY . .

# Expose the port the app runs on. Google Cloud Run uses this.
EXPOSE 8080

# Define the command to run your app
# This will execute "node server.js" when the container starts.
CMD [ "node", "server.js" ]