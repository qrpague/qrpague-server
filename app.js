'use strict';

let Security = require('./security');

var path = require('path');
global.pathRootApp = path.resolve(__dirname);

var express = require('express'),
    load = require('express-load'),
    app = express(),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cfg = require('./config').Config

var logger = require('./lib/logger.js');

app.use( Security.cors )

app.use(methodOverride());

app.use(bodyParser.json({
    limit: '6mb'
}));
app.use(bodyParser.text());

app.use(bodyParser.urlencoded({
    limit: '6mb',
    extended: true
}));

global.env = cfg.env;

load('models')
    .then('controllers')
    .then('models')
    .then('routes')
    .into(app);

app.use(cookieParser());
app.listen(cfg.httpPort, cfg.httpHost, function () {
    console.info("SERVIDOR INICIADO (" + cfg.httpHost + ":" + cfg.httpPort + ")");
});