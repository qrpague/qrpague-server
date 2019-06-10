const express = require('express');
const path = require('path');
const createMiddleware = require('swagger-express-middleware');
const setupConfiguration = require('./config/config');
const expressApp = express();
const swaggerFile = path.join(__dirname, '/api/swagger/swagger.yaml');
const Routes = require('./api/resources');

const start = (app) => {
    
    setupConfiguration(app);
    
    createMiddleware(swaggerFile, app, function(err, middleware) {

        app.use('/qrpague-admin', express.static(path.join(__dirname, '/public/'),
        { 'index': 'index.html' }));

        app.use(
            middleware.metadata(),
            middleware.CORS(),
            middleware.files(),
            middleware.parseRequest({ 
                json: { limit: '50mb' },
                urlencoded: { limit: '50mb', extended: true }
            })
        );

        app.use(Routes);

        const PORT = process.env.PORT || 8080;
    
        app.listen(PORT, () => console.log('O servidor do QR-PAGUE subiu na porta: ', PORT));
    });
}

start(expressApp);