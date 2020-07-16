FROM node:12

RUN mkdir -p /app
WORKDIR /app
COPY . /app

RUN npm ci --only=production

EXPOSE 3001
ENV NODE_ENV production
CMD ["npm", "start"]

# docker build -t begin0dev/blog .