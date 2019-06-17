const { INTERNAL_SERVER_ERROR } = require('../http/http-status');

/**
 * ResponseError
 * @typedef {Object} ResponseError
 * @property {number} codigoErro - Código da mensagem em um nível mais alto
 * @property {string} mensagemErro - Título da mensagem
 * @property {number} codigoDetalheErro - Código da mensagem em um nível mais detalhado
 * @property {string} detalheErro - Mensagem detalhada
 * @property {number} statusCode - Código do status Http
 * @property {Object} parametros - Parâmetros da mensagem de erro
 */
class ResponseError extends Error{
	
	constructor({
        codigoErro,
        mensagemErro,
        codigoDetalheErro,
        detalheErro,
        statusCode,
        parametros
    }) {
        super( (detalheErro ? detalheErro : mensagemErro) );
        this.statusCode = statusCode;
        this.codigoErro = codigoErro;
        this.mensagemErro = mensagemErro;
        this.codigoDetalheErro = codigoDetalheErro;
        this.detalheErro = detalheErro;
        this.parametros = parametros;
        
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else { 
            this.stack = (new Error(this.message)).stack; 
        }
    }
}

module.exports = ResponseError;