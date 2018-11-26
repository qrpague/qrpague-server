'use strict';

import Security from'./security'
import path from'path'
 
import express from'express'
const app = express();
import cookieParser from'cookie-parser'
import bodyParser from'body-parser'
import methodOverride from'method-override'
import cfg from'./config'

import ResourcesNegocio from './resources/negocio'

global.pathRootApp = path.resolve(__dirname);

app.use(Security.cors)
app.use(methodOverride());
app.use(bodyParser.json({ limit: '6mb'}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ limit: '6mb', extended: true }));
app.use(logErrors);
app.use(errorHandler);
app.use(cookieParser());
app.use(ResourcesNegocio );

 



app.listen(cfg.HTTP_PORT, cfg.HTTP_HOST, function () {
    console.info("SERVIDOR INICIADO (" + cfg.HTTP_HOST + ":" + cfg.HTTP_PORT + ")");
});



function logErrors(err, req, res, next) {
    console.error(err);
    next(err);
}

function errorHandler(err, req, res, next) {
    var status = err.status || 400;
    let retorno = { message : err.message ,  }  
    res.status(status).send(retorno);

}
