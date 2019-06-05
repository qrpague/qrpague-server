const { Logger } = require('@sfd-br/util');
const middleware = require('./middleware');

module.exports = (appRoot, app) => {
    Config.initialize({
        yaml: {},
        logger: { name: process.env.NODE_PROJECT, level: process.env.LOG_LEVEL }
    })
    middleware(app);
    require('../api/database/config');
}
