FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies with legacy peer deps to avoid React 18 compatibility issues
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Create a browser-compatible environment file
RUN echo "BROWSER=none" > /app/.env.local
RUN echo "SKIP_PREFLIGHT_CHECK=true" >> /app/.env.local

# Create a direct fix for the buffer issue by patching the webpack configuration
RUN mkdir -p /app/node_modules/react-scripts/config
RUN cp /app/node_modules/react-scripts/config/webpack.config.js /app/node_modules/react-scripts/config/webpack.config.js.bak
RUN sed -i '/resolve: {/a\    fallback: { "buffer": false, "stream": false, "crypto": false, "util": false, "assert": false, "process": false },\n' /app/node_modules/react-scripts/config/webpack.config.js

EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]
