const HTTP_STATUS = require('./http-status');
const CONTENT_TYPE = require('./content-type');
const Logger = require('../logger/index');

let ResponseError = require('../error');

/**
 * Envia uma resposta de sucesso
 * @param {Object} res - Express Http Response
 * @param {Object} result - Response result
 * @param {Object} options  - Options
 * @returns {Object} - Http Response 
 */
const success = (res, result, options) => {
  return makeResponse(res, HTTP_STATUS.OK, result, options);
}

/**
 * Envia uma resposta de criação com sucesso
 * @param {Object} res - Express Http Response
 * @param {Object} result - Response result
 * @param {Object} options  - Options
 * @returns {Object} - Http Response 
 */
const created = (res, result, options) => {
  return makeResponse(res, HTTP_STATUS.CREATED, result, options);
}

/**
 * Envia uma resposta sem conteúdo
 * @param {Object} res - Express Http Response
 * @param {Object} options  - Options
 * @returns {Object} - Http Response 
 */
const noContent = (res, options) => {
  return makeResponse(res, HTTP_STATUS.NO_CONTENT, null, options);
}

/**
 * Envia uma resposta de erro
 * @param {Object} res - Express Http Response
 * @param {Error} error - Error type
 * @returns {Object} - Http Response Error
 */
const error = (res, error) => {
  let err = error;
  if (!(error instanceof ResponseError.ResponseError)) {
    try{
      ResponseError.throwInternalError(error);
    } catch(e) {
      Logger.error(returnError);
      err = e;
    }
  }
  return sendError(res, error);
}

/**
 * Envia uma resposta Http
 * @param {Object} response - Express Http Response
 * @param {number} status - Http status code
 * @param {Object} result - Result response
 * @param {String} options - Options
 * @returns {Object} - Http Response 
 */
function makeResponse(response, status, result, options){
  let type = (!options.contentType) ? CONTENT_TYPE.JSON : options.contentType;
  
  res.setHeader('Content-Type', type);

  if(result){
    return response.status(status).send(result);
  }
  else {
    return response.status(status).end();
  }
}

/**
 * Envia um @throws {ResponseError}
 * @param {Object} res - Objeto resposta do Express
 * @param {ResponseError} error - ResponseError
 * @returns {Object} - Http Response Error
 */
function sendError(res, error){
	return res.status(error.statusCode).json(error);
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