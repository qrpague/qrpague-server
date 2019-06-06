const { INTERNAL_SERVER_ERROR } = require('../http/http-status');
const MSG_ERROR_SERVER = "Oops, something was wrong, please try again.";

/**
 * ResponseError
 * @typedef {Object} ResponseError
 * @property {number} typeCode - Código da mensagem em um nível mais alto
 * @property {string} title - Título da mensagem
 * @property {number} instanceCode - Código da mensagem em um nível mais detalhado
 * @property {string} detail - Mensagem detalhada
 * @property {number} statusCode - Código do status Http
 */
class ResponseError {
	
	constructor({
        typeCode,
        type,
        title,
        instanceCode,
        instance,
        detail,
        statusCode,
        params
    }) {
        this.typeCode = typeCode;
        this.type = type;
        this.title = title;
        this.instanceCode = instanceCode;
        this.instance = instance;
        this.detail = detail;
        this.statusCode = statusCode;
        this.params = params;
    }
}

module.exports = ResponseError;