FROM node:12.13.0
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install
# Copy app source code
COPY . .
#Expose port and start application
EXPOSE 8181
CMD [ "npm","run", "start:prod" ]