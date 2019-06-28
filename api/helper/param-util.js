const { Logger } = require('../util');

const getParams = (req) => {
    const params = { ...req.query, ...req.params, ...req.headers }
    Logger.debug('Request Parameters >>> ', JSON.stringify(params));
    return params;
}

module.exports = {
    getParams
}