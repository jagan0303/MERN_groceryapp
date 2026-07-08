FROM node:18
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 7860
CMD ["node", "server.js"]