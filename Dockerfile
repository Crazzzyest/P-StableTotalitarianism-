# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Build-time API key (optional; pass via --build-arg when building)
ARG GEMINI_API_KEY=
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Backend API URL – must be set at *build* time so Vite can bake it in (e.g. Sliplane build args)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
