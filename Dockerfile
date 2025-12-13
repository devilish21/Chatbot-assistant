# Stage 1: Build the React application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the app (creates a /dist folder)
# Note: We pass the API key at build time or runtime (see step 3)
# Run tests before building
RUN npm test -- --run

# Build the app (creates a /dist folder)
# Note: We pass the API key at build time or runtime (see step 3)
RUN npm run build

# Stage 2: Serve with Nginx (High Performance)
FROM nginx:alpine

# Copy the built files from Stage 1 to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx config (optional, but good for React Router)
# echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]