

FROM node:16

ENV DEBIAN_FRONTEND noninteractive

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \ 
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get -y install google-chrome-stable

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
RUN npm ci --only=production

RUN cd client 
RUN npm install --no-shrinkwrap --legacy-peer-deps
RUN react-scripts build
RUN cd ..

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "server/index.js" ]