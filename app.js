const express = require('express');
const path = require('path');
const setupConfiguration = require('./config/config');
const Routes = require('./api/routes');
const { Logger } = require('./api/util');

const expressApp = express();

const PORT = process.env.PORT || 8080;

const start = (app) => {
    setupConfiguration(app);
    app.use(Routes);
    app.listen(PORT, () => Logger.info('O servidor do QR-PAGUE subiu na porta:', PORT));
}


start(expressApp);