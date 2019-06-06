const express = require('express');
const path = require('path');
const createMiddleware = require('swagger-express-middleware');
const initializeConfigurations = require('./config/config');
const expressApp = express();
const swaggerFile = path.join(__dirname, '/api/swagger/swagger.yaml');

const start = (app) => {
    
    initializeConfigurations(app);
    
    createMiddleware(swaggerFile, app, function(err, middleware) {
        app.use(
            middleware.metadata(),
            middleware.CORS(),
            middleware.files(),
            middleware.parseRequest(),
            middleware.validateRequest()
        );

        process.env.PORT = 9999;
    
        app.listen(process.env.PORT, () => console.log('O servidor do QR-PAGUE subiu na porta: ', process.env.PORT));
    });
}

start(expressApp);