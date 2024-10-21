FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --force

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 8001

# Run the application
CMD ["npm", "start"]
