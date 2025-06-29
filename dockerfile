FROM node:20

WORKDIR /app

COPY ./backend/package*.json ./

RUN npm install

COPY ./backend ./

RUN npx prisma generate

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]