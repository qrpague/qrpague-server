const log4js = require('log4js');
const log4js_extend = require('log4js-extend');
const LOG_LEVEL = require('./log-level');

/**
 * @type {Object} - Objeto de Log
 */
let Logger;

/**
 * Configura o log4js
 * @param {string} level - Nível do log
 * @param {string} name - Nome do microserviço
 * @param {string} appRoot - Path do App
 */
const config = (level='debug', name='service', appRoot=__dirname) => {
    log4js_extend(log4js, {
        path: appRoot,
        format: "at @name (@file:@line:@column)"
    });
    let logger = log4js.getLogger(name);
    logger.level = level;
    Logger = logger;
}

/**
 * Escreve o log
 * @param {string} logLevel - Nível do log
 * @param {Array} messages - Array de mensagens
 */
const log = (logLevel, ...messages) => {
    const message = messages.map(m => JSON.stringify(m)).join(' ');
    switch(logLevel) {
        case LOG_LEVEL.TRACE:
            Logger.trace(message);
            break;
        case LOG_LEVEL.DEBUG:
            Logger.debug(message);
            break;
        case LOG_LEVEL.INFO:
            Logger.info(message);
            break;
        case LOG_LEVEL.WARN:
            Logger.warn(message);
            break;
        case LOG_LEVEL.FATAL:
            Logger.fatal(message);
            break;
        case LOG_LEVEL.ERROR:
        default:
            Logger.error(message);
    }
}

/**
 * Escreve o log em nível TRACE
 * @param {Array} messages - Array de mensagens
 */
const trace = (...messages) => {
    log(LOG_LEVEL.TRACE, ...messages);
}

/**
 * Escreve o log em nível DEBUG
 * @param {Array} messages - Array de mensagens
 */
const debug = (...messages) => {
    log(LOG_LEVEL.DEBUG, ...messages);
}

/**
 * Escreve o log em nível INFO
 * @param {Array} messages - Array de mensagens
 */
const info = (...messages) => {
    log(LOG_LEVEL.INFO, ...messages);
}

/**
 * Escreve o log em nível WARN
 * @param {Array} messages - Array de mensagens
 */
const warn = (...messages) => {
    log(LOG_LEVEL.WARN, ...messages);
}

/**
 * Escreve o log em nível ERRROR
 * @param {Array} messages - Array de mensagens
 */
const error = (...messages) => {
    log(LOG_LEVEL.ERROR, ...messages);
}

/**
 * Escreve o log em nível FATAL
 * @param {Array} messages - Array de mensagens
 */
const fatal = (...messages) => {
    log(LOG_LEVEL.FATAL, ...messages);
}

module.exports = {
    config,
    log,
    trace,
    debug,
    info,
    warn,
    error,
    fatal,
    LOG_LEVEL
}
