FROM node:12

MAINTAINER begin0dev <prosonic1@gmail.com>

RUN mkdir -p /app
WORKDIR /app

RUN ls -a

ADD ./package*.json ./
ADD ./.env ./
COPY ./dist ./

RUN npm ci --only=production

EXPOSE 3001
ENV NODE_ENV production
CMD ["npm", "start"]
