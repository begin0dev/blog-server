FROM node:12

MAINTAINER begin0dev <prosonic1@gmail.com>

RUN mkdir -p /app
WORKDIR /app
ADD ./package*.json ./
COPY ./dist ./
COPY ./config/.env ./config/

RUN npm ci --only=production

EXPOSE 3001
ENV NODE_ENV production
CMD ["npm", "start"]
