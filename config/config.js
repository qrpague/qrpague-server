const path = require('path');
const { Config, Logger } = require('../api/util');

const MESSAGE_FILE = path.join(__dirname, '../api/message/error-messages.yaml');

module.exports = (app) => {
    Config.setup({
        yaml: { filePath: MESSAGE_FILE },
        logger: { name: process.env.NODE_PROJECT, level: process.env.LOG_LEVEL }
    })
    require('../api/database/db');
}
