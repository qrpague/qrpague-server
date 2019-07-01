const { Response, Logger } = require('../util');
const paramUtil = require('../helper/param-util');
const service = require('../service/operacao-service');
const { CONSTANTS } = require('../jwt');

const WHATSAPP = 'WHATSAPP';

const criarOperacao = async (req, res, next) => {
    try {
        const tipo = req.headers.accept;
	    const operacaoFinanceira = req.body;
        const result = await service.criarOperacao({ contentType: tipo, operacaoFinanceira });
        const contentType = (tipo === Response.CONTENT_TYPE.APPLICATION_IMAGE) ? tipo : Response.CONTENT_TYPE.TEXT_PLAIN;
        Response.created(res, result, { contentType });
    } catch (err) {
        Logger.warn(err);
        Response.fromError(res, err);
    }
}

const consultarOperacoes = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const tokenInstituicao = params[CONSTANTS.TOKEN_NAME];
        const options = { ...params, tokenInstituicao }
        const result = await service.consultarOperacoes(options);
        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_QR_PAGUE });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const consultarOperacao = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const tokenInstituicao = params[CONSTANTS.TOKEN_NAME];
        const options = { ...params, tokenInstituicao }
        
        const result = await service.consultarOperacao(options);
        
        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_QR_PAGUE });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const autorizarOperacao = async (req, res, next) => {
    try {
        const options = paramUtil.getParams(req);
        const uuid = options.uuid;
        const autorizacao = req.body;
        const result = await service.autorizarOperacao({ uuid, autorizacao});

        return Response.created(res, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const confirmarOperacao = async (req, res, next) => {
    try {
        const options = paramUtil.getParams(req);
        const uuid = options.uuid;
        const confirmacao = req.body;
        const result = await service.confirmarOperacao({ uuid, confirmacao});

        return Response.created(res, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

module.exports = {
    criarOperacao,
    consultarOperacoes,
    consultarOperacao,
    autorizarOperacao,
    confirmarOperacao
};