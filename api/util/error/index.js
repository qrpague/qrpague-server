const ResponseError = require('./response-error');
const HTTP_STATUS = require('../http/http-status');

/**
 * Throw a `ResponseError`
 * @param {YAMLInfo} doc - Representação do arquivo de Yaml de mensagens de erro.
 * @param {number} statusCode - Código de Status HTTP
 * @param {number} codigoErro - Código de mensagem do erro
 * @param {number} codigoDetalheErro - Código de detalhamento do erro
 * @param {Object} parametros - Parametros da mensagem de erro (Key/Value)
 * @throws {ResponseError} - Throw a `ResponseError`
 */
const throwError = (doc, statusCode, codigoErro, codigoDetalheErro, parametros) => {
    let error = doc.find(codigoErro, codigoDetalheErro, parametros);
    if(!error) {
        throwInternalError(new Error('No specific error found.'))
    }
    error = { ...error, statusCode }
    throw new ResponseError(error);
}

/**
 * Throw a `ResponseError`
 * @param {Error} err - Any type of error.
 * @throws {ResponseError} - Throw a `ResponseError`
 */
const throwInternalError = (err) => {
    let error = {
        codigoErro: 0,
        mensagemErro: "Erro Interno",
        codigoDetalheErro: 0,
        detalheErro: err.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    }
    throw new ResponseError(error);
}

module.exports = {
    ResponseError,
    throwError,
    throwInternalError
};
