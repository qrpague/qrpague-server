FROM keymetrics/pm2:10-alpine

ENV USER="qrpague"
ENV HOME="/home/qrpague"
ENV APP="/opt/qrpague"
ENV PATH=$APP:$PATH 

RUN apk update && apk add shadow

RUN apk add --update \
    python \
    python-dev \
    py-pip \
    build-base \
    && pip install virtualenv \
    && rm -rf /var/cache/apk/*


RUN mkdir -p $APP && \
    mkdir -p $HOME && \
    groupadd -r $USER && \
    useradd --no-log-init -d $HOME -r -g $USER $USER && \
    chown -R $USER:$USER $HOME     

WORKDIR $APP

# Copiar fontes
COPY app.js ./
COPY api ./api
COPY config ./config
COPY public ./public
COPY package.json ./  
COPY package-lock.json ./  
COPY test ./test

# ISSUE - https://github.com/lorenwest/node-config/issues/244
RUN echo "{}" > "$APP"/config/default-0.json

# Permissionamento
RUN chown -R $USER:$USER $HOME && \
    chown -R $USER:$USER $APP && \
    chgrp -Rf root $HOME && \
    chmod -Rf g+w $HOME && \
    chmod -R u+x $APP && \
    chgrp -R 0 $APP && \
    chmod -R g=u $APP /etc/passwd

# Instalar dependências
RUN npm install --verbose

# Selecionar o usuário
USER $USER

CMD ["pm2-runtime", "app.js"]