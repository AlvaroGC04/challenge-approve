FROM node:18

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

RUN npm install --production --unsafe-perm

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]