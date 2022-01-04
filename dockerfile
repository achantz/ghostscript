FROM node:12-alpine

#install ghostscript
RUN apk add ghostscript-dev

# create work dir
WORKDIR /usr/src/app

# copy over package.json files
COPY package*.json ./

# install node modules
RUN npm install

# copy application files
COPY . .

EXPOSE 3333

ENV GS4JS_HOME /usr/lib
ENV TMPDIR=/usr/src/app/files/tmp

# run command
CMD ["npm", "run", "start"]