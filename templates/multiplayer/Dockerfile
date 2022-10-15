FROM node

# Create and change to the app directory.
RUN mkdir /home/multiplayer
WORKDIR /home/multiplayer

RUN apt-get update \
    && apt-get install -qq build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
# If you add a package-lock.json speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
# Copy local code to the container image.
COPY . ./

RUN npm install 

# Run the web service on container startup.
CMD ["node", "index.js"]
