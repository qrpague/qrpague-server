const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { Logger } = require('../api/util');

const corsMiddleware = (req, res, next) => {
    logger.debug('%s %s %s', req.method, req.url, req.path);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
}

module.exports = (app) => {

  app.use(methodOverride());
  app.use(bodyParser.text())
  app.use(bodyParser.json({
    limit: 1024102420
  }));
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }));

  app.use(corsMiddleware);

  app.use('/qrpague-admin', express.static(__dirname + '/public/', { 'index': 'index.html' }));
}

