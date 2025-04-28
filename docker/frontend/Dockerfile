FROM node:20-alpine

WORKDIR /var/www/frontend

COPY frontend/package.json .

RUN npm i

COPY frontend .

CMD ["npm", "run", "dev"]