FROM node:alpine

MAINTAINER LEONARDO SILVEIRA (SICOOB)

ENV QRPAGUE="/QRPAGUE"

WORKDIR $QRPAGUE

#install dependencies
COPY package.json $QRPAGUE/
RUN npm install 
RUN npm install --save-dev babel-cli

#copy sources
COPY *.js "$QRPAGUE"/
COPY .* "$QRPAGUE"/
 
#copy folders
COPY controllers "$QRPAGUE"/controllers

COPY lib "$QRPAGUE"/lib
COPY models "$QRPAGUE"/models
COPY resources "$QRPAGUE"/resources
COPY services "$QRPAGUE"/services
COPY templates "$QRPAGUE"/templates
COPY tools "$QRPAGUE"/tools

 
RUN echo "{}" > default-0.json

EXPOSE 9092
 
COPY start-server.sh "$QRPAGUE"/

ENTRYPOINT ["sh","start-server.sh"]
