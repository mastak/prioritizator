FROM node:7-slim
#FROM node:7-alpine
#FROM node:7

RUN \
       mkdir -p /usr/src/front \
    && mkdir -p /usr/src/packages


COPY package.json /usr/src/packages/package.json

RUN \
       cd /usr/src/packages \
    && npm install \
    && npm cache clean

COPY ./docker/entrypoint.sh /entrypoint.sh

COPY . /usr/src/front

RUN chmod +x /entrypoint.sh

WORKDIR /usr/src/front

#ENTRYPOINT ["npm"]

#CMD ["npm", "start"]
CMD ["/entrypoint.sh"]
