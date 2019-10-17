const { CONSTANTS } = require('../jwt');
const { Response, ResponseError, Err, Logger } = require('../util');
const { campoObrigatorio } = require('./commum');

const requisicaoConsultarBeneficiarios = (params) => {

    try {

        campoObrigatorio('token-instituicao', params[CONSTANTS.TOKEN_NAME]);

        let requisicao = {
            tokenInstituicao: params[CONSTANTS.TOKEN_NAME],
        }

        if(params.cpfCnpj) {
            requisicao = { ...requisicao, cpfCnpj: params.cpfCnpj }
        }

        return requisicao;

    } catch(err) {
        Logger.warn(err);
        if(!(err instanceof ResponseError)){
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 997000);
		}
        throw err;
    }
}

const requisicaoConsultarBeneficiario = (params) => {

    try {

        campoObrigatorio('token-instituicao', params[CONSTANTS.TOKEN_NAME]);
        campoObrigatorio('cpfCnpj', params.cpfCnpj);

        let requisicao = {
            tokenInstituicao: params[CONSTANTS.TOKEN_NAME],
            cpfCnpj: params.cpfCnpj
        }

        return requisicao;

    } catch(err) {
        Logger.warn(err);
        if(!(err instanceof ResponseError)){
			Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 997000);
		}
        throw err;
    }
}

module.exports = {
    requisicaoConsultarBeneficiarios,
    requisicaoConsultarBeneficiario
}