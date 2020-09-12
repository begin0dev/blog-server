FROM node:12

MAINTAINER begin0dev <prosonic1@gmail.com>

RUN mkdir -p /app
WORKDIR /app
ADD ./package*.json ./
COPY ./dist ./

RUN npm ci --only=production

EXPOSE 3001
ENV NODE_ENV production
CMD ["npm", "start"]

# docker build -t begin0dev/blog .
