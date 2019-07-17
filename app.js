const express = require('express');
const path = require('path');
const setupConfiguration = require('./config/config');
const Routes = require('./api/routes');
const { Logger } = require('./api/util');
const createMiddleware = require('swagger-express-middleware');

const expressApp = express();

const swaggerFilePath = path.join(__dirname, 'api/swagger/swagger-openapi-2.yaml');
const PORT = process.env.PORT || 8080;

const start = (app) => {

    setupConfiguration(app);
    
    createMiddleware(swaggerFilePath, app, function(err, middleware, api, parser) {

        app.use(middleware.metadata())
        app.use(middleware.CORS());
        app.use(middleware.parseRequest());

        app.use('/qrpague', Routes);
        app.listen(PORT, () => Logger.info('O servidor do QR-PAGUE subiu na porta:', PORT));
    });
}


start(expressApp);