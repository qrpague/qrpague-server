const Logger = require('./logger');;
const Err = require('./error');
const Http = require('./http');
const YAMLInfo = require('./yaml/yaml-info');

/**
 * @type {Object} - Representação do arquivo YAML
 */
let Doc;

/**
 * 
 * @param {Object} options - Opções da biblioteca
 */
const initialize = (options) => {

    if(options && options.yaml && options.yaml.filePath) {
        let yamlOptions = { ...options.yaml }
        const yamlFilePath = yamlOptions.filePath;
        Doc = new YAMLInfo(yamlFilePath);
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
 * @param {number} statusCode - Http status code
 * @param {number} typeCode - type_code da mensagem
 * @param {number} instanceCode - instance_code da mensagem
 * @param {Object} params - Parâmetros da mensagem
 */
const throwError = (statusCode, typeCode, instanceCode, params) => {
    if(!Doc) {
        throwInternalError(new Error('Você precisa inicializar a configuração do arquivo YAML nas opções de inicialização.'));
    }
    Err.throwError(Doc, statusCode, typeCode, instanceCode, params);
}

/**
 * Lança um @throws {ResponseError}
 * @param {Error} error - Qualquer tipo de erro.
 */
const throwInternalError = (error) => {
    Err.throwInternalError(error);
}

module.exports = {
    Config: { initialize },
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
        error: Http.Response.error,
        CONTENT_TYPE: Http.Response.CONTENT_TYPE,
        HTTP_STATUS: Http.Response.HTTP_STATUS
    },
    Err: { 
        throwError,
        throwInternalError
    },
    ResponseError: Err.ResponseError,
}