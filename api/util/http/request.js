const request = require('request');
const q = require('q');
const Logger = require('../logger/index');
const Err = require('../error/index');
const HTTP_METHOD = require('./http-method');

/**
 * Constrói as opções para uma requisição Http.
 * @param {string} method - Método Http.
 * @param {string} url - URI
 * @param {Object} header - Http headers
 * @param {Object} body - Http Body
 * @returns {Object} - Retorna as opções
 */
const buildJsonOptions = (method, url, body, header) => {
    
    let options = {
        method: method,
        url: url,
        headers: header || getJsonHeader()
    }

    if(method !== HTTP_METHOD.GET) {
        options = { ...options, json: true, body: body }
    }

    return options;
}

/**
 * Gera valores padrões para headers
 * @returns {Object} - Retorna um objeto
 */
const getJsonHeader = () => {
    return {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
}

/**
 * Tranforma String em JSON
 * @param {string} data - String
 * @returns {Object} - JSON
 */
const parseJson = (data) => {
    var parsed;

    try {
        parsed = JSON.parse(data);
    } catch (e) {
        parsed = JSON.parse(JSON.stringify(data));
    }
    return parsed;
}

/**
 * Esse é um método de callback para Http
 * @param {Object} deferred - Deferred promise
 * @param {Error} error - Error
 * @param {Object} response - Resposta Htto
 * @param {Object} body - Http body
 */
const makeCallback = (deferred, error, response, body) => {
    if (error) {
        var returnError = Err.throwInternalError(error);
        Logger.error(returnError);
        deferred.reject(returnError);
    } else if (body && body.requestError) {
        var error = body.requestError.serviceException;
        var returnError = Err.throwInternalError(error);
        Logger.error(returnError);
        Logger.reject(returnError);
    } else if (response && response.statusCode >= 400) {
        let jsonErr = parseJson(body);
        if (jsonErr.typeCode && jsonErr.type && jsonErr.title && jsonErr.statusCode) {
            let returnError = new Err.ResponseError(jsonErr);
            deferred.reject(returnError);
        } else {
            deferred.reject(new Err.ResponseError(jsonErr));
        }
    } else {
        if(body){
            deferred.resolve(parseJson(body));
        } else {
            deferred.resolve();
        }
            
    }
}

/**
 * Faz uma requisição Http
 * @param {string} method - Método http
 * @param {string} url - Http Request URI
 * @param {Object} body - Http body
 * @param {Object} header - Http headers
 * @returns {Promise} - Retorna uma requisição Http em uma Promise
 */
const makeRequest = (method, url, body, header) => {
    var deferred = q.defer();
    var options = buildJsonOptions(method, url, body, header);
    Logger.debug(method, url);
    request(
        options,
        function (error, response, body) {
            makeCallback(deferred, error, response, body);
        }
    );
    return deferred.promise;
}

/**
 * Faz uma requisição do tipo GET
 * @param {string} url - URI
 * @param {Object} header - Http headers
 * @returns {Object} - Retorna uma resposta HTTP
 */
const get = async (url, header) => {
    return await makeRequest(HTTP_METHOD.GET, url, header);
}

/**
 * Faz uma requisição do tipo POST
 * @param {string} url - URI
 * @param {Object} body - Http body
 * @param {Object} header - Http headers
 * @returns {Object} - Retorna uma resposta HTTP
 */
const post = async (url, body, header) => {
    return await makeRequest(HTTP_METHOD.POST, url, body, header);
}

/**
 * Faz uma requisição do tipo PUT
 * @param {string} url - URI
 * @param {Object} body - Http body
 * @param {Object} header - Http headers
 * @returns {Object} - Retorna uma resposta HTTP
 */
const put = async (url, body, header) => {
    return await makeRequest(HTTP_METHOD.PUT, url, body, header);
}

/**
 * Faz uma requisição do tipo DELETE
 * @param {string} url - URI
 * @param {Object} body - Http body
 * @param {Object} header - Http headers
 * @returns {Object} - Retorna uma resposta HTTP
 */
const del = async (url, body, header) => {
    return await makeRequest(HTTP_METHOD.DELETE, url, body, header);
}

/**
 * Faz uma requisição do tipo PATCH
 * @param {string} url - URI
 * @param {Object} body - Http body
 * @param {Object} header - Http headers
 * @returns {Object} - Retorna uma resposta HTTP
 */
const patch = async (url, body, header) => {
    return await makeRequest(HTTP_METHOD.PATCH, url, body, header);
}

/**
 * Constrói um queryParams em formato JSON para uma String
 * @param {Object} params - Http query parameteres
 * @returns {string} - Query parameters em um formato String
 */
const configParams = (params) => {
    let query = '';
    for (let prop in params) {
        if (params[prop])
            query += `&${prop}=${params[prop]}`;
    }

    query = query.replace(/^&/, '?');
    Logger.debug(`configParams: ${query}`);

    return query;
}

module.exports = {
    makeRequest,
    get,
    put,
    post,
    del,
    patch,
    configParams,
    HTTP_METHOD
};
