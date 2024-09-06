FROM node:14.16.1-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
ENV GENERATE_SOURCEMAP false
RUN npm run build

FROM node:14.16.1-alpine
RUN apk add --no-cache tzdata
ENV TZ Asia/Yerevan
WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/dist ./dist
RUN npm i --production
CMD ["node", "./dist/main.js"]