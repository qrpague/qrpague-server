const HTTP_STATUS = require('./http-status');
const CONTENT_TYPE = require('./content-type');
const Logger = require('../logger/index');

let ResponseError = require('../error');

/**
 * Envia uma resposta de sucesso
 * @param {Object} res - Express Http Response
 * @param {Object} result - Response result
 * @param {Object} options  - Options
 */
const success = (res, result, options) => {
  makeResponse(res, HTTP_STATUS.OK, result, options);
}

/**
 * Envia uma resposta de criação com sucesso
 * @param {Object} res - Express Http Response
 * @param {Object} result - Response result
 * @param {Object} options  - Options
 */
const created = (res, result, options) => {
  makeResponse(res, HTTP_STATUS.CREATED, result, options);
}

/**
 * Envia uma resposta sem conteúdo
 * @param {Object} res - Express Http Response
 * @param {Object} options  - Options
 * @returns {Object} - Http Response 
 */
const noContent = (res, options) => {
  makeResponse(res, HTTP_STATUS.NO_CONTENT, null, options);
}

/**
 * Envia uma resposta de erro
 * @param {Object} res - Express Http Response
 * @param {Error} error - Error type
 */
const error = (res, error) => {
  let err = error;
  if (!(error instanceof ResponseError.ResponseError)) {
    try{
      ResponseError.throwInternalError(error);
    } catch(e) {
      Logger.error(e);
      err = e;
    }
  }
  sendError(res, err);
}

/**
 * Envia uma resposta Http
 * @param {Object} response - Express Http Response
 * @param {number} status - Http status code
 * @param {Object} result - Result response
 * @param {String} options - Options
 */
function makeResponse(response, status, result, options){
  let type = (!options.contentType) ? CONTENT_TYPE.JSON : options.contentType;
  
  Logger.debug('[Response] - Status Code', status, '- Content-Type:', type, '- Result =>', result);
  
  response.setHeader('Content-Type', type);
  if(result){
    response.status(status).send(result);
  }
  else {
    response.status(status).end();
  }
}

/**
 * Envia um @throws {ResponseError}
 * @param {Object} res - Objeto resposta do Express
 * @param {ResponseError} error - ResponseError
 */
function sendError(res, error){
  error.dataReferencia = new Date();
  const { statusCode, ...responseError } = error;
	res.status(statusCode).json(responseError);
}

module.exports = {
  makeResponse,
  success,
  created,
  noContent,
  error,
  HTTP_STATUS,
  CONTENT_TYPE
}