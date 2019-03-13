'use strict';
let path = require('path');
global.pathRootApp = path.resolve(__dirname);


let express = require('express')
let app = express()
let cfg = require('./config')
let Security = require('./security');
let ResourcesNegocio = require('./resources/negocio');
let methodOverride = require('method-override')
let bodyParser = require('body-parser')


 
app.use(Security.cors)

app.use(methodOverride());
app.use(bodyParser.json({ limit: 1024102420, type: 'application/json' }));
app.use(bodyParser.text());

app.use(logErrors);
app.use(errorHandler);
  
 
app.use('/qrpague-admin', express.static(__dirname + '/public/', { 'index': 'index.html' }));
app.use('/', ResourcesNegocio );



app.listen(cfg.HTTP_PORT, cfg.HTTP_HOST, function () {
    console.info("########################################################################");
    console.info("##              POWER        SERVER STARTED              POWER        ##");
    console.info("########################################################################");
    console.info('URL: ', cfg.HTTP_HOST + ":" + cfg.HTTP_PORT);  
    console.info("------------------------------------------------------------------------");
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
