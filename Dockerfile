FROM keymetrics/pm2:8-alpine

MAINTAINER LEONARDO SILVEIRA (SICOOB)

ENV QRPAGUE="/QRPAGUE"

WORKDIR $QRPAGUE

#install dependencies
COPY package.json $QRPAGUE/
RUN npm install 

#copy sources
COPY *.js "$QRPAGUE"/

#copy folders
COPY controllers "$QRPAGUE"/controllers
COPY models "$QRPAGUE"/models
COPY routes "$QRPAGUE"/routes
COPY lib "$QRPAGUE"/lib

RUN echo "{}" > default-0.json

EXPOSE 9092

CMD [ "pm2-runtime", "app.js" ]