const Logger = require('./logger');;
const Err = require('./error');
const Http = require('./http');
const MessageInfo = require('./message/message-info');
const YAMLReader = require('./yaml/yaml-reader');

/**
 * @type {Object} - Representação do arquivo YAML
 */
let Doc;

/**
 * 
 * @param {Object} options - Opções da biblioteca
 */
const setup = (options) => {

    if(options && options.messages && options.messages.filePath) {
        let messageOptions = { ...options.messages }
        const messageFilePath = messageOptions.filePath;
        Doc = new MessageInfo(messageFilePath);
    }

    if(options && options.logger) {
        let loggerOptions = { ...options.logger }
        Logger.config(loggerOptions.level, loggerOptions.name);
    } else {
        Logger.config(Logger.LOG_LEVEL.ERROR);
    }
}

/**
 * Lança um @throws {ResponseError}
 * @param {number} statusCode - Código de Status HTTP
 * @param {number} codigoErro - Código de mensagem do erro
 * @param {number} codigoDetalheErro - Código de detalhamento do erro
 * @param {Object} parametros - Parametros da mensagem de erro (Key/Value)
 */
const throwError = (statusCode, codigoErro, codigoDetalheErro, parametros) => {
    if(!Doc) {
        throwInternalError(new Error('Você precisa inicializar a configuração do arquivo YAML de mensagens nas opções de inicialização.'));
    }
    Err.throwError(Doc, statusCode, codigoErro, codigoDetalheErro, parametros);
}

/**
 * Lança um @throws {ResponseError}
 * @param {Error} error - Qualquer tipo de erro.
 */
const throwInternalError = (error) => {
    Err.throwInternalError(error);
}

/**
 * Envia uma resposta de erro de acordo com a definição do arquivo de mensagens de erro.
 * @param {Object} res - Express Http Response
 * @param {number} statusCode - Código de Status HTTP
 * @param {number} codigoErro - Código de mensagem do erro
 * @param {number} codigoDetalheErro - Código de detalhamento do erro
 * @param {Object} parametros - Parametros da mensagem de erro (Key/Value)
 */
const error = (res, statusCode, codigoErro, codigoDetalheErro, parametros) => {
    try {
        throwError(statusCode, codigoErro, codigoDetalheErro, parametros)
    } catch(error) {
        Http.Response.error(res, error);
    }
}

/**
 * Envia uma resposta de erro a partir de qualquer tipo de erro.
 * @param {Object} res - Express Http Response
 * @param {Error} error - Error type
 */
const fromError = (res, error) => {
    Http.Response.error(res, error);
}

setup();

module.exports = {
    Config: { setup },
    YAMLReader: {
        readYAML: YAMLReader.readYAML
    },
    Logger: { 
        log: Logger.log,
        trace: Logger.trace,
        debug: Logger.debug,
        info: Logger.info,
        warn: Logger.warn,
        error: Logger.error,
        fatal: Logger.fatal,
        LOG_LEVEL: Logger.LOG_LEVEL 
    },
    Request: {
        makeRequest: Http.Request.makeRequest,
        get: Http.Request.get,
        put: Http.Request.put,
        post: Http.Request.post,
        del: Http.Request.del,
        patch: Http.Request.patch,
        configParams: Http.Request.configParams,
        HTTP_METHOD: Http.Request.HTTP_METHOD
    },
    Response: {
        success: Http.Response.success,
        successPlain: Http.Response.successPlain,
        created: Http.Response.created,
        noContent: Http.Response.noContent,
        error: error,
        fromError: fromError,
        CONTENT_TYPE: Http.Response.CONTENT_TYPE,
        HTTP_STATUS: Http.Response.HTTP_STATUS
    },
    Err: { 
        throwError,
        throwInternalError
    },
    ResponseError: Err.ResponseError
}