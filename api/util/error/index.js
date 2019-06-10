const ResponseError = require('./response-error');
const HTTP_STATUS = require('../http/http-status');

/**
 * Throw a `ResponseError`
 * @param {YAMLInfo} doc - Representation of Yaml message file in an instance
 * @param {number} statusCode - Http status code
 * @param {number} typeCode - Message Type Code
 * @param {number} instanceCode - Message Instance Code
 * @param {Object} params - Params (Key/Value) of the messages
 * @throws {ResponseError} - Throw a `ResponseError`
 */
const throwError = (doc, statusCode, typeCode, instanceCode, params) => {
    let error = doc.find(typeCode, instanceCode, params);
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
        typeCode: 0,
        type: "abount:blank",
        title: "Internal Error",
        detail: err.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    }
    throw new ResponseError(error);
}

module.exports = {
    ResponseError,
    throwError,
    throwInternalError
};
