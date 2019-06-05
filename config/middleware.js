const bodyParser = require('body-parser');
const { Logger } = require('@sfd-br/util');

const corsMiddleware = (req, res, next) => {
    logger.debug('%s %s %s', req.method, req.url, req.path);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
}

module.exports = (app) => {

  app.use(bodyParser.text())

  app.use(bodyParser.json({
    limit: '50mb'
  }));
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }));

  app.use(corsMiddleware);
}

