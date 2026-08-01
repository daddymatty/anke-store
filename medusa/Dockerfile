# Medusa бекенд + адмінка (продакшн-білд)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* turbo.json ./
COPY apps/backend/package.json apps/backend/
RUN npm install --legacy-peer-deps
COPY . .
WORKDIR /app/apps/backend
RUN npx medusa build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/apps/backend/.medusa/server ./
RUN npm install --omit=dev --legacy-peer-deps
ENV NODE_ENV=production
EXPOSE 9000
CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start"]
