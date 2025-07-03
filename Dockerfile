FROM node:24-alpine AS build
WORKDIR /app
COPY server ./server
COPY client ./client
WORKDIR /app/client
RUN npm install && npm run build
WORKDIR /app/server
RUN npm install

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/server /app/server
COPY --from=build /app/client/dist /app/client/dist
COPY mappingfile.ini /app/mappingfile.ini
WORKDIR /app/server
ENV NODE_ENV=production
CMD ["node", "index.js"]
