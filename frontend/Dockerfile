# Gebruik Node.js LTS image
FROM node:18

# Stel werkdirectory in
WORKDIR /app

# Kopieer package info en installeer dependencies
COPY package*.json ./
RUN npm install

# Kopieer de rest van de code
COPY . .

# Fix permission issues
RUN chmod +x node_modules/.bin/next

# Zet poort (maar Compose bepaalt deze uiteindelijk)
EXPOSE 3000

# Start de dev-server (hot-reload actief)
#CMD ["npm", "run", "dev"]
CMD ["node", "server.mjs"]
#CMD ["npm", "run", "dev:https"]
