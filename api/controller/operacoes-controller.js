const { Response, Logger } = require('../util');
const paramUtil = require('../helper/param-util');
const service = require('../service/operacao-service');

const WHATSAPP = 'WHATSAPP';

const criarOperacao = async (req, res, next) => {
    try {
        const tipo = req.headers.accept;
	    const operacaoFinanceira = req.body;
        const result = await service.criarOperacao({ contentType: tipo, operacaoFinanceira });
        const contentType = (tipo === Response.CONTENT_TYPE.APPLICATION_IMAGE) ? tipo : Response.CONTENT_TYPE.TEXT_PLAIN;
        Response.success(res, result, { contentType });
    } catch (err) {
        Logger.warn(err);
        Response.fromError(res, err);
    }
}

const consultarOperacoes = async (req, res, next) => {
    try {
        const params = paramUtil.getParams(req);
        const options = { ...params, cnpjInstituicao: params.cnpjinstituicao }
        const result = await service.consultarOperacoes(options);
        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_QR_PAGUE });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const consultarOperacao = async (req, res, next) => {
    try {
        const isWhatsApp = req.headers['user-agent'] === WHATSAPP ? true : false;
        const originalUrl = req.originalUrl;
        const params = paramUtil.getParams(req);
        const options = { ...params, cnpjInstituicao: params.cnpjinstituicao, isWhatsApp, originalUrl }
        
        const result = await service.consultarOperacao(options);

        if(isWhatsApp) {
            return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_XHTML });
        } else {
            return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_QR_PAGUE });
        }
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

        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
    } catch (err) {
        return Response.fromError(res, err);
    }
}

const confirmarOperacao = async (req, res, next) => {
    try {
        const options = paramUtil.getParams(req);
        const uuid = options.uuid;
        const confirmacao = req.body;
        const result = await service.receber({ uuid, confirmacao});

        return Response.success(res, result, { contentType: Response.CONTENT_TYPE.APPLICATION_JSON });
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