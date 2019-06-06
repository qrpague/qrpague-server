const path = require('path');
const { Config, Logger } = require('../api/util');
const middleware = require('./middleware');

const MESSAGE_FILE = path.join(__dirname, '../api/message/error-messages.yaml');

module.exports = (app) => {
    Config.initialize({
        yaml: { filePath: MESSAGE_FILE },
        logger: { name: process.env.NODE_PROJECT, level: process.env.LOG_LEVEL }
    })
    middleware(app);
    require('../api/database/config');
}
