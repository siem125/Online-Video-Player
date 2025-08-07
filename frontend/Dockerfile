# Gebruik Node.js LTS image
FROM node:18

# Stel werkdirectory in
WORKDIR /app

# Kopieer package info en installeer dependencies
COPY package*.json ./
RUN npm install

# Kopieer de rest van de code
COPY . .

# Zet poort (maar Compose bepaalt deze uiteindelijk)
EXPOSE 3000

# Start de dev-server (hot-reload actief)
CMD ["npm", "run", "dev"]
